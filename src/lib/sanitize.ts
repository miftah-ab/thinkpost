// ThinkPost AI — Input Sanitizer
// Strips HTML tags and script content from all string inputs (FR-B2)
// Used on every string write operation to prevent XSS / stored injection

/**
 * Strips HTML tags from a string. Removes script/style tag contents entirely,
 * then strips all remaining HTML tags.
 * 
 * This is NOT dangerouslySetInnerHTML — we never render raw HTML.
 * This sanitizer prevents storing malicious markup in the first place.
 */
export function sanitizeString(input: string): string {
  if (!input) return input;

  let sanitized = input;

  // Remove script tags and their contents entirely
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags and their contents entirely
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove all remaining HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Trim whitespace that may have been left behind
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitizes all string values in an object (shallow — one level deep).
 * Non-string values are passed through unchanged.
 * Arrays of strings are sanitized element-by-element.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    }
  }

  return sanitized;
}

/**
 * Sanitizes an array of Experience objects.
 * Each experience has string fields that need sanitizing.
 */
export function sanitizeExperienceArray(
  experiences: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    description: string;
  }>
): Array<{
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string;
}> {
  return experiences.map((exp) => ({
    title: sanitizeString(exp.title),
    company: sanitizeString(exp.company),
    startDate: sanitizeString(exp.startDate),
    endDate: exp.endDate ? sanitizeString(exp.endDate) : null,
    description: sanitizeString(exp.description),
  }));
}
