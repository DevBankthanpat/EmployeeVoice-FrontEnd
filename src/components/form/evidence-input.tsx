"use client";

import {
  Image as ImageIcon,
  Link2,
  type LucideIcon,
  Paperclip,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { EvidenceItem, EvidenceType } from "@/data/schemas";
import { EVIDENCE_TYPES } from "@/lib/taxonomy";

const EVIDENCE_ICON: Record<EvidenceType, LucideIcon> = {
  image: ImageIcon,
  screenshot: ImageIcon,
  file: Paperclip,
  url: Link2,
};

/**
 * Editor for the optional evidence list (image / screenshot / file / url).
 * File attachments only capture metadata here — the mock doesn't upload
 * (real S3/MinIO upload lands in Phase 7). Produces `EvidenceItem`s that
 * satisfy `EvidenceItemSchema` (url items carry `url`; file items carry
 * `fileName`).
 */
export function EvidenceInput({
  value,
  onChange,
}: {
  value: EvidenceItem[];
  onChange: (next: EvidenceItem[]) => void;
}) {
  const t = useTranslations("evidence");
  const tEnum = useTranslations("enums.evidenceType");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingType, setPendingType] = useState<EvidenceType>("image");
  const [pendingUrl, setPendingUrl] = useState("");
  const [urlError, setUrlError] = useState(false);

  function add(item: EvidenceItem) {
    onChange([...value, item]);
  }

  function remove(id: string) {
    onChange(value.filter((item) => item.id !== id));
  }

  function addUrl() {
    const url = pendingUrl.trim();
    try {
      new URL(url);
    } catch {
      setUrlError(true);
      return;
    }
    add({ id: crypto.randomUUID(), type: "url", url });
    setPendingUrl("");
    setUrlError(false);
  }

  function onFilePicked(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      add({
        id: crypto.randomUUID(),
        type: pendingType,
        fileName: file.name,
        mime: file.type || null,
        sizeBytes: file.size,
      });
    }
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
  }

  const typeOptions = EVIDENCE_TYPES.map((type) => ({
    value: type,
    label: tEnum(type),
  }));

  return (
    <div className="flex flex-col gap-3">
      {/* Existing items */}
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((item) => {
            const Icon = EVIDENCE_ICON[item.type];
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
              >
                <Icon
                  className="size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm">
                    {item.type === "url" ? item.url : item.fileName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tEnum(item.type)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(item.id!)}
                  aria-label={t("remove")}
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add control */}
      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="sm:w-40">
            <Select
              value={pendingType}
              onValueChange={(next) => {
                setPendingType((next as EvidenceType) ?? "image");
                setUrlError(false);
              }}
              options={typeOptions}
              ariaLabel={t("typeLabel")}
            />
          </div>

          {pendingType === "url" ? (
            <div className="flex flex-1 gap-2">
              <Input
                type="url"
                inputMode="url"
                value={pendingUrl}
                onChange={(event) => {
                  setPendingUrl(event.target.value);
                  setUrlError(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addUrl();
                  }
                }}
                placeholder={t("urlPlaceholder")}
                aria-invalid={urlError || undefined}
                aria-label={t("urlLabel")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addUrl}
                disabled={pendingUrl.trim().length === 0}
              >
                <Plus className="size-4" strokeWidth={1.5} />
                {t("add")}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="sm:flex-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" strokeWidth={1.5} />
              {t("pick")}
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onFilePicked}
          />
        </div>
        <p className="text-xs text-muted-foreground">{t("note")}</p>
      </div>
    </div>
  );
}
