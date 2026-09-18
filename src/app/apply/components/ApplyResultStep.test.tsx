import { render, screen } from "@testing-library/react";
import { ApplyResultStep } from "./ApplyResultStep";
import { findResultBand } from "./constants";

it("keeps the high score result while hiding the ineligible application button", () => {
  render(<ApplyResultStep isEligible={false} resultBand={findResultBand(20)} resultBadgeClass="" onProceedToApply={jest.fn()} />);
  expect(screen.getByText("20~27점 : 심한 우울")).toBeInTheDocument();
  expect(screen.getByText("이번 프로젝트의 대상자가 아닙니다")).toBeInTheDocument();
  expect(screen.getByText("이번 프로젝트의 참여 조건에 해당하지 않습니다.")).toBeInTheDocument();
  expect(screen.queryByText(/현재 멘탈이 양호/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "상담 신청하기" })).not.toBeInTheDocument();
});

it("shows the application button for eligible respondents", () => {
  render(<ApplyResultStep isEligible resultBand={findResultBand(5)} resultBadgeClass="" onProceedToApply={jest.fn()} />);
  expect(screen.getByText("이번 프로젝트 대상자입니다!")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "상담 신청하기" })).toBeInTheDocument();
});
