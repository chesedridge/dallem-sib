export default function ProcedureSection() {
  return (
    <section className="relative w-full bg-[var(--color-bg-gray)]">
      <div className="mx-auto max-w-[1200px] px-5 py-10 md:px-10 md:py-[104px]">
        <h2 className="text-center text-[22px] font-bold leading-relaxed text-[#363636] md:text-[36px]">
          신청 절차
        </h2>

        {/* Mobile */}
        <div className="mx-auto mt-5 max-w-full md:hidden">
          <img src="/archive_files/a342d952347c8.png" alt="신청 절차" className="w-full" />
        </div>

        {/* PC */}
        <div className="mx-auto mt-5 hidden md:block md:max-w-[1000px]">
          <img src="/archive_files/ae11ae18a9ec5.png" alt="신청 절차" className="w-full" />
        </div>

        <div className="mt-[30px] text-center">
          <a
            href="https://clify-app.web.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-[var(--color-primary)] px-10 py-4 text-center text-[18px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e06f05]"
          >
            상담 신청하러 가기
          </a>
        </div>
      </div>
    </section>
  );
}
