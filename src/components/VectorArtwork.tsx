import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

type BenefitCardProps = {
  icon: "chat" | "tag" | "heart";
  title: ReactNode;
  description?: string;
  compact?: boolean;
};

type MetricChartProps = {
  kind: "positive" | "negative";
};

type ProcedureTimelineProps = {
  compact?: boolean;
};

const CORAL = "#f08777";
const CORAL_DEEP = "#d76554";
const CORAL_LIGHT = "#f4b1a7";
const MAUVE = "#92727a";
const MAUVE_DEEP = "#755860";
const GREY = "#b8a7a2";
const TEXT = "#544541";
const TEXT_DARK = "#231a18";
const SURFACE = "#fffaf8";
const SURFACE_LINE = "#e5cfca";

function iconClassName(className?: string) {
  return className ?? "h-6 w-6";
}

export function PreventionBadgeIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="10" fill={CORAL_DEEP} />
      <path
        d="M47 55C39 45 35 36 37 20C43 20 47 25 47 31V55Z"
        fill={CORAL_LIGHT}
        opacity="0.85"
      />
      <path
        d="M28.5 16C24.2 16 21 19.8 21 24.2C21 28.8 23.3 31.8 26.7 35.1L32 40.4L37.4 35.1C40.7 31.8 43 28.8 43 24.2C43 19.8 39.8 16 35.5 16C33.5 16 31.8 16.8 30.5 18.2L32 19.9L29.7 22L26.8 19C27.1 17 27.8 16 28.5 16Z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M18 22.5C19.9 22.5 21.4 23.7 21.8 25.5L23.5 33.4L24.7 21.8C24.9 20.1 26.3 18.8 28 18.8C29.8 18.8 31.2 20.2 31.3 22L31.8 30.9L32.9 19.8C33.1 18.1 34.5 16.8 36.2 16.8C38.1 16.8 39.5 18.4 39.4 20.2L38.7 31.7L41.3 28.8C42 28 43 27.5 44 27.5C46.1 27.5 47.6 29.8 46.7 31.7L42.3 41.2C40.7 44.6 37.4 46.7 33.7 46.7H31.9C27.5 46.7 23.8 43.6 22.8 39.3L19.3 25.6C19 24.1 18 23.1 18 22.5Z"
        fill="white"
      />
      <path
        d="M32.1 50.4L28.9 47.3C28.2 46.5 28.2 45.3 29 44.6C29.8 43.8 31 43.8 31.8 44.6L32 44.8L32.2 44.6C33 43.8 34.2 43.8 35 44.6C35.8 45.3 35.8 46.6 35.1 47.3L32.1 50.4Z"
        fill="white"
      />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="32" cy="32" r="32" fill={CORAL} />
      <path
        d="M18 32.5L27.2 41.5L46.5 22.5"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MouseArrowIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 48 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="40" height="52" rx="20" stroke="white" strokeWidth="4" />
      <path d="M24 19V30" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M24 76L15 67M24 76L33 67M24 76V57"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DownChevronIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 14L24 28L38 14M10 26L24 40L38 26"
        stroke={CORAL_LIGHT}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="14" y="27" width="36" height="26" rx="5" fill={CORAL} />
      <path
        d="M22 27V20C22 14.5 26.5 10 32 10C37.5 10 42 14.5 42 20V27"
        stroke={CORAL}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="39" r="4" fill="white" />
      <path d="M32 39V44" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 31.5L30.5 12H45L53 20V34.5L33.5 54L11 31.5Z"
        fill={CORAL}
      />
      <circle cx="42.5" cy="21.5" r="3" fill="white" />
      <path
        d="M23.2 28.1L37.8 42.7"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M29.3 22L42.5 35.2"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CertificateIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="11" y="12" width="42" height="31" rx="4" fill={CORAL} />
      <path d="M22 22H42" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M18 30H31" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="40" cy="37" r="8" fill="none" stroke="white" strokeWidth="3" />
      <path d="M40 32.5L41.4 35.5L44.8 35.9L42.3 38.2L42.9 41.5L40 40L37.1 41.5L37.7 38.2L35.2 35.9L38.6 35.5L40 32.5Z" fill="white" />
      <path d="M35 44V53L40 49.5L45 53V44" fill={CORAL} />
    </svg>
  );
}

function ChatIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 17C16 12.6 19.6 9 24 9H40C46.6 9 52 14.4 52 21V32C52 38.6 46.6 44 40 44H31.5L23 52V44C18.6 44 15 40.4 15 36V17H16Z"
        fill="white"
      />
      <path d="M24 22H39" stroke={CORAL} strokeWidth="4" strokeLinecap="round" />
      <path d="M24 30H34" stroke={CORAL} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function HeartHandIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M31.4 19.5L32 20L32.6 19.5C35.8 16.7 40.7 16.9 43.7 20C47 23.4 47 29 43.7 32.4L32 44L20.3 32.4C17 29 17 23.4 20.3 20C23.3 16.9 28.2 16.7 31.4 19.5Z"
        fill="white"
      />
      <path
        d="M22 38L29 31L33 35L42 26C44 24 47.3 24.1 49.1 26.2C50.8 28.2 50.6 31.2 48.7 33L35.8 45.6C33.7 47.7 30.3 47.7 28.2 45.6L22 39.4V38Z"
        fill="white"
      />
      <path
        d="M15 37.3L23.7 28.6C25 27.3 27.1 27.3 28.4 28.6C29.7 29.9 29.7 32 28.4 33.3L23.2 38.5L27 42.3L32.6 36.7C33.9 35.4 36 35.4 37.3 36.7C38.6 38 38.6 40.1 37.3 41.4L31.3 47.4C28.3 50.4 23.4 50.4 20.4 47.4L15 42V37.3Z"
        fill={CORAL}
      />
    </svg>
  );
}

function ShieldHeartIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 8L49 14.5V28.5C49 39 42.1 48.4 32 56C21.9 48.4 15 39 15 28.5V14.5L32 8Z"
        fill="white"
      />
      <path
        d="M31.3 24.3L32 25L32.7 24.3C34.8 22.2 38.1 22.2 40.2 24.3C42.3 26.4 42.3 29.8 40.2 31.9L32 40L23.8 31.9C21.7 29.8 21.7 26.4 23.8 24.3C25.9 22.2 29.2 22.2 31.3 24.3Z"
        fill={CORAL}
      />
    </svg>
  );
}

function CircularIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center rounded-full bg-[#ffe5db] text-white",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}

function benefitIcon(icon: BenefitCardProps["icon"], className?: string) {
  if (icon === "chat") {
    return <ChatIcon className={className} />;
  }

  if (icon === "tag") {
    return <TagIcon className={className} />;
  }

  return <HeartHandIcon className={className} />;
}

export function BenefitCard({
  icon,
  title,
  description,
  compact = false,
}: BenefitCardProps) {
  return (
    <article
      className={[
        "rounded-[24px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] text-center",
        compact ? "px-5 py-5 md:px-6 md:py-6" : "px-7 py-9 md:px-4 md:py-12",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <CircularIcon className={compact ? "mx-auto mb-3 h-12 w-12" : "mx-auto mb-6 h-18 w-18 md:mb-8 md:h-24 md:w-24"}>
        {benefitIcon(icon, compact ? "h-7 w-7" : "h-10 w-10 md:h-13 md:w-13")}
      </CircularIcon>
      <h3
        className={[
          "font-bold leading-snug text-text-body",
          compact ? "text-[16px] md:text-[18px]" : "text-[19px] md:text-[24px]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={[
            "mt-3 leading-relaxed text-text-light",
            compact ? "text-[13px] md:text-[14px]" : "text-[14px] md:text-[16px]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {description}
        </p>
      ) : null}
    </article>
  );
}

export function HeroFeatureStrip() {
  return (
    <div className="grid grid-cols-3 gap-2.5 md:gap-5">
      <div className="rounded-[18px] border border-white/60 bg-white/72 px-3 py-4 text-center backdrop-blur-sm md:rounded-[24px] md:px-7 md:py-6">
        <LockIcon className="mx-auto mb-2 h-7 w-7 md:mb-3 md:h-10 md:w-10" />
        <p className="text-[12px] font-bold leading-[1.35] tracking-[-0.02em] text-text-dark md:text-[18px]">
          익명 상담
          <br />
          보장
        </p>
      </div>
      <div className="rounded-[18px] border border-white/60 bg-white/72 px-3 py-4 text-center backdrop-blur-sm md:rounded-[24px] md:px-7 md:py-6">
        <TagIcon className="mx-auto mb-2 h-7 w-7 md:mb-3 md:h-10 md:w-10" />
        <p className="text-[12px] font-bold leading-[1.35] tracking-[-0.02em] text-text-dark md:text-[18px]">
          모든 회사
          <br />
          무료 상담 제공
        </p>
      </div>
      <div className="rounded-[18px] border border-white/60 bg-white/72 px-3 py-4 text-center backdrop-blur-sm md:rounded-[24px] md:px-7 md:py-6">
        <CertificateIcon className="mx-auto mb-2 h-7 w-7 md:mb-3 md:h-10 md:w-10" />
        <p className="text-[12px] font-bold leading-[1.35] tracking-[-0.02em] text-text-dark md:text-[18px]">
          전문 심리 상담가
          <br />
          서비스 제공
        </p>
      </div>
    </div>
  );
}

export function HeroBackdrop({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={iconClassName(className)}
      viewBox="0 0 820 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="orangeBody" x1="151" y1="232" x2="458" y2="605" gradientUnits="userSpaceOnUse">
          <stop stopColor={CORAL_DEEP} />
          <stop offset="1" stopColor={CORAL} />
        </linearGradient>
        <linearGradient id="purpleBody" x1="440" y1="182" x2="668" y2="681" gradientUnits="userSpaceOnUse">
          <stop stopColor={MAUVE} />
          <stop offset="1" stopColor={MAUVE_DEEP} />
        </linearGradient>
        <linearGradient id="faceTone" x1="416" y1="322" x2="560" y2="494" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffd8d2" />
          <stop offset="1" stopColor="#eab0a7" />
        </linearGradient>
      </defs>
      <circle cx="710" cy="138" r="42" fill={MAUVE} />
      <path d="M695 154C703 145 717 145 725 154" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <circle cx="695" cy="130" r="4" fill="white" />
      <circle cx="725" cy="130" r="4" fill="white" />
      <circle cx="475" cy="270" r="36" fill={CORAL} opacity="0.9" />
      <path d="M462 278C469 286 481 286 488 278" stroke="#fff4f1" strokeWidth="4" strokeLinecap="round" />
      <circle cx="462" cy="265" r="4" fill="#fff4f1" />
      <circle cx="488" cy="265" r="4" fill="#fff4f1" />
      <path
        d="M418 385C418 317 472 262 540 262H564C632 262 686 317 686 385V690H418V385Z"
        fill="url(#purpleBody)"
      />
      <path
        d="M318 354C318 275 379 210 458 204L480 202C559 196 628 256 634 335L661 690H278L318 354Z"
        fill="url(#orangeBody)"
      />
      <path
        d="M589 241C617 241 640 263 640 291V343H528V302C528 268 555 241 589 241Z"
        fill={TEXT_DARK}
      />
      <path
        d="M538 301C560 278 598 278 620 301C642 324 642 360 620 382L588 414L556 382C534 360 534 324 556 301H538Z"
        fill="url(#faceTone)"
      />
      <path
        d="M474 482C505 536 577 590 647 610L712 561L633 459C609 428 567 408 527 408H522C473 408 449 438 474 482Z"
        fill="#d88b7f"
      />
      <path
        d="M548 562C465 521 410 464 381 390"
        stroke={TEXT_DARK}
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M515 603C589 618 648 601 694 558"
        stroke={TEXT_DARK}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M401 500C368 454 330 454 314 490C303 515 311 561 340 602L430 608L401 500Z"
        fill="#f6c7bf"
      />
      <path
        d="M359 445C344 439 329 448 325 462L353 512L374 500L359 445Z"
        fill={TEXT_DARK}
      />
      <path
        d="M714 460C698 454 682 464 678 479L684 544L710 548L714 460Z"
        fill={TEXT_DARK}
      />
      <path
        d="M657 275C681 284 698 305 702 330L624 308L657 275Z"
        fill={TEXT_DARK}
      />
    </svg>
  );
}

function Legend({ accent }: { accent: string }) {
  return (
    <g fontFamily="Pretendard Variable, Pretendard, sans-serif" fontWeight="700" fontSize="18" fill={TEXT}>
      <circle cx="504" cy="36" r="9" fill={GREY} />
      <text x="523" y="41">사전</text>
      <circle cx="594" cy="36" r="9" fill={accent} />
      <text x="613" y="41">사후</text>
    </g>
  );
}

function Callout({
  cx,
  y,
  text,
  color,
}: {
  cx: number;
  y: number;
  text: string;
  color: string;
}) {
  const w = 164;
  const h = 48;
  const x = cx - w / 2;
  const ptr = 10;
  return (
    <g fontFamily="Pretendard Variable, Pretendard, sans-serif" fontWeight="700">
      <rect x={x} y={y} width={w} height={h} rx="12" fill={SURFACE} fillOpacity="0.94" stroke={SURFACE_LINE} strokeWidth="1.5" />
      <path
        d={`M${cx - 9} ${y + h}L${cx} ${y + h + ptr}L${cx + 9} ${y + h}`}
        fill={SURFACE}
        fillOpacity="0.94"
        stroke={SURFACE_LINE}
        strokeWidth="1.5"
      />
      <rect x={cx - 10} y={y + h - 1} width="20" height="3" fill={SURFACE} fillOpacity="0.94" />
      <text x={cx} y={y + h / 2 + 7} textAnchor="middle" fill={color} fontSize="18">
        {text}
      </text>
    </g>
  );
}

function BarPair({
  x,
  baseline,
  before,
  after,
  label,
  maxValue,
  afterGradientId,
  scaleMin,
}: {
  x: number;
  baseline: number;
  before: number;
  after: number;
  label: string;
  maxValue: number;
  afterGradientId: string;
  scaleMin?: number;
}) {
  const chartHeight = 265;
  let beforeHeight: number, afterHeight: number;
  if (scaleMin !== undefined) {
    const range = maxValue - scaleMin;
    beforeHeight = Math.max(0, ((before - scaleMin) / range) * chartHeight);
    afterHeight = Math.max(0, ((after - scaleMin) / range) * chartHeight);
  } else {
    const scale = chartHeight / maxValue;
    beforeHeight = before * scale;
    afterHeight = after * scale;
  }
  const beforeY = baseline - beforeHeight;
  const afterY = baseline - afterHeight;

  return (
    <g fontFamily="Pretendard Variable, Pretendard, sans-serif">
      <rect x={x} y={beforeY} width="38" height={beforeHeight} rx="19" fill="url(#beforeBar)" />
      <rect x={x + 48} y={afterY} width="38" height={afterHeight} rx="19" fill={`url(#${afterGradientId})`} />
      <text x={x + 19} y={beforeY - 12} fontSize="16" fontWeight="700" textAnchor="middle" fill={TEXT}>
        {before.toFixed(1)}
      </text>
      <text x={x + 67} y={afterY - 12} fontSize="16" fontWeight="700" textAnchor="middle" fill={afterGradientId === "afterPositive" ? CORAL : CORAL_DEEP}>
        {after.toFixed(1)}
      </text>
      <text x={x + 44} y={baseline + 30} fontSize="18" fontWeight="700" textAnchor="middle" fill={TEXT}>
        {label}
      </text>
    </g>
  );
}

export function MetricChart({ kind }: MetricChartProps) {
  const isPositive = kind === "positive";
  const accent = isPositive ? CORAL : CORAL_DEEP;
  const deltaText = isPositive ? "평균 8.85% 증가" : "평균 9.38% 감소";
  const data = isPositive
    ? [
        ["자아존중감", 61.0, 68.9],
        ["회복탄력성", 56.4, 63.2],
        ["삶의 만족도", 50.6, 62.3],
      ]
    : [
        ["우울감", 55.4, 45.3],
        ["불안감", 55.1, 44.6],
        ["스트레스", 65.5, 58.2],
        ["외로움", 63.0, 55.4],
      ];
  const maxValue = isPositive ? 76 : 70;
  const scaleMin = isPositive ? 46 : 42;
  const starts = isPositive ? [78, 244, 410] : [56, 182, 308, 434];
  const width = 660;
  const height = 470;
  const baseline = 390;

  return (
    <svg
      aria-hidden="true"
      className="h-auto w-full"
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="beforeBar" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={GREY} />
          <stop offset="1" stopColor={GREY} stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="afterPositive" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={CORAL} />
          <stop offset="1" stopColor={CORAL} stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="afterNegative" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor={CORAL_DEEP} />
          <stop offset="1" stopColor={CORAL_DEEP} stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width={width - 2} height={height - 2} rx="24" fill="#f7efed" />
      <Legend accent={accent} />
      <path d={`M44 ${baseline}H${width - 40}`} stroke="#dbc4bf" strokeWidth="1.5" />
      {starts.map((x, index) => {
        const [label, before, after] = data[index];
        return (
          <BarPair
            key={label}
            x={x}
            baseline={baseline}
            before={Number(before)}
            after={Number(after)}
            label={String(label)}
            maxValue={maxValue}
            afterGradientId={isPositive ? "afterPositive" : "afterNegative"}
            scaleMin={scaleMin}
          />
        );
      })}
      <Callout cx={330} y={68} text={deltaText} color={isPositive ? CORAL_DEEP : CORAL_DEEP} />
      {!isPositive && (
        <text
          x="330"
          y={height - 12}
          fontFamily="Pretendard Variable, Pretendard, sans-serif"
          fontSize="12"
          fontWeight="700"
          textAnchor="middle"
          fill="#b39f9a"
        >
          *자료 출처 : 서울시, 2023 청년 마음 건강 진단 검사 효과성 평가 결과 주요 내용
        </text>
      )}
    </svg>
  );
}

const PROCEDURE_STEPS = [
  {
    title: "01. 테스트",
    description: "PHQ9 테스트 우울증 테스트",
  },
  {
    title: "02. 맞춤 상담",
    description: "전문심리상담사 맞춤 상담을 진행해요",
  },
  {
    title: "03. 선물 증정",
    description: "상담 받고 선물받자!",
  },
  {
    title: "04. 최종 테스트",
    description: "4회 상담 마무리 후 테스트 진행",
  },
  {
    title: "05. 선물 증정",
    description: "우울감이 나아지신 분들에게는 축하 선물이 기다리고 있답니다",
  },
];

export function ProcedureTimeline({ compact = false }: ProcedureTimelineProps) {
  return (
    <div className="mx-auto max-w-[600px] overflow-hidden rounded-[22px] border border-[var(--color-border-soft)] bg-[var(--color-bg-white)] px-5 py-3 md:max-w-[840px] md:px-8 md:py-5">
      {PROCEDURE_STEPS.map((step) => (
        <div
          key={step.title}
          className={[
            "grid items-center",
            compact
              ? "grid-cols-[56px_1fr] gap-4 py-3"
              : "grid-cols-[88px_1fr] gap-7 py-4",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <DownChevronIcon className={compact ? "h-9 w-9" : "h-11 w-11"} />
          <div className="min-w-0 text-center">
            <span
              className={[
                "inline-flex rounded-xl bg-primary font-bold text-white",
                compact ? "px-4 py-1.5 text-[16px]" : "px-4 py-2 text-[18px]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {step.title}
            </span>
            <p
              className={[
                "mt-3 font-medium leading-relaxed text-text-sub",
                compact ? "text-[14px]" : "text-[17px]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HeroBadgeChip() {
  return (
    <div className="inline-flex items-center gap-2.5 text-[14px] font-medium tracking-[-0.015em] text-text-dark md:text-[20px] md:leading-[28px]">
      {/* <PreventionBadgeIcon className="h-[22px] w-[22px] md:h-6 md:w-6" /> */}
      <span>「우울증 개선 및 자살예방 SIB사업」</span>
    </div>
  );
}

export function SupportShield() {
  return (
    <CircularIcon className="h-32 w-32 md:h-36 md:w-36">
      <ShieldHeartIcon className="h-16 w-16 md:h-20 md:w-20" />
    </CircularIcon>
  );
}
