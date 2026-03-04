const MOBILE_IMAGES = [
  "/archive_files/54dd1eb12f411.png",
  "/archive_files/b84502aa46e15.png",
  "/archive_files/6d7a1413b85e0.png",
];

const PC_IMAGES = [
  "/archive_files/0797029c41ec0.png",
  "/archive_files/20cd396006fb3.png",
  "/archive_files/06c90e5ca571f.png",
];

export default function BenefitImagesSection() {
  return (
    <section className="relative w-full bg-[var(--color-bg-white)]">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-[104px]">
        {/* Mobile Images */}
        <div className="mb-[30px] flex flex-col gap-0 md:hidden">
          {MOBILE_IMAGES.map((src, i) => (
            <img key={i} src={src} alt={`혜택 ${i + 1}`} className="w-full" />
          ))}
        </div>

        {/* PC Images */}
        <div className="mb-[30px] hidden md:flex md:flex-row md:gap-0">
          {PC_IMAGES.map((src, i) => (
            <img key={i} src={src} alt={`혜택 ${i + 1}`} className="flex-1 w-[33.333%] object-cover" />
          ))}
        </div>

        <div className="mb-[20px] text-center">
          <p className="text-[22px] font-bold leading-relaxed md:text-[36px] md:leading-relaxed">
            누구나 힘들 수 있습니다. 중요한 건{" "}
            <span className="text-[var(--color-primary)]">지금 시작하는 용기</span>입니다.
          </p>
          <p className="text-[22px] font-bold leading-relaxed md:text-[36px] md:leading-relaxed">부담 없이 지금 시작해보세요.</p>
        </div>

        <div className="mt-5 text-center">
          <a
            href="https://clify-app.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-[var(--color-primary)] px-10 py-4 text-center text-[18px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e06f05]"
          >
            우울증 1분 테스트 바로가기
          </a>
        </div>
      </div>
    </section>
  );
}
