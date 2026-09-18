import { render, screen } from "@testing-library/react";
import { ApplyResultStep } from "./ApplyResultStep";
import { findResultBand } from "./constants";

it.each([0, 4, 6, 15, 20, 24])("shows the same alternative support screen for ineligible score %i", (score) => {
  render(<ApplyResultStep isEligible={false} resultBand={findResultBand(score)} resultBadgeClass="" onProceedToApply={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "이번 프로젝트 대상자는 아니에요" })).toBeInTheDocument();
  expect(screen.queryByText(findResultBand(score).title)).not.toBeInTheDocument();
  expect(screen.queryByText(findResultBand(score).description)).not.toBeInTheDocument();
  expect(screen.queryByText("이번 프로젝트의 대상자가 아닙니다")).not.toBeInTheDocument();
  expect(screen.queryByText(/현재 멘탈이 양호/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "상담 신청하기" })).not.toBeInTheDocument();
  expect(screen.getByText("이 프로그램은 우울감과 함께 자살위험 신호가 있는 분들을 우선 지원하도록 마련되었어요. 지금 느끼시는 어려움이 가볍다는 뜻은 아니니, 편하게 다른 방법으로 이야기 나눠보세요.")).toBeInTheDocument();
  expect(screen.getByText("24시간 언제든 편하게 마음을 나눠보실 수 있어요. 필요할 땐 전문 상담사 연결도 도와드려요.")).toBeInTheDocument();
  expect(screen.getByText("DALLEMTALK").parentElement).toHaveTextContent("첫 이용 시 기업코드에 DALLEMTALK을 입력해주세요.");
  expect(screen.getByRole("heading", { name: "혹시 지금 많이 힘드신 상태라면" })).toBeInTheDocument();
  expect(screen.getByText("생각을 멈추기 어렵거나 위험하다고 느껴지신다면, 아래 번호로 24시간 언제든 연락하실 수 있어요.")).toBeInTheDocument();
  const chat = screen.getByRole("link", { name: /달램톡과 대화하기/ });
  expect(chat).toHaveAttribute("href", "https://talk.app.dallem.com/");
  expect(chat).toHaveAttribute("target", "_blank");
  expect(chat).toHaveAttribute("rel", "noopener noreferrer");
  expect(screen.getByRole("link", { name: "109" })).toHaveAttribute("href", "tel:109");
  expect(screen.getByRole("link", { name: "1577-0199" })).toHaveAttribute("href", "tel:1577-0199");
});

it("shows the application button for eligible respondents", () => {
  render(<ApplyResultStep isEligible resultBand={findResultBand(5)} resultBadgeClass="" onProceedToApply={jest.fn()} />);
  expect(screen.getByText("이번 프로젝트 대상자입니다!")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "상담 신청하기" })).toBeInTheDocument();
});
