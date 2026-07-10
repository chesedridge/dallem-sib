"use client";

export function ApplySubmittedStep() {
  return (
    <section className="mt-8 bg-bg-white text-center md:mt-16 md:rounded-[36px] md:border md:border-border-soft md:p-14">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.03em] text-text-dark md:text-3xl">
          신청이 정상적으로 접수되었습니다
        </h2>
        <p className="text-[15px] leading-7 whitespace-pre-line break-keep text-text-body md:text-[18px] md:leading-8">
          달램 담당자가 입력하신 연락처로 자세한 사항을 안내드릴 예정이오니
          조금만 기다려주세요.
          {"\n"}궁금하신 사항이 있다면 카카오톡 채널{" "}
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
    </section>
  );
}
