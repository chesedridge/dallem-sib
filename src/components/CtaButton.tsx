import Link from "next/link";
import type { ReactNode } from "react";

interface CtaButtonProps {
  href?: string;
  children: ReactNode;
}

export default function CtaButton({
  href = "/apply",
  children,
}: CtaButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-primary px-8 py-4 text-center text-[16px] font-bold tracking-[-0.02em] !text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-strong md:min-h-[60px] md:px-10 md:text-[18px]"
    >
      {children}
    </Link>
  );
}
