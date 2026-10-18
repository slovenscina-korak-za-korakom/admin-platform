"use client";

import { useState } from "react";
import { z } from "zod";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

export type Localized = {
  sl: string;
  ru: string;
  en: string;
  it: string;
};

export const BIO_LANGUAGES = [
  { code: "sl", label: "Slovene", required: true },
  { code: "ru", label: "Russian", required: true },
  { code: "en", label: "English", required: true },
  { code: "it", label: "Italian", required: false },
] as const;

type LangCode = (typeof BIO_LANGUAGES)[number]["code"];

export const localizedBioSchema = z.object({
  sl: z.string().min(1, "Slovene bio is required"),
  ru: z.string().min(1, "Russian bio is required"),
  en: z.string().min(1, "English bio is required"),
  it: z.string(),
});

export const EMPTY_LOCALIZED: Localized = { sl: "", ru: "", en: "", it: "" };

export function normalizeLocalized(value: unknown): Localized {
  if (!value) return { ...EMPTY_LOCALIZED };
  if (typeof value === "string") return { ...EMPTY_LOCALIZED, en: value };
  if (typeof value === "object") return { ...EMPTY_LOCALIZED, ...(value as Partial<Localized>) };
  return { ...EMPTY_LOCALIZED };
}

interface LocalizedBioInputProps {
  value: Localized;
  onChange: (value: Localized) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  textareaClassName?: string;
}

export function LocalizedBioInput({
  value,
  onChange,
  rows = 4,
  placeholder,
  className,
  textareaClassName,
}: LocalizedBioInputProps) {
  const [active, setActive] = useState<LangCode>("sl");

  return (
    <div className={cn("space-y-2", className)}>
      {/* Language tabs — show required/filled state above the input */}
      <div className="flex flex-wrap gap-1 rounded-md bg-muted p-1">
        {BIO_LANGUAGES.map((lang) => {
          const filled = value[lang.code].trim().length > 0;
          const isActive = active === lang.code;
          const missing = lang.required && !filled;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActive(lang.code)}
              className={cn(
                "cursor-pointer flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {lang.label}
              {lang.required ? (
                filled ? (
                  <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                ) : (
                  <span className={cn("text-[11px] leading-none", missing && "text-destructive")}>*</span>
                )
              ) : (
                <span className="text-[10px] font-normal text-muted-foreground">(opt)</span>
              )}
            </button>
          );
        })}
      </div>

      <Textarea
        rows={rows}
        placeholder={placeholder}
        value={value[active]}
        onChange={(e) => onChange({ ...value, [active]: e.target.value })}
        className={textareaClassName}
      />
    </div>
  );
}
