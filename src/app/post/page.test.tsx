import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PostPage from "./page";

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
    screen.queryByRole("heading", { name: "문항응답" }),
  ).not.toBeInTheDocument();
});
it("clears answers, token and timing after a duplicate discovered at save, then allows the other timing", async () => {
  fetchMock
    .mockResolvedValueOnce(response(200, { matchToken: "first-token" }))
    .mockResolvedValueOnce(response(409, duplicate));
  const { container } = render(<PostPage />);
  enterInfo(container);
  await screen.findByRole("heading", { name: "문항응답" });
  for (let i = 1; i <= 9; i++)
    fireEvent.click(
      container.querySelector(`input[name="question-${i}"][value="1"]`)!,
    );
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
  await screen.findByRole("heading", { name: "문항응답" });
  expect(
    container.querySelectorAll('input[type="radio"]:checked'),
  ).toHaveLength(0);
  for (let i = 1; i <= 9; i++)
    fireEvent.click(
      container.querySelector(`input[name="question-${i}"][value="1"]`)!,
    );
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
    screen.queryByRole("heading", { name: "문항응답" }),
  ).not.toBeInTheDocument();
});
