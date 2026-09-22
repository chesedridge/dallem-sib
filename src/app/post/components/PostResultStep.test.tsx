import { render, screen } from "@testing-library/react";
import { PostResultStep } from "./PostResultStep";
import { findResultBand } from "../../apply/components/constants";
const scores = (total: number) =>
  Array.from({ length: 9 }, (_, i) => Math.max(0, Math.min(3, total - i * 3)));
it.each([
  [20, 13, true],
  [15, 15, true],
  [13, 19, true],
  [12, 3, false],
  [6, 5, true],
  [4, 4, false],
])(
  "renders pre %i to post %i and correct extra support",
  (pre, post, extra) => {
    render(
      <PostResultStep
        resultBadgeClass=""
        resultBand={findResultBand(post as number)}
        totalScore={post as number}
        preAnswers={scores(pre as number)}
        answers={scores(post as number)}
        timing="4"
      />,
    );
    expect(
      Boolean(screen.queryByText("상담 2회기를 추가로 받으실 수 있어요")),
    ).toBe(extra);
    expect(
      screen.getByRole("heading", {
        name: findResultBand(post as number).title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("문항별 변화 보기")).toBeInTheDocument();
  },
);
it("does not promise further sessions after six sessions", () => {
  render(
    <PostResultStep
      resultBadgeClass=""
      resultBand={findResultBand(15)}
      totalScore={15}
      preAnswers={scores(15)}
      answers={scores(15)}
      timing="6"
    />,
  );
  expect(screen.queryByText(/상담 2회기를/)).not.toBeInTheDocument();
  expect(screen.queryByText(/추가 상담을 통해/)).not.toBeInTheDocument();
});
