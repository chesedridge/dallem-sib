export function ApplySurveyIneligibleStep() {
  return (
    <section
      aria-labelledby="survey-ineligible-title"
      className="mt-8 bg-bg-white md:mt-16 md:rounded-[36px] md:border md:border-[var(--color-border-soft)] md:p-14"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          id="survey-ineligible-title"
          className="text-center text-2xl font-extrabold leading-snug tracking-[-0.03em] break-keep text-[var(--color-text-dark)] md:text-3xl"
        >
          이번 프로젝트 대상자는 아니에요
        </h2>
        <p className="mt-5 text-[15px] leading-7 break-keep text-[var(--color-text-body)] md:text-[18px] md:leading-8">
          이 프로그램은 우울감과 함께 자살위험 신호가 있는 분들을 우선 지원하도록 마련되었어요. 지금 느끼시는 어려움이 가볍다는 뜻은 아니니, 편하게 다른 방법으로 이야기 나눠보세요.
        </p>

        <div className="mt-8 rounded-[28px] bg-bg-warm px-5 py-7 md:px-8 md:py-8">
          <h3 className="text-lg font-semibold leading-7 break-keep text-[var(--color-text-dark)] md:text-xl">
            <span aria-hidden="true">💬 </span>달램톡 — AI 심리상담 챗봇
          </h3>
          <p className="mt-3 text-[15px] leading-7 break-keep text-[var(--color-text-body)] md:text-base">
            24시간 언제든 편하게 마음을 나눠보실 수 있어요. 필요할 땐 전문 상담사 연결도 도와드려요.
          </p>
          <p className="mt-4 text-[15px] leading-7 break-keep text-[var(--color-text-body)] md:text-base">
            첫 이용 시 기업코드에 <strong className="font-bold text-[var(--color-text-dark)]">DALLEMTALK</strong>을 입력해주세요.
          </p>
          <a
            href="https://talk.app.dallem.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-center text-base font-semibold text-white! transition-colors hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong md:w-auto md:px-8"
          >
            달램톡과 대화하기 <span aria-hidden="true">→</span>
            <span className="sr-only">(새 탭에서 열기)</span>
          </a>
        </div>

        <aside aria-labelledby="crisis-support-title" className="mt-8 border-t border-[var(--color-border-soft)] pt-6">
          <h3 id="crisis-support-title" className="text-base font-semibold leading-7 text-[var(--color-text-dark)]">
            혹시 지금 많이 힘드신 상태라면
          </h3>
          <p className="mt-2 text-sm leading-6 break-keep text-[var(--color-text-body)] md:text-base md:leading-7">
            생각을 멈추기 어렵거나 위험하다고 느껴지신다면, 아래 번호로 24시간 언제든 연락하실 수 있어요.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-7 break-keep text-[var(--color-text-body)] md:text-base">
            <li>
              자살예방상담전화(24시간·무료) — <a href="tel:109" className="inline-flex min-h-11 items-center font-bold text-[var(--color-text-dark)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong">109</a>
            </li>
            <li>
              정신건강 위기상담전화 — <a href="tel:1577-0199" className="inline-flex min-h-11 items-center font-bold text-[var(--color-text-dark)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong">1577-0199</a>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
