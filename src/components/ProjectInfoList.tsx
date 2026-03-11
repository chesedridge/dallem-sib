const INFO_ITEMS = [
  {
    label: "대상자",
    value:
      "정서 , 관계 등의 어려움을 겪고 있는 경기도 거주자 또는 경기도 직장인",
  },
  {
    label: "상담 방식",
    value: "비대면 (전화 또는 화상)",
  },
  {
    label: "지원 내용",
    value: "1인당 최대 4회 (무료상담)",
  },
  {
    label: "참여 기간",
    value: "2026년 12월 31일 까지",
  },
  {
    label: "참여 방법",
    value: "우울증 테스트 진행 후 결과에 따라 상담 신청",
  },
    {
    label: "이용문의",
    value: "카카오톡 채널 달램 (Dallem)’ 또는 help@dallem.com",
  },
];

export default function ProjectInfoList({ className }: { className: string }) {
  return (
    <div
      className={`${className} mx-auto max-w-150 overflow-hidden rounded-[20px] bg-bg-warm-light/90 px-8 py-4 shadow-[0_2px_12px_rgba(240,135,119,0.08)] md:max-w-210 md:rounded-3xl md:px-20 md:py-6`}
    >
      {INFO_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center py-3 md:py-0.5">
          <span className="text-left shrink-0 px-4 py-1.5 text-[12px] w-26 font-bold text-primary-strong md:px-5 md:py-2 md:text-[15px]">
            {item.label}
          </span>
          <span className="text-[13px] leading-7 text-text-body md:text-[16px] md:leading-8">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
