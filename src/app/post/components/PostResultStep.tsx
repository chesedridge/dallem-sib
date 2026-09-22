"use client";

import type { ResultBand } from "@/app/apply/components/types";
import { findResultBand } from "@/app/apply/components/constants";
import { offersExtraSessions, type PostTiming } from "@/lib/survey-policy";

const ITEMS = [
  "우울감·무기력",
  "흥미·즐거움 상실",
  "수면 문제",
  "식욕 변화",
  "행동 변화",
  "피로감",
  "자책감",
  "집중 곤란",
  "자살 사고",
];
const bandName = (band: ResultBand) => band.title.split(" : ")[1];
export function PostResultStep({
  resultBand,
  totalScore,
  preAnswers,
  answers,
  timing,
}: {
  resultBadgeClass: string;
  resultBand: ResultBand;
  totalScore: number;
  preAnswers: number[];
  answers: number[];
  timing: PostTiming;
}) {
  const preScore = preAnswers.reduce((a, b) => a + b, 0);
  const preBand = findResultBand(preScore);
  const delta = totalScore - preScore;
  const extra = offersExtraSessions(totalScore, timing);
  const status = delta < 0 ? "good" : delta > 0 ? "bad" : "flat";
  const improved = answers.filter(
    (value, index) => value < preAnswers[index],
  ).length;
  const worsened = answers.filter(
    (value, index) => value > preAnswers[index],
  ).length;
  const explanation =
    delta < 0
      ? preBand.min !== resultBand.min
        ? `${bandName(preBand)}에서 ${bandName(resultBand)} 구간으로 이동했습니다. 지금의 변화가 이어지도록 스스로를 돌보는 시간을 계속 가져보세요.`
        : "구간은 같지만 점수가 낮아졌어요. 짧은 기간의 변화이니 앞으로의 흐름을 함께 지켜보시면 좋겠습니다."
      : delta === 0
        ? `짧은 기간에 변화가 나타나지 않는 것은 드문 일이 아니에요. ${extra ? "추가 상담을 통해 조금 더 이야기 나눠보시길 권해드립니다." : "앞으로의 흐름을 살펴보며 스스로를 돌보는 시간을 계속 가져보세요."}`
        : `점수가 올랐다고 해서 상담이 효과가 없었다는 뜻은 아니에요. ${extra ? "추가 상담에서 지금의 상태를 함께 살펴보세요." : "어려움이 지속된다면 전문가와 지금의 상태를 함께 살펴보세요."}`;

  return (
    <section className="post-result" aria-labelledby="post-result-title">
      <div className="card">
        {extra && (
          <aside className="alert" aria-labelledby="extra-sessions-title">
            <h3 id="extra-sessions-title">
              상담 2회기를 추가로 받으실 수 있어요
            </h3>
            <p>
              {delta >= 0
                ? "사후 검사 결과가 개선되지 않아"
                : "아직 정상 범위가 아니어서"}
              <br className="nb" /> 추가 상담을 지원해 드립니다.
              <br />
              담당자가 순차적으로 연락드릴 예정이에요.
            </p>
          </aside>
        )}
        <span className="pill">검사 완료 · {timing}회기 후</span>
        <h2 id="post-result-title" className="band-now">
          {resultBand.title}
        </h2>
        <p className="lede">
          {delta < 0 ? (
            <>
              상담 전후로 우울 점수가 <b>{-delta}점 낮아졌어요.</b>
            </>
          ) : delta === 0 ? (
            <>
              상담 전후 점수에 <b>변화가 없었어요.</b>
            </>
          ) : (
            <>
              지금은 <b>조금 더 세심한 지원이 필요해 보여요.</b>
            </>
          )}
        </p>
        <div className="compare">
          <span className={`delta ${status}`}>
            {delta < 0
              ? `${-delta}점 개선`
              : delta > 0
                ? `${delta}점 상승`
                : "변화 없음"}
          </span>
          <div className="bars" aria-hidden="true">
            {[preScore, totalScore].map((score, index) => (
              <div key={index} className="bar-col">
                <span className="bar-val">{score}점</span>
                <div
                  className={`bar ${index === 0 ? "pre" : `post ${status}`}`}
                  style={{
                    height: `${Math.max(2, Math.round((score / 27) * 104))}px`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="bars" style={{ height: "auto" }}>
            <div className="bar-foot">
              <p className="when">
                사전검사<span className="sr-only"> {preScore}점</span>
              </p>
              <p className="band">{bandName(preBand)}</p>
            </div>
            <div className="bar-foot">
              <p className="when">
                사후검사<span className="sr-only"> {totalScore}점</span>
              </p>
              <p className="band">{bandName(resultBand)}</p>
            </div>
          </div>
          <p className="axis">
            PHQ-9 총점 (0~27점) · 점수가 낮을수록 좋아진 것입니다
          </p>
        </div>
        <details className="items">
          <summary>
            <span>문항별 변화 보기</span>
            <span className="chev" aria-hidden="true">
              ▾
            </span>
          </summary>
          <p className="item-sum">
            9개 문항 중 <b>{improved}개 개선</b> · {9 - improved - worsened}개
            유지 · {worsened}개 악화
          </p>
          <ul className="item-list">
            {ITEMS.map((name, index) => {
              const change = answers[index] - preAnswers[index];
              return (
                <li key={name} className="item-row">
                  <span className="name">{name}</span>
                  <span className="sc">
                    <span className="sr-only">사전 </span>
                    {preAnswers[index]}점
                    <span className="to" aria-hidden="true">
                      →
                    </span>
                    <span className="after">
                      <span className="sr-only">사후 </span>
                      {answers[index]}점
                    </span>
                  </span>
                  <span
                    className={`tag ${change < 0 ? "good" : change > 0 ? "bad" : "flat"}`}
                  >
                    {change < 0 ? "개선" : change > 0 ? "악화" : "유지"}
                  </span>
                </li>
              );
            })}
          </ul>
        </details>
        <p className="explain">{explanation}</p>
      </div>
    </section>
  );
}
