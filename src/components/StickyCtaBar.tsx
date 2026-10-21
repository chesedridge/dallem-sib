import CtaButton from "@/components/CtaButton";

// main의 마지막 자식으로 두면 스크롤 내내 화면 하단에 붙어 있고,
// 페이지 끝에서는 제자리로 돌아와 마지막 섹션을 가리지 않는다.
export default function StickyCtaBar() {
  return (
    <div className="pointer-events-none sticky bottom-0 z-50 flex justify-center px-6 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pt-3">
      <div className="pointer-events-auto rounded-full shadow-[0_10px_28px_rgba(215,101,84,0.32)]">
        <CtaButton>무료 상담 받으러 가기</CtaButton>
      </div>
    </div>
  );
}
