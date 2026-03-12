"use client";

type ApplyIneligibleStepProps = {
  onRetry: () => void;
};

export function ApplyIneligibleStep({ onRetry }: ApplyIneligibleStepProps) {
  return (
    <section className="mt-14 rounded-[36px] border border-[var(--color-border-soft)] bg-bg-white p-8 text-center md:mt-16 md:p-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.03em] text-[var(--color-text-dark)] md:text-3xl">
          이번 프로젝트의 대상자가 아닙니다
        </h2>
        <p className="text-[15px] leading-7 whitespace-pre-line break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          본 프로젝트는 경기도 거주자 또는 경기도 내 직장인을 대상으로
          운영됩니다.
          <br />
          궁금하신 사항이 있다면 카카오톡 채널{" "}
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
          또는 help@dallem.com으로 연락주세요.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 rounded-full border border-[var(--color-border-strong)] bg-bg-white px-10 py-4 text-[16px] font-semibold text-[var(--color-text-body)] transition-colors hover:bg-bg-gray md:text-[17px]"
      >
        다시 확인하기
      </button>
    </section>
  );
}
