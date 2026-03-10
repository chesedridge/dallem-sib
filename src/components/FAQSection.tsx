"use client";

import { useState } from "react";
import CtaButton from "@/components/CtaButton";

interface FAQItem {
  question: string;
  answer: string[];
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Q. 심리 상담이 처음이라 망설여져요.",
    answer: [
      "감기에 걸리면 병원을 찾듯, 마음이 아플 때는 심리 상담이 필요해요.",
      "이는 '상담사'를 만나는 것이 아닌, '나'를 만나는 소중한 시간이에요.",
      "장기적인 상담을 통해 문제의 본질을 발견하고 해결할 수 있어요.",
      "지금 바로 시작해보세요!",
    ],
  },
  {
    question: "Q. 정신과와는 어떻게 다른가요?",
    answer: [
      "정신건강의학과는 주로 약물치료인 반면",
      "본 프로그램은 심리상담을 통한 심리치료로 진행 됩니다.",
      "또한 의료행위가 아니기 때문에 병원 기록이 남지 않습니다.",
    ],
  },
  {
    question: "Q. 익명성이 보장되나요?",
    answer: [
      "네, 완전히 익명으로 진행돼요.",
      "연락을 위한 전화번호 외에는 어떤 개인정보도 수집하지 않아요.",
      "이름 대신 닉네임으로도 참여 가능해요!",
    ],
  },
  {
    question: "Q. 센터 방문이 부담돼요.",
    answer: [
      "상담은 100% 비대면으로 진행돼요.",
      "화상이나 전화 중에서 편하게 선택하시면 됩니다.",
      "(화상도 얼굴 끄고 진행 가능하지만, 가능하면 화상을 추천드려요!)",
    ],
  },
  {
    question: "Q. 정말 무료인가요?",
    answer: [
      "경기도 직장인의 정신 건강을 위한 정부·민간 협력 사업으로,",
      "전액 무료로 진행돼요.",
      "상담에 필요한 건 당신의 편안한 마음뿐이랍니다.",
    ],
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full bg-bg-warm-light">
      <div className="page-shell">
        <div className="mb-8 text-center md:mb-10">
          <h2 className="section-heading">
            자주하는 질문
          </h2>
        </div>

        <div className="mx-auto max-w-[1000px]">
          {FAQ_ITEMS.map((item, index) => (
            <div
              key={index}
              className="border-b border-border-soft"
            >
              <button
                className="flex w-full cursor-pointer items-center justify-between gap-4 border-none bg-transparent py-5 text-left text-[15px] font-semibold leading-7 tracking-[-0.02em] text-text-body transition-colors hover:text-primary md:py-7 md:text-[20px] md:leading-8"
                onClick={() => toggleFAQ(index)}
                type="button"
              >
                <span>{item.question}</span>
                <span className={`shrink-0 text-[24px] leading-none text-primary-strong transition-transform duration-300 ${openIndex === index ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-[500px] pb-5" : "max-h-0"
                }`}
              >
                {item.answer.map((line, i) => (
                  <p key={i} className="px-1 text-left text-[15px] leading-7 text-text-sub md:px-4 md:text-[16px] md:leading-8">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-10 text-center text-[16px] leading-6 text-text-sub md:mt-14 md:text-[16px] md:leading-7">
            <p>
              「경기도 직장인을 위한 멘탈케어 프로젝트」 지원사업에 관해 더
              궁금하신 점은 무엇이든지 편하게 아래를 통해 문의해 주세요.
            </p>
            <p className="mt-1">이메일 : help@dallem.com</p>
          </div>
        </div>

        <div className="section-cta">
          <CtaButton>상담 신청하러 가기</CtaButton>
        </div>
      </div>
    </section>
  );
}
