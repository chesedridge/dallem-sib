"use client";

type SurveyStepActionsProps = {
  formId: string;
  primaryLabel: string;
  isPrimaryDisabled: boolean;
  onPrevious?: () => void;
  isPreviousDisabled?: boolean;
};

export function SurveyStepActions({
  formId,
  primaryLabel,
  isPrimaryDisabled,
  onPrevious,
  isPreviousDisabled,
}: SurveyStepActionsProps) {
  return (
    <div className="fixed bottom-0 left-1/2 z-20 w-full max-w-[450px] -translate-x-1/2 border-t border-border-soft bg-[rgba(255,253,252,0.96)] p-4 backdrop-blur-sm md:static md:mx-auto md:mt-8 md:max-w-[48rem] md:translate-x-0 md:border-0 md:bg-transparent md:backdrop-blur-none">
      <div className="flex gap-3">
        {onPrevious ? (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isPreviousDisabled}
            className="min-h-14 flex-1 rounded-full border border-border-strong bg-white px-5 py-3 text-base font-semibold text-text-body transition-[background-color,scale] duration-150 hover:bg-bg-gray focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            이전
          </button>
        ) : null}
        <button
          type="submit"
          form={formId}
          disabled={isPrimaryDisabled}
          className="min-h-14 flex-[2] rounded-full bg-primary px-5 py-3 text-base font-semibold text-white transition-[background-color,scale] duration-150 hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
