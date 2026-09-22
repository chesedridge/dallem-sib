const INFO_ITEMS = [
  {
    label: "대상자",
    value: (
      <>
        <span className="whitespace-pre-wrap">
          정서, 관계 등의 어려움을 겪고 있는 경기도 거주 직장인 또는
          <br />
          경기도 소재 회사에 재직중인 직장인
        </span>
        <br />
        <span className="project-info-note">
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
    value: (
      <>
        기본 최대 4회 제공
        <br />
        <span className="project-info-sub">
          (사후 검사 결과에 따라 추가 2회기 제공)
        </span>
      </>
    ),
  },
  {
    label: "비용",
    value: "무료 제공",
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
        또는 <a href="mailto:help@dallem.com">help@dallem.com</a>
      </>
    ),
  },
];

export default function ProjectInfoList({ className }: { className: string }) {
  return (
    <dl className={`${className} project-info`}>
      {INFO_ITEMS.map((item) => (
        <div key={item.label} className="project-info-row">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
