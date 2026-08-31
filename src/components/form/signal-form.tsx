"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Info, Loader2, Lock, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { AnonymityBadge } from "@/components/form/anonymity-badge";
import { EvidenceInput } from "@/components/form/evidence-input";
import { Field } from "@/components/form/field";
import { OptionChips } from "@/components/form/option-chips";
import { SegmentedControl } from "@/components/form/segmented-control";
import {
  type Draft,
  FIELD_ERROR_KEY,
  INITIAL_DRAFT,
  SECTION_FIELDS,
  sectionInvalidFields,
  TOTAL_STEPS,
  validateSubmission,
} from "@/components/form/signal-form.logic";
import { Stepper } from "@/components/form/stepper";
import { SubmissionSuccess } from "@/components/form/submission-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { provider } from "@/data/provider";
import type {
  Frequency,
  ImpactLevel,
  ImpactType,
  RelatedArea,
  SignalSubmission,
  SignalType,
  SubmitSignalResult,
  WorkflowStage,
} from "@/data/schemas";
import {
  FREQUENCIES,
  IMPACT_LEVELS,
  IMPACT_TYPES,
  RELATED_AREAS,
  SIGNAL_TYPE_ICONS,
  SIGNAL_TYPES,
  WORKFLOW_STAGES,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

function SectionHeading({ title, help }: { title: string; help?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {help && <p className="text-sm text-muted-foreground">{help}</p>}
    </div>
  );
}

function ConsentRow({
  id,
  checked,
  onChange,
  label,
  help,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  help: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-labelledby={`${id}-label`}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-0.5">
        <span id={`${id}-label`} className="text-sm font-medium">
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{help}</span>
      </div>
    </div>
  );
}

export function SignalForm() {
  const t = useTranslations("signalForm");
  const tSuccess = useTranslations("submitSuccess");
  const tType = useTranslations("enums.signalType");
  const tFreq = useTranslations("enums.frequency");
  const tImpactType = useTranslations("enums.impactType");
  const tImpactLevel = useTranslations("enums.impactLevel");
  const tArea = useTranslations("enums.relatedArea");
  const tStage = useTranslations("enums.workflowStage");

  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>(
    {},
  );
  const [showBanner, setShowBanner] = useState(false);
  const [result, setResult] = useState<SubmitSignalResult | null>(null);

  const mutation = useMutation({
    mutationFn: (input: SignalSubmission) => provider.submitSignal(input),
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
    },
  });

  const signalTypeOptions = useMemo(
    () =>
      SIGNAL_TYPES.map((value) => ({
        value,
        label: tType(value),
        icon: SIGNAL_TYPE_ICONS[value],
      })),
    [tType],
  );
  const frequencyOptions = useMemo(
    () => FREQUENCIES.map((value) => ({ value, label: tFreq(value) })),
    [tFreq],
  );
  const impactTypeOptions = useMemo(
    () => IMPACT_TYPES.map((value) => ({ value, label: tImpactType(value) })),
    [tImpactType],
  );
  const impactLevelOptions = useMemo(
    () => IMPACT_LEVELS.map((value) => ({ value, label: tImpactLevel(value) })),
    [tImpactLevel],
  );
  const relatedAreaOptions = useMemo(
    () => RELATED_AREAS.map((value) => ({ value, label: tArea(value) })),
    [tArea],
  );
  const workflowStageOptions = useMemo(
    () => WORKFLOW_STAGES.map((value) => ({ value, label: tStage(value) })),
    [tStage],
  );

  function patch(next: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...next }));
    setErrors((current) => {
      const copy = { ...current };
      for (const key of Object.keys(next)) delete copy[key as keyof Draft];
      return copy;
    });
    setShowBanner(false);
  }

  function messagesFor(fields: (keyof Draft)[]) {
    const next: Partial<Record<keyof Draft, string>> = {};
    for (const field of fields) {
      next[field] = t(FIELD_ERROR_KEY[field] ?? "fixErrors");
    }
    return next;
  }

  function goNext() {
    const invalid = sectionInvalidFields(step, draft);
    if (invalid.length > 0) {
      setErrors(messagesFor(invalid));
      setShowBanner(true);
      return;
    }
    setErrors({});
    setShowBanner(false);
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
  }

  function goToStep(target: number) {
    if (target <= step) {
      setStep(target);
      setErrors({});
      setShowBanner(false);
    }
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
    setErrors({});
    setShowBanner(false);
  }

  function onSubmit() {
    const validation = validateSubmission(draft);
    if (!validation.ok) {
      const badFields = (SECTION_FIELDS[validation.firstSection] ?? []).filter(
        (field) => validation.invalid.has(field),
      );
      setErrors(messagesFor(badFields));
      setShowBanner(true);
      setStep(validation.firstSection);
      return;
    }
    mutation.mutate(validation.data);
  }

  function reset() {
    setDraft(INITIAL_DRAFT);
    setErrors({});
    setShowBanner(false);
    setStep(0);
    setResult(null);
    mutation.reset();
  }

  if (result) {
    return <SubmissionSuccess result={result} onSubmitAnother={reset} />;
  }

  const stepLabels = [
    t("steps.type"),
    t("steps.detail"),
    t("steps.optional"),
    t("steps.consent"),
  ];
  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <AnonymityBadge />
        </div>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Stepper steps={stepLabels} current={step} onStepClick={goToStep} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-normal text-muted-foreground">
            {t("stepOf", { current: step + 1, total: TOTAL_STEPS })}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Section 1 — Signal Type */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <SectionHeading
                title={t("section1Title")}
                help={t("section1Help")}
              />
              <OptionChips
                layout="grid"
                options={signalTypeOptions}
                value={draft.signalTypes}
                onChange={(next) =>
                  patch({ signalTypes: next as SignalType[] })
                }
                invalid={Boolean(errors.signalTypes)}
                ariaLabel={t("section1Title")}
              />
              {errors.signalTypes && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.signalTypes}
                </p>
              )}
            </div>
          )}

          {/* Section 2 — Detail */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <SectionHeading title={t("section2Title")} />
              <Field
                label={t("titleLabel")}
                htmlFor="title"
                required
                error={errors.title}
              >
                <Input
                  id="title"
                  value={draft.title}
                  maxLength={200}
                  onChange={(event) => patch({ title: event.target.value })}
                  placeholder={t("titlePlaceholder")}
                  aria-invalid={Boolean(errors.title) || undefined}
                />
              </Field>
              <Field
                label={t("descriptionLabel")}
                htmlFor="description"
                required
                error={errors.description}
              >
                <Textarea
                  id="description"
                  value={draft.description}
                  onChange={(event) =>
                    patch({ description: event.target.value })
                  }
                  placeholder={t("descriptionPlaceholder")}
                  aria-invalid={Boolean(errors.description) || undefined}
                />
              </Field>
              <Field
                label={t("frequencyLabel")}
                htmlFor="frequency"
                required
                error={errors.frequency}
              >
                <Select
                  id="frequency"
                  value={draft.frequency}
                  onValueChange={(value) =>
                    patch({ frequency: (value as Frequency) ?? null })
                  }
                  options={frequencyOptions}
                  placeholder={t("frequencyPlaceholder")}
                  invalid={Boolean(errors.frequency)}
                />
              </Field>
              <Field
                label={t("impactTypeLabel")}
                description={t("impactTypeHelp")}
                required
                error={errors.impactTypes}
              >
                <OptionChips
                  options={impactTypeOptions}
                  value={draft.impactTypes}
                  onChange={(next) =>
                    patch({ impactTypes: next as ImpactType[] })
                  }
                  invalid={Boolean(errors.impactTypes)}
                  ariaLabel={t("impactTypeLabel")}
                />
              </Field>
              <Field
                label={t("impactLevelLabel")}
                required
                error={errors.impactLevel}
              >
                <SegmentedControl
                  options={impactLevelOptions}
                  value={draft.impactLevel}
                  onChange={(value) =>
                    patch({ impactLevel: value as ImpactLevel })
                  }
                  invalid={Boolean(errors.impactLevel)}
                  ariaLabel={t("impactLevelLabel")}
                />
              </Field>
            </div>
          )}

          {/* Section 3 — Optional */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <SectionHeading
                title={t("section3Title")}
                help={t("section3Help")}
              />
              <Field label={t("relatedAreaLabel")} hint={t("optional")}>
                <OptionChips
                  options={relatedAreaOptions}
                  value={draft.relatedAreas}
                  onChange={(next) =>
                    patch({ relatedAreas: next as RelatedArea[] })
                  }
                  ariaLabel={t("relatedAreaLabel")}
                />
              </Field>
              <Field
                label={t("improvementLabel")}
                htmlFor="improvement"
                hint={t("optional")}
              >
                <Textarea
                  id="improvement"
                  value={draft.improvementSuggestion}
                  onChange={(event) =>
                    patch({ improvementSuggestion: event.target.value })
                  }
                  placeholder={t("improvementPlaceholder")}
                />
              </Field>
              <Field
                label={t("effectivenessLabel")}
                description={t("effectivenessHelp")}
                hint={t("optional")}
              >
                <div
                  role="radiogroup"
                  aria-label={t("effectivenessLabel")}
                  className="flex items-center gap-2"
                >
                  {[1, 2, 3, 4, 5].map((score) => {
                    const selected = draft.effectivenessScore === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => patch({ effectivenessScore: score })}
                        className={cn(
                          "size-9 rounded-lg border text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background hover:bg-muted",
                        )}
                      >
                        {score}
                      </button>
                    );
                  })}
                  {draft.effectivenessScore != null && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => patch({ effectivenessScore: null })}
                    >
                      {t("effectivenessClear")}
                    </Button>
                  )}
                </div>
              </Field>
              <Field
                label={t("workflowStageLabel")}
                htmlFor="workflow-stage"
                hint={t("optional")}
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select
                      id="workflow-stage"
                      value={draft.workflowStage}
                      onValueChange={(value) =>
                        patch({
                          workflowStage: (value as WorkflowStage) ?? null,
                        })
                      }
                      options={workflowStageOptions}
                      placeholder={t("workflowStagePlaceholder")}
                    />
                  </div>
                  {draft.workflowStage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => patch({ workflowStage: null })}
                    >
                      {t("effectivenessClear")}
                    </Button>
                  )}
                </div>
              </Field>
              <Field
                label={t("evidenceLabel")}
                description={t("evidenceHelp")}
                hint={t("optional")}
              >
                <EvidenceInput
                  value={draft.evidence}
                  onChange={(next) => patch({ evidence: next })}
                />
              </Field>
              <Field
                label={t("notesLabel")}
                htmlFor="notes"
                hint={t("optional")}
              >
                <Textarea
                  id="notes"
                  value={draft.notes}
                  onChange={(event) => patch({ notes: event.target.value })}
                  placeholder={t("notesPlaceholder")}
                />
              </Field>
            </div>
          )}

          {/* Section 4 — Privacy & Consent */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <SectionHeading
                title={t("section4Title")}
                help={t("section4Help")}
              />
              <div className="flex flex-col gap-3">
                <ConsentRow
                  id="consent-statistics"
                  checked={draft.consentStatistics}
                  onChange={(checked) => patch({ consentStatistics: checked })}
                  label={t("consentStatisticsLabel")}
                  help={t("consentStatisticsHelp")}
                />
                <ConsentRow
                  id="consent-ai"
                  checked={draft.consentAi}
                  onChange={(checked) => patch({ consentAi: checked })}
                  label={t("consentAiLabel")}
                  help={t("consentAiHelp")}
                />
                <ConsentRow
                  id="anonymous"
                  checked={draft.isAnonymous}
                  onChange={(checked) => patch({ isAnonymous: checked })}
                  label={t("anonymousLabel")}
                  help={t("anonymousHelp")}
                />
              </div>

              {/* Live reassurance — switches with the anonymous toggle. */}
              {draft.isAnonymous ? (
                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-accent/60 p-4">
                  <Lock
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    strokeWidth={1.5}
                  />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-accent-foreground">
                      {tSuccess("anonTitle")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tSuccess("anonBody")}
                    </p>
                  </div>
                </div>
              ) : (
                <AnonymityBadge variant="panel" />
              )}
            </div>
          )}

          {showBanner && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              <Info className="size-4 shrink-0" strokeWidth={1.5} />
              {t("fixErrors")}
            </p>
          )}

          {mutation.isError && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              <Info className="size-4 shrink-0" strokeWidth={1.5} />
              {t("submitError")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={step === 0 || mutation.isPending}
          className={cn(step === 0 && "invisible")}
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} />
          {t("back")}
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            size="lg"
            onClick={onSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <Send className="size-4" strokeWidth={1.5} />
            )}
            {mutation.isPending ? t("submitting") : t("submit")}
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={goNext}>
            {t("next")}
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </Button>
        )}
      </div>
    </div>
  );
}
