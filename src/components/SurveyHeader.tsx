type SurveyHeaderProps = {
  stageLabel?: string;
};

export function SurveyHeader({ stageLabel }: SurveyHeaderProps) {
  return (
    <header className="-mx-5 bg-bg-warm px-5 pt-6 pb-5 text-center sm:-mx-7 sm:px-7 md:pt-10 lg:-mx-10 lg:px-10">
      <p className="mx-auto mb-2 max-w-[42rem] break-keep text-[15px] font-normal tracking-[-0.03em] text-[var(--color-primary-strong)] md:text-[22px]">
        <strong className="font-bold">경기도 거주 직장인</strong> 또는<br />
        <strong className="font-bold">경기도 소재 회사에 재직중인 직장인</strong>을 위한
      </p>
      <h1 className="mb-3 text-[26px] font-extrabold leading-[1.2] tracking-[-0.04em] text-[var(--color-text-dark)] md:text-[38px]">
        멘탈케어 프로젝트
      </h1>
      {stageLabel ? (
        <p className="mv-apply-stage-label">{stageLabel}</p>
      ) : (
        <p className="mv-apply-note">
          경기도 거주 또는 경기도 소재 회사 재직 여부와<br />
          우울검사(PHQ-9) 결과에 따라 대상자 여부가 결정됩니다.
        </p>
      )}
    </header>
  );
}
