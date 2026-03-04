export default function HeroSection() {
  return (
    <>
      {/* Mobile Hero */}
      <section
        className="relative flex min-h-screen w-full overflow-hidden bg-[#dddddd] bg-cover bg-center bg-no-repeat md:hidden"
        style={{
          backgroundImage:
            "url(https://cdn.imweb.me/thumbnail/20250820/562ae74ee73d6.png)",
        }}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col px-5 py-10">
          <div className="flex items-center gap-2 text-[14px] text-[var(--color-text-dark)]">
            <img src="/archive_files/4218a6a54e3b2.png" alt="" className="block w-[21px] h-auto" />
            <span>「우울증 개선 및 자살예방 SIB사업」</span>
          </div>

          <div className="mt-10 flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="mb-6 text-[22px] font-bold leading-relaxed text-[var(--color-text-dark)]">
              지금 너무 힘들다면,
              <br />
              우리와 함께 이야기해 보세요.
            </h1>

            <p className="mb-[30px] text-[16px] leading-relaxed text-[var(--color-primary)]">
              마음의 어려움을 겪고있는 <strong className="font-bold">경기도 직장인</strong>들에게
              <br />
              <strong className="font-bold">전문 심리 상담 서비스를 무료로 제공합니다.</strong>
            </p>

            <div className="mx-auto mb-[30px]">
              <img
                src="/archive_files/370a0ab8b9cfd.png"
                alt="서비스 소개"
                className="mx-auto w-[270px]"
              />
            </div>

            <p className="mb-5 text-[18px] font-bold text-[var(--color-text-dark)]">
              부담없이 지금 시작해 보세요
            </p>

            <a
              href="https://clify-app.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src="/archive_files/83430baf4d9d2.png"
                alt="상담 신청"
                className="mx-auto w-[284px]"
              />
            </a>
          </div>
        </div>
      </section>

      {/* PC Hero */}
      <section
        className="relative hidden min-h-screen w-full overflow-hidden bg-[#dddddd] bg-cover bg-no-repeat md:flex"
        style={{
          backgroundImage:
            "url(https://cdn.imweb.me/thumbnail/20250820/3d352d333eddc.png)",
          backgroundPosition: "100% 50%",
        }}
      >
        <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col px-10 py-[60px]">
          <div className="flex items-center gap-2 text-[24px] text-[var(--color-text-dark)]">
            <img
              src="/archive_files/c27a915815550.png"
              alt=""
              className="block w-[24px] h-auto"
            />
            <span className="text-[24px]">
              「우울증 개선 및 자살예방 SIB사업」
            </span>
          </div>

          <div className="mt-5 flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="mb-10 text-[48px] font-bold leading-relaxed text-[var(--color-text-dark)]">
              지금 너무 힘들다면,
              <br />
              우리와 함께 이야기해 보세요.
            </h1>

            <p className="mb-[50px] text-[36px] leading-relaxed text-[var(--color-primary)]">
              마음의 어려움을 겪고있는 <strong className="font-bold">경기도 직장인</strong>들에게
              <br />
              <strong className="font-bold">전문 심리 상담 서비스를 무료로 제공합니다.</strong>
            </p>

            <div className="mx-auto mb-[50px]">
              <img
                src="/archive_files/6d2d16f385442.png"
                alt="서비스 소개"
                className="mx-auto max-w-[917px] w-full"
              />
            </div>

            <p className="mb-5 text-[36px] font-bold text-[var(--color-text-dark)]">
              부담없이 지금 시작해 보세요
            </p>

            <a
              href="https://clify-app.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <img
                src="/archive_files/6b10fa62f8f83.png"
                alt="상담 신청"
                className="mx-auto w-[351px]"
              />
            </a>

            <div className="mt-5">
              <img
                src="/archive_files/d72f80ff8f85c.png"
                alt=""
                className="mx-auto w-[59px]"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
