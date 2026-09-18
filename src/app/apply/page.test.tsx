import { fireEvent, render, screen } from "@testing-library/react";
import TestPage from "./page";

it.each([0, 1, 2, 3])("applies eligibility throughout the survey flow with ninth answer %i", (ninth) => {
  const { container } = render(<TestPage />);
  fireEvent.click(screen.getByRole("button", { name: "네, 해당합니다" }));
  fireEvent.click(screen.getByRole("button", { name: "시작하기" }));
  const form = container.querySelector("#phq-test-form")!;
  fireEvent.submit(form);
  expect(screen.queryByText("이번 프로젝트 대상자입니다!")).not.toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "결과보기" }).every(button => button.hasAttribute("disabled"))).toBe(true);

  [2, 2, 2, 0, 0, 0, 0, 0, ninth].forEach((answer, index) => {
    fireEvent.click(container.querySelector(`input[name="question-${index + 1}"][value="${answer}"]`)!);
  });
  fireEvent.submit(form);
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
  answers.forEach((answer, index) => {
    fireEvent.click(container.querySelector(`input[name="question-${index + 1}"][value="${answer}"]`)!);
  });
  fireEvent.submit(container.querySelector("#phq-test-form")!);
  expect(screen.getByRole("heading", { name: "이번 프로젝트 대상자는 아니에요" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /달램톡과 대화하기/ })).toBeInTheDocument();
  expect(screen.queryByText("판정 결과")).not.toBeInTheDocument();
});
