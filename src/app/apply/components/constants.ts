import type { AnswerOption, InfoField, RespondentInfo, ResultBand } from "./types";

export const INFO_FIELDS: InfoField[] = [
  {
    key: "nickname",
    label: "이름 (또는 닉네임)",
    type: "text",
    placeholder: "닉네임을 입력해주세요",
    autoComplete: "nickname",
    inputMode: "text",
  },
  {
    key: "contact",
    label: "연락처",
    type: "text",
    placeholder: "예: 01012345678",
    autoComplete: "tel",
    inputMode: "numeric",
    maxLength: 11,
    pattern: "^010\\d{7,8}$",
  },
  {
    key: "residence",
    label: "거주지",
    type: "select",
    options: [
      "가평군",
      "고양시",
      "과천시",
      "광명시",
      "광주시",
      "구리시",
      "군포시",
      "김포시",
      "남양주시",
      "동두천시",
      "부천시",
      "성남시",
      "수원시",
      "시흥시",
      "안산시",
      "안성시",
      "안양시",
      "양주시",
      "양평군",
      "여주시",
      "연천군",
      "오산시",
      "용인시",
      "의왕시",
      "의정부시",
      "이천시",
      "파주시",
      "평택시",
      "포천시",
      "하남시",
      "화성시",
    ],
  },
];

export const DEFAULT_DEBUG_RESIDENCE =
  INFO_FIELDS.find((field) => field.key === "residence")?.options?.[0] ?? "";
export const PHONE_PATTERN = /^010\d{7,8}$/;

export const QUESTIONS = [
  "기분이 가라앉거나 우울하거나 희망이 없다고 느꼈다.",
  "평소 하던 일에 대한 흥미가 없어지거나 즐거움을 느끼지 못했다.",
  "잠들기가 어렵거나 자주 깼다. / 혹은 너무 많이 잤다.",
  "평소보다 식욕이 줄었다. / 혹은 평소보다 많이 먹었다.",
  "다른 사람들이 눈치 챌 정도로 평소보다 말과 행동이 느려졌다. / 혹은 너무 안절부절 못해서 가만히 앉아있을 수 없다.",
  "피곤하고 기운이 없었다.",
  "내가 잘못했거나, 실패했다는 생각이 들었다. / 혹은 자신과 가족을 실망시켰다고 생각했다.",
  "신문을 읽거나 TV를 보는 것과 같은 일상적인 일에도 집중할 수가 없었다.",
  "차라리 죽는 것이 더 낫겠다고 생각했다. / 혹은 자해할 생각을 했다.",
] as const;

export const DEFAULT_DEBUG_ANSWERS = Array.from(
  { length: QUESTIONS.length },
  () => 1,
);

export const DEFAULT_DEBUG_INFO: RespondentInfo = {
  nickname: "디버그 사용자",
  contact: "01012345678",
  residence: DEFAULT_DEBUG_RESIDENCE,
  privacyConsent: true,
};

export const ANSWER_OPTIONS: AnswerOption[] = [
  { label: "없음", score: 0 },
  { label: "2~6일", score: 1 },
  { label: "7~12일", score: 2 },
  { label: "거의 매일", score: 3 },
];

export const RESULT_BANDS: ResultBand[] = [
  {
    min: 0,
    max: 4,
    title: "0~4점 : 정상",
    description: "유의한 수준의 우울감이 시사되지 않습니다.",
  },
  {
    min: 5,
    max: 9,
    title: "5~9점 : 가벼운 우울",
    description:
      "다소 경미한 수준의 우울감이 있으나 일상생활에 지장을 줄 정도는 아닙니다. 다만, 이러한 기분상태가 지속되면 개인의 신체적, 심리적 대처 자원을 저하시킬 수 있습니다.",
  },
  {
    min: 10,
    max: 19,
    title: "10~19점 : 중간정도의 우울",
    description:
      "중간 정도 수준의 우울감이 시사됩니다. 이러한 수준의 우울감은 흔히 신체적, 심리적 대처 자원을 저하시키며 개인의 일상생활을 어렵게 만들기도 합니다.",
  },
  {
    min: 20,
    max: 27,
    title: "20~27점 : 심한 우울",
    description:
      "심한 수준의 우울감이 시사됩니다. 정신건강의학과의 치료적 개입과 평가가 요구됩니다.",
  },
];

export function findResultBand(totalScore: number) {
  return (
    RESULT_BANDS.find(
      (band) => totalScore >= band.min && totalScore <= band.max,
    ) ?? RESULT_BANDS[0]
  );
}
