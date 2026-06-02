const INFO_ITEMS = [
  {
    label: "대상자",
    value: (
      <>
        <span className="whitespace-pre-wrap">
          정서 , 관계 등의 어려움을 겪고 있는 경기도 거주자 또는
          <br />
          경기도 소재 회사에 재직중인 직장인
        </span>
        <br />
        <span className="whitespace-pre-wrap text-[12px] md:text-[14px]">
          ※ <b>경기도와 관련된</b> 사업장이 있는 기업에 재직 중이라면 
          <b>대부분 참여 가능</b>합니다.
        </span>
      </>
    ),
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
    value: "2027년 5월 31일까지",
  },
  {
    label: "참여 방법",
    value: "우울증 테스트 진행 후 결과에 따라 상담 신청",
  },
  {
    label: "이용문의",
    value: (
      <>
        카카오톡 채널{" "}
        <a
          href="http://pf.kakao.com/_NhcZT"
          target="_blank"
          className="hidden md:inline-block font-bold text-primary-strong! hover:underline! underline-offset-3!"
        >
          달램(Dallem)<sup>↗</sup>
        </a>
        <a
          href="http://pf.kakao.com/_NhcZT/chat"
          target="_blank"
          className="md:hidden font-bold text-primary-strong! hover:underline! underline-offset-3!"
        >
          달램(Dallem)<sup>↗</sup>
        </a>{" "}
        또는 help@dallem.com
      </>
    ),
  },
];

export default function ProjectInfoList({ className }: { className: string }) {
  return (
    <div
      className={`${className} mx-auto flex flex-col gap-0 md:gap-4 max-w-150 overflow-hidden rounded-[20px] bg-bg-warm-light/90 px-8 py-4 shadow-[0_2px_12px_rgba(240,135,119,0.08)] md:max-w-210 md:rounded-3xl md:px-20 md:py-6`}
    >
      {INFO_ITEMS.map((item) => (
        <div key={item.label} className="flex items-start py-2 md:py-0.5">
          <span className="text-left shrink-0 px-4 text-[14px] w-26 font-bold text-primary-strong md:px-5 md:text-[15px]">
            {item.label}
          </span>
          <span className="text-left text-[14px] leading-5 text-text-body md:text-[16px] md:leading-6 whitespace-break-spaces">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
