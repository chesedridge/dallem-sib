import { fireEvent, render, screen } from "@testing-library/react";
import TestPage from "./page";
import { QUESTIONS } from "./components/constants";

function answerQuestions(container: HTMLElement, answers: number[]) {
  answers.forEach((answer, index) => {
    fireEvent.click(container.querySelector(`input[name="question-${index + 1}"][value="${answer}"]`)!);
  });
}

it.each([0, 1, 2, 3])("applies eligibility throughout the survey flow with ninth answer %i", (ninth) => {
  const { container } = render(<TestPage />);
  fireEvent.click(screen.getByRole("button", { name: "네, 해당합니다" }));
  fireEvent.click(screen.getByRole("button", { name: "시작하기" }));
  const form = container.querySelector("#phq-test-form")!;
  fireEvent.submit(form);
  expect(screen.queryByText("이번 프로젝트 대상자입니다!")).not.toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "다음" }).every(button => button.hasAttribute("disabled"))).toBe(true);

  answerQuestions(container, [2, 2, 2, 0, 0, 0, 0, 0, ninth]);
  if (ninth === 0) {
    expect(screen.getByText("이번 프로젝트 대상자는 아니에요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "상담 신청하기" })).not.toBeInTheDocument();
  } else {
    fireEvent.click(screen.getByRole("button", { name: "상담 신청하기" }));
    expect(screen.getAllByRole("button", { name: "상담 신청 완료" }).length).toBeGreaterThan(0);
  }
});

it.each([0, 4, 6, 15, 20, 24])("routes ineligible total %i to the alternative support screen", (total) => {
  const { container } = render(<TestPage />);
  fireEvent.click(screen.getByRole("button", { name: "네, 해당합니다" }));
  fireEvent.click(screen.getByRole("button", { name: "시작하기" }));
  const answers = Array.from({ length: 9 }, (_, index) =>
    index === 8 ? 0 : Math.max(0, Math.min(3, total - index * 3)),
  );
  answerQuestions(container, answers);
  expect(screen.getByRole("heading", { name: "이번 프로젝트 대상자는 아니에요" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /달램톡과 대화하기/ })).toBeInTheDocument();
  expect(screen.queryByText("판정 결과")).not.toBeInTheDocument();
});

it("requires affiliation and privacy consent before completing the application", () => {
  const { container } = render(<TestPage />);
  fireEvent.click(screen.getByRole("button", {name:"네, 해당합니다"}));
  fireEvent.click(screen.getByRole("button", {name:"시작하기"}));
  answerQuestions(container, [2,2,0,0,0,0,0,0,1]);
  fireEvent.click(screen.getByRole("button", {name:"상담 신청하기"}));
  fireEvent.submit(container.querySelector("#phq-test-form")!);
  expect(screen.getByRole("alert")).toHaveTextContent("직장인 소속을 선택해주세요.");
  expect(screen.getByText("개인정보 수집 및 이용에 동의해주세요.")).toBeInTheDocument();
  expect(screen.queryByText("신청이 정상적으로 접수되었습니다")).not.toBeInTheDocument();
});

it("completes the application using only the remaining fields", async () => {
  const originalFetch = global.fetch;
  const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  global.fetch = fetchMock;
  jest.useFakeTimers().setSystemTime(new Date("2026-10-01T00:00:00Z"));
  try {
    const { container } = render(<TestPage />);
    fireEvent.click(screen.getByRole("button", { name: "네, 해당합니다" }));
    fireEvent.click(screen.getByRole("button", { name: "시작하기" }));
    answerQuestions(container, [2,2,0,0,0,0,0,0,1]);
    fireEvent.click(screen.getByRole("button", { name: "상담 신청하기" }));
    expect(screen.queryByText(/상담주제|현재 가장 힘든 정도|상담에서 기대하는 도움/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "경기도에 거주하는 직장인입니다" }));
    fireEvent.change(screen.getByLabelText("이름 (또는 닉네임)"), { target: { value: "테스트" } });
    fireEvent.change(screen.getByLabelText("연락처"), { target: { value: "01012345678" } });
    fireEvent.click(screen.getByRole("radio", { name: "화상상담" }));
    ["10:00", "11:00", "12:00"].forEach((time, index) => {
      fireEvent.change(container.querySelector(`input[name="preferredScheduleDate-${index + 1}"]`)!, {
        target: { value: "2026-10-05" },
      });
      fireEvent.change(container.querySelector(`input[name="preferredScheduleTime-${index + 1}"]`)!, {
        target: { value: time },
      });
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "개인정보 수집 및 이용에 동의합니다. (필수)" }));
    fireEvent.submit(container.querySelector("#phq-test-form")!);

    expect(await screen.findByRole("heading", { name: "신청이 정상적으로 접수되었습니다" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/survey-results");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      formVersion: 2,
      affiliation: "경기도에 거주하는 직장인입니다",
      nickname: "테스트",
      contact: "01012345678",
      consultationMethod: "화상상담",
      preferredSchedules: ["10:00", "11:00", "12:00"].map(time => ({ date: "2026-10-05", time })),
      privacyConsent: true,
      answers: [2,2,0,0,0,0,0,0,1],
      totalScore: 5,
      resultTitle: expect.any(String),
      resultDescription: expect.any(String),
    });
  } finally {
    global.fetch = originalFetch;
    jest.useRealTimers();
  }
});


it("advances on answer selection, preserves edits, and advances when selecting an existing answer again", () => {
  const { container } = render(<TestPage />);
  fireEvent.click(screen.getByRole("button", { name: "네, 해당합니다" }));
  fireEvent.click(screen.getByRole("button", { name: "시작하기" }));
  const form = container.querySelector("#phq-test-form")!;
  expect(screen.getByRole("group", { name: QUESTIONS[0] })).toBeInTheDocument();
  expect(screen.getAllByRole("radio")).toHaveLength(4);
  expect(screen.queryByText(QUESTIONS[1])).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  fireEvent.submit(form);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");

  fireEvent.click(screen.getByRole("radio", { name: "2~6일 1점" }));
  expect(screen.getByRole("group", { name: QUESTIONS[1] })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /2번 문항/ })).toHaveFocus();
  expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  fireEvent.click(screen.getByRole("radio", { name: "7~12일 2점" }));
  expect(screen.getByRole("group", { name: QUESTIONS[2] })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "이전" }));
  expect(screen.getByRole("radio", { name: "7~12일 2점" })).toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "7~12일 2점" }));
  expect(screen.getByRole("group", { name: QUESTIONS[2] })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "이전" }));
  fireEvent.click(screen.getByRole("button", { name: "이전" }));
  expect(screen.getByRole("radio", { name: "2~6일 1점" })).toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "거의 매일 3점" }));
  expect(screen.getByRole("radio", { name: "7~12일 2점" })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "다음" }));
  for (let index = 2; index < 8; index++) {
    fireEvent.click(screen.getByRole("radio", { name: "없음 0점" }));
  }
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "9");
  expect(screen.getByRole("button", { name: "결과보기" })).toBeDisabled();
  fireEvent.click(screen.getByRole("radio", { name: "2~6일 1점" }));
  expect(screen.getByRole("heading", { name: "5~9점 : 가벼운 우울" })).toBeInTheDocument();
});
