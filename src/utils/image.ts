const PROXY_HOST_PATTERNS = [
  /(^|\.)animepahe\./i,
  /(^|\.)pahe\./i,
  /(^|\.)animekai\./i,
  /(^|\.)anikai\./i,
  /(^|\.)gojo\./i,
  /(^|\.)akamaized\.net$/i,
];

export const getDisplayImageUrl = (
  url?: string | null
): string => {
  const value = String(url || "").trim();

  if (!value) return "";

  if (
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  try {
    const parsed = new URL(value);

    const shouldProxy =
      PROXY_HOST_PATTERNS.some((pattern) =>
        pattern.test(parsed.hostname)
      );

    // No backend anymore, so return direct image URL
    return shouldProxy ? value : value;
  } catch {
    return value;
  }
};