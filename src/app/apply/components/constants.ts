import type {
  AnswerOption,
  InfoField,
  RespondentInfo,
  ResultBand,
} from "./types";

export const INFO_FIELDS: InfoField[] = [
  {
    key: "nickname",
    label: "닉네임 (또는 이름)",
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
];

export const CONSULTATION_METHOD_OPTIONS = ["화상상담", "전화상담"] as const;

export const CONSULTATION_TOPIC_OPTIONS = [
  "우울감·무기력",
  "불안·과도한 걱정",
  "스트레스 관리",
  "감정 조절 어려움",
  "자존감·자신감 저하",
  "대인관계 어려움",
  "직장 내 소통·관계 갈등",
  "업무 과부하·번아웃",
  "직무 적응·커리어 고민",
  "가족 관계 고민",
  "부부·연인 관계 고민",
  "수면 문제",
  "삶의 의미·동기 저하",
  "기타",
] as const;

export const SUPPORT_TOPIC_OPTIONS = [
  "우울감·무기력",
  "불안·과도한 걱정",
  "스트레스 관리",
  "감정 조절 어려움",
  "자존감·자신감 저하",
  "대인관계 어려움",
  "직장 내 소통·관계 갈등",
  "업무 과부하·번아웃",
  "직무 적응·커리어 고민",
  "가족 관계 고민",
  "부부·연인 관계 고민",
  "수면 문제",
  "삶의 의미·동기 저하",
  "기타",
] as const;

export const HARDSHIP_LEVEL_OPTIONS = [
  "가벼운 편",
  "견디기 버거운 편",
  "일상에 영향을 주는 편",
  "매우 심한 편",
] as const;

export const EXPECTED_SUPPORT_OPTIONS = [
  "감정을 정리하고 싶어요",
  "문제 원인을 이해하고 싶어요",
  "스트레스 대처 방법을 알고 싶어요",
  "관계 문제를 풀고 싶어요",
  "당장 실질적인 도움을 받고 싶어요",
  "잘 모르겠어요",
] as const;

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
  consultationMethod: CONSULTATION_METHOD_OPTIONS[0],
  consultationTopic: CONSULTATION_TOPIC_OPTIONS[0],
  consultationTopicDetail: "",
  supportTopics: [],
  supportTopicsDetail: "",
  hardshipLevel: HARDSHIP_LEVEL_OPTIONS[0],
  expectedSupport: [],
  preferredSchedules: [],
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
      "다소 경미한 수준의 우울감이 있으나 일상생활에 지장을 줄 정도는 아닙니다.\n다만, 이러한 기분상태가 지속되면 개인의 신체적, 심리적 대처 자원을 저하시킬 수 있습니다.\n앞으로 진행될 심리상담이 현재의 어려움을 덜어내고 일상을 회복하는 데 도움이 되기를 바랍니다.",
  },
  {
    min: 10,
    max: 19,
    title: "10~19점 : 중간정도의 우울",
    description:
      "중간 정도 수준의 우울감이 시사됩니다. \n이러한 수준의 우울감은 흔히 신체적, 심리적 대처 자원을 저하시키며\n 개인의 일상생활을 어렵게 만들기도 합니다.\n\n앞으로 진행될 심리상담이 현재의 어려움을 덜어내고 일상을 회복하는 데 도움이 되기를 바랍니다.",
  },
  {
    min: 20,
    max: 27,
    title: "20~27점 : 심한 우울",
    description:
      "현재 우울감 수준이 높게 나타나, 보다 세심한 이해와 지원이 필요한 상태로 보입니다. \n 심리상담을 통해 현재의 어려움을 함께 살펴보고 필요한 도움을 받아보실 수 있습니다.",
  },
];

export function findResultBand(totalScore: number) {
  return (
    RESULT_BANDS.find(
      (band) => totalScore >= band.min && totalScore <= band.max,
    ) ?? RESULT_BANDS[0]
  );
}
