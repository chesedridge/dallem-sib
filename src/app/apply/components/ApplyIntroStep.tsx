"use client";

const INTRO_ITEMS = [
  {
    title: "9개 문항",
    description: "우울감, 수면, 식욕 등 일상의 변화를 묻습니다",
    path: "M3 4h7v7H3z M14 6h7 M14 10h5 M3 16h18 M3 20h12",
  },
  {
    title: "1분이면 충분",
    description: "부담 없이 응답해 주세요",
    path: "M12 9v5l3 2 M9 2h6 M19 6l2-2",
    clock: true,
  },
  {
    title: "정답은 없어요",
    description: "솔직한 응답이 가장 도움이 됩니다",
    path: "M12 21 4 13A5 5 0 0 1 11 6l1 1 1-1a5 5 0 0 1 7 7Z",
  },
];
export function ApplyIntroStep({ onStart }: { onStart: () => void }) {
  return (
    <section className="survey-intro">
      <h2 className="mv-start-title">
        지난 2주, 어떻게
        <br />
        지내셨어요?
      </h2>
      <div className="mv-start-card">
        <p className="mv-start-label">PHQ-9 우울 자가 검사</p>
        <ul className="mv-start-list">
          {INTRO_ITEMS.map((item) => (
            <li key={item.title}>
              <span className="mv-start-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {item.clock && <circle cx="12" cy="14" r="8" />}
                  <path d={item.path} />
                </svg>
              </span>
              <span>
                <strong>{item.title}</strong>
                <span className="mv-start-desc">{item.description}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mv-start-note">
          응답은 모두 익명으로 처리되며,
          <br />
          본인 외에는 결과를 볼 수 없습니다
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="survey-primary mv-start-cta"
      >
        시작하기
      </button>
    </section>
  );
}
