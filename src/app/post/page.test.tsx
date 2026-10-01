import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PostPage from "./page";
import { QUESTIONS } from "@/app/apply/components/constants";

const fetchMock = jest.fn();
const duplicate = {
  code: "POST_SURVEY_ALREADY_COMPLETED",
  message:
    "입력하신 연락처는 4회기 후 사후검사를 이미 완료했습니다. 같은 회기의 검사는 한 번만 진행할 수 있어요.",
};
const response = (status: number, body: object) => ({
  status,
  ok: status < 400,
  json: async () => body,
});
const originalFetch = global.fetch;
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});
beforeEach(() => {
  jest.spyOn(window, "scrollTo").mockImplementation(() => {});
  fetchMock.mockReset();
  global.fetch = fetchMock;
});
afterEach(() => jest.restoreAllMocks());
afterAll(() => {
  global.fetch = originalFetch;
});
function enterInfo(container: HTMLElement, timing = "4") {
  fireEvent.change(screen.getByLabelText("닉네임 (또는 이름)"), {
    target: { value: "test user" },
  });
  fireEvent.change(screen.getByLabelText("연락처"), {
    target: { value: "01012345678" },
  });
  fireEvent.click(screen.getByLabelText(`${timing}회기 후 진행`));
  fireEvent.submit(container.querySelector("#post-phq-test-form")!);
}
it("keeps entered information when the start check finds a duplicate", async () => {
  fetchMock.mockResolvedValue(response(409, duplicate));
  const { container } = render(<PostPage />);
  enterInfo(container);
  await screen.findByRole("heading", { name: "이미 완료한 사후검사예요" });
  expect(screen.getByLabelText("4회기 후 진행")).toBeChecked();
  expect(screen.getByLabelText("연락처")).toHaveValue("01012345678");
  expect(
    screen.queryByRole("heading", { name: /^문항응답/ }),
  ).not.toBeInTheDocument();
});
it("clears answers, token and timing after a duplicate discovered at save, then allows the other timing", async () => {
  fetchMock
    .mockResolvedValueOnce(response(200, { matchToken: "first-token" }))
    .mockResolvedValueOnce(response(409, duplicate));
  const { container } = render(<PostPage />);
  enterInfo(container);
  await screen.findByRole("heading", { name: /^문항응답/ });
  for (let i = 1; i <= 9; i++) {
    fireEvent.click(
      container.querySelector(`input[name="question-${i}"][value="1"]`)!,
    );
    if (i < 9) fireEvent.click(screen.getByRole("button", { name: "다음" }));
  }
  fireEvent.submit(container.querySelector("#post-phq-test-form")!);
  await screen.findByRole("heading", { name: "이미 완료한 사후검사예요" });
  expect(screen.getByLabelText("닉네임 (또는 이름)")).toHaveValue("test user");
  expect(screen.getByLabelText("연락처")).toHaveValue("01012345678");
  expect(screen.getByLabelText("4회기 후 진행")).not.toBeChecked();
  expect(screen.getByLabelText("6회기 후 진행")).not.toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "확인" }));
  fetchMock.mockResolvedValueOnce(
    response(200, { matchToken: "second-token" }),
  );
  enterInfo(container, "6");
  await screen.findByRole("heading", { name: /^문항응답/ });
  expect(
    container.querySelectorAll('input[type="radio"]:checked'),
  ).toHaveLength(0);
  for (let i = 1; i <= 9; i++) {
    fireEvent.click(
      container.querySelector(`input[name="question-${i}"][value="1"]`)!,
    );
    if (i < 9) fireEvent.click(screen.getByRole("button", { name: "다음" }));
  }
  fetchMock.mockResolvedValueOnce(
    response(200, { preAnswers: Array(9).fill(2) }),
  );
  fireEvent.submit(container.querySelector("#post-phq-test-form")!);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(4));
  const payload = JSON.parse(fetchMock.mock.calls[3][1].body);
  expect(payload).toMatchObject({ timing: "6", matchToken: "second-token" });
  await screen.findByText("검사 완료 · 6회기 후");
});
it("does not start a survey when history lookup fails", async () => {
  fetchMock.mockResolvedValue(
    response(503, { message: "잠시 후 다시 시도해주세요." }),
  );
  const { container } = render(<PostPage />);
  enterInfo(container);
  await screen.findByRole("heading", { name: "검사 기록을 확인하지 못했어요" });
  expect(
    screen.queryByRole("heading", { name: /^문항응답/ }),
  ).not.toBeInTheDocument();
});


it("navigates one post-survey question at a time and saves all answers only at the last step", async () => {
  fetchMock.mockResolvedValueOnce(response(200, { matchToken: "test-token" }));
  const { container } = render(<PostPage />);
  enterInfo(container);
  await screen.findByRole("group", { name: QUESTIONS[0] });
  expect(screen.getAllByRole("radio")).toHaveLength(4);
  expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  fireEvent.submit(container.querySelector("#post-phq-test-form")!);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  fireEvent.click(screen.getByRole("radio", { name: "없음 0점" }));
  fireEvent.click(screen.getByRole("button", { name: "다음" }));
  fireEvent.click(screen.getByRole("radio", { name: "7~12일 2점" }));
  fireEvent.click(screen.getByRole("button", { name: "이전" }));
  expect(screen.getByRole("radio", { name: "없음 0점" })).toBeChecked();
  fireEvent.click(screen.getByRole("radio", { name: "2~6일 1점" }));
  fireEvent.click(screen.getByRole("button", { name: "다음" }));
  expect(screen.getByRole("radio", { name: "7~12일 2점" })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "다음" }));
  for (let index = 2; index < 8; index++) {
    fireEvent.click(screen.getByRole("radio", { name: "없음 0점" }));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
  }
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "결과보기" })).toBeDisabled();
  fireEvent.click(screen.getByRole("radio", { name: "없음 0점" }));
  let resolveSave!: (value: ReturnType<typeof response>) => void;
  fetchMock.mockImplementationOnce(() => new Promise(resolve => { resolveSave = resolve; }));
  fireEvent.click(screen.getByRole("button", { name: "결과보기" }));
  expect(screen.getByRole("button", { name: "불러오는중" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
  expect(screen.getAllByRole("radio").every(radio => radio.hasAttribute("disabled") || radio.closest("fieldset[disabled]"))).toBe(true);
  expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
    answers: [1, 2, 0, 0, 0, 0, 0, 0, 0],
    totalScore: 3,
    timing: "4",
    matchToken: "test-token",
  });
  resolveSave(response(200, { preAnswers: Array(9).fill(1) }));
  await screen.findByText("검사 완료 · 4회기 후");
});
