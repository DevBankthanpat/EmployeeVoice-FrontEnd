import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { defaultLocale, isLocale, LOCALE_COOKIE } from "./config";

/**
 * Locale is resolved from the LOCALE cookie (set by the locale switcher),
 * defaulting to Thai. This "without i18n routing" setup keeps the App Router
 * folder structure flat (see ARCHITECTURE.md §8); URL-based locales can be
 * layered on later if needed.
 */
export default getRequestConfig(async () => {
  const store = await cookies();
  const requested = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // A stable reference time for relative formatting (e.g. the signals feed's
    // "2 days ago"). Without a global `now`, next-intl's `relativeTime` logs an
    // ENVIRONMENT_FALLBACK error on the client; this configures it once.
    now: new Date(),
  };
});
