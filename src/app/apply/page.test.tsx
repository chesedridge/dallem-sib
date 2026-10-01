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
