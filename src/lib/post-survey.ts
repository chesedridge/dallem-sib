import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { isValidAnswers, isPostTiming, type PostTiming } from "./survey-policy";
import {
  sheetRange,
  type GoogleSheetsConfig,
  type SheetsClient,
} from "./google";

export type PreSurveyRecord = {
  id: string;
  receivedAt: string;
  answers: number[];
  totalScore: number;
};
type Match = {
  record: PreSurveyRecord;
  contact: string;
  timing: PostTiming;
  expiresAt: number;
};
const normalizeContact = (value: unknown) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  // Legacy numeric Sheets cells may have lost the leading zero.
  return digits.startsWith("10") &&
    (digits.length === 9 || digits.length === 10)
    ? `0${digits}`
    : digits;
};

export function selectPreSurveyRecord(
  rows: unknown[][],
  contact: string,
  now = Date.now(),
): PreSurveyRecord | null {
  let latest: PreSurveyRecord | null = null;
  let latestTime = -Infinity;
  rows.forEach((row) => {
    if (normalizeContact(row[3]) !== contact) return;
    const receivedAt = String(row[0] ?? "");
    const time = Date.parse(receivedAt);
    if (!Number.isFinite(time) || time > now || time < latestTime) return;
    const cells = row.slice(12, 21);
    if (cells.some((v) => v === "" || v === null || v === undefined)) return;
    const answers = cells.map(Number);
    if (!isValidAnswers(answers)) return;
    const totalScore = answers.reduce((a, b) => a + b, 0);
    if (row[21] === "" || row[21] == null || Number(row[21]) !== totalScore)
      return;
    const id = createHash("sha256")
      .update(JSON.stringify([receivedAt, contact, answers]))
      .digest("hex");
    latest = { id, receivedAt, answers, totalScore };
    latestTime = time;
  });
  return latest;
}

export async function findPreSurveyRecord(
  sheets: SheetsClient,
  config: GoogleSheetsConfig,
  contact: string,
) {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: sheetRange(config.sheetName, "A4:V"),
  });
  return selectPreSurveyRecord(data.values ?? [], contact);
}

// Deliberately scoped to contact + timing, not nickname or the matched baseline.
// Sheets has no atomic uniqueness constraint; overlapping submissions can still race.
export async function hasCompletedPostSurvey(
  sheets: SheetsClient,
  spreadsheetId: string,
  contact: string,
  timing: PostTiming,
): Promise<boolean> {
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetRange("post-raw", "C2:O"),
  });
  const normalizedContact = normalizeContact(contact);
  return (data.values ?? []).some((row) => {
    if (!normalizedContact || normalizeContact(row[0]) !== normalizedContact)
      return false;
    const savedTiming = String(row[12] ?? "").replace(/\s/g, "");
    // Before timing was collected, the post-survey was the four-session survey.
    const normalizedTiming =
      savedTiming === "" || savedTiming === "4" || savedTiming === "4회기후"
        ? "4"
        : savedTiming === "6" || savedTiming === "6회기후"
          ? "6"
          : null;
    return normalizedTiming === timing;
  });
}

function key(secret: string) {
  return createHash("sha256").update(`post-survey-match-v1:${secret}`).digest();
}
// An authenticated, encrypted snapshot keeps the matched baseline stable without
// exposing pre-survey answers in the lookup response or trusting client scores.
export function createMatchToken(
  record: PreSurveyRecord,
  contact: string,
  timing: PostTiming,
  secret: string,
  now = Date.now(),
) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), iv);
  const payload: Match = {
    record,
    contact,
    timing,
    expiresAt: now + 2 * 60 * 60 * 1000,
  };
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString(
    "base64url",
  );
}

export function readMatchToken(
  token: unknown,
  contact: string,
  timing: PostTiming,
  secret: string,
  now = Date.now(),
): PreSurveyRecord | null {
  try {
    if (typeof token !== "string" || token.length > 4096) return null;
    const data = Buffer.from(token, "base64url");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key(secret),
      data.subarray(0, 12),
    );
    decipher.setAuthTag(data.subarray(12, 28));
    const match = JSON.parse(
      Buffer.concat([
        decipher.update(data.subarray(28)),
        decipher.final(),
      ]).toString("utf8"),
    ) as Match;
    if (
      match.expiresAt <= now ||
      match.contact !== contact ||
      !isPostTiming(match.timing) ||
      match.timing !== timing ||
      !isValidAnswers(match.record.answers)
    )
      return null;
    return match.record;
  } catch {
    return null;
  }
}
