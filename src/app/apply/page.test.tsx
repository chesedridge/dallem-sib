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
    expect(screen.getByText("이번 프로젝트의 대상자가 아닙니다")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "상담 신청하기" })).not.toBeInTheDocument();
  } else {
    fireEvent.click(screen.getByRole("button", { name: "상담 신청하기" }));
    expect(screen.getAllByRole("button", { name: "상담 신청 완료" }).length).toBeGreaterThan(0);
  }
});
