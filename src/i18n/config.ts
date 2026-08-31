/**
 * Client-safe i18n constants (no server-only imports), shared by the request
 * config and the locale switcher. TH is the default per the target audience.
 */
export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "th";
export const LOCALE_COOKIE = "LOCALE";

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}
