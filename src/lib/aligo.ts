const ALIGO_SEND_URL = "https://apis.aligo.in/send/";
// 알리고는 EUC-KR 바이트 수(한글 2바이트) 기준 90바이트 초과 시 장문(LMS)으로 보내야 한다.
const SMS_BYTE_LIMIT = 90;
const DEFAULT_LMS_TITLE = "경기도 마음건강 지원 서비스 이용 안내";
const DEFAULT_SMS_TEMPLATE = `안녕하세요.
경기도 마음건강 지원 서비스 신청자분께 이용 안내 말씀드립니다.

본 서비스는 우울증 개선 및 자살예방 SIB 사업의 일환으로, 경기도 거주자 또는 경기도 소재 직장 재직자를 대상으로 제공되는 무료 심리상담 지원 사업입니다. 달램은 블라인드를 통해 신청된 본 사업의 심리상담 서비스를 운영하는 플랫폼입니다. 정서적 어려움이 있으신 분이라면 부담 없이 시작해 보세요.

[ 이용 방법 ]
1. 아래 링크로 접속 후 회원가입
https://maum.dallem.com/employee/login

2. 회원가입 시 정보 입력 (필수)
- 코드 입력 (Gyeonggi)
- 거주지 또는 근무지 선택

3. 플랫폼 내에서 원하시는 전문가를 직접 선택하신 후 상담 신청

[ 이용 안내 ]
- 이용 기간: ~2027년 5월 31일
- 이용 횟수: 1인당 최대 4회 (무료)
- 상담 방식: 비대면 전용 (전화 또는 화상)

궁금하신 점은 언제든지 카카오톡 채널로 편하게 문의해 주세요.

http://pf.kakao.com/_NhcZT/chat

마음 건강한 하루 보내세요.`;

export type AligoConfig = {
  apiKey: string;
  userId: string;
  sender: string;
};

export function getAligoConfig(): AligoConfig | null {
  const apiKey = process.env.ALIGO_API_KEY?.trim();
  const userId = process.env.ALIGO_USER_ID?.trim();
  const sender = process.env.ALIGO_SENDER?.trim();

  if (!apiKey || !userId || !sender) {
    return null;
  }

  return { apiKey, userId, sender };
}

export function buildSurveyConfirmationSms(nickname: string) {
  const template = process.env.ALIGO_SMS_TEMPLATE?.trim() || DEFAULT_SMS_TEMPLATE;

  return template.replaceAll("{닉네임}", nickname);
}

export function maskPhoneNumber(phoneNumber: string) {
  if (phoneNumber.length < 8) {
    return "****";
  }

  return `${phoneNumber.slice(0, 3)}****${phoneNumber.slice(-4)}`;
}

function messageByteLength(message: string) {
  let bytes = 0;

  for (const char of message) {
    bytes += char.charCodeAt(0) > 0x7f ? 2 : 1;
  }

  return bytes;
}

type AligoSendResponse = {
  result_code?: number | string;
  message?: string;
  msg_id?: number | string;
};

export async function sendAligoSms(receiver: string, message: string) {
  const config = getAligoConfig();

  if (!config) {
    throw new Error(
      "알리고 환경변수(ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER)가 설정되지 않았습니다.",
    );
  }

  const msgType = messageByteLength(message) > SMS_BYTE_LIMIT ? "LMS" : "SMS";
  const body = new URLSearchParams({
    key: config.apiKey,
    user_id: config.userId,
    sender: config.sender,
    receiver,
    msg: message,
    msg_type: msgType,
  });

  if (msgType === "LMS") {
    body.set("title", process.env.ALIGO_SMS_TITLE?.trim() || DEFAULT_LMS_TITLE);
  }

  if (process.env.ALIGO_TEST_MODE === "Y") {
    body.set("testmode_yn", "Y");
  }

  const response = await fetch(ALIGO_SEND_URL, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error(`알리고 API 호출에 실패했습니다. (HTTP ${response.status})`);
  }

  const result = (await response.json()) as AligoSendResponse;
  const resultCode = Number(result.result_code);

  if (resultCode !== 1) {
    throw new Error(
      `알리고 문자 발송에 실패했습니다. (code ${result.result_code ?? "?"}: ${result.message ?? "unknown"})`,
    );
  }

  return { msgId: result.msg_id, message: result.message ?? "" };
}
