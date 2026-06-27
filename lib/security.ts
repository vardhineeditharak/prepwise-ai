/**
 * Security helper utilities for Input Validation & Sanitization.
 * Prevents Cross-Site Scripting (XSS) and Script Injections.
 */

/**
 * Sanitizes input string to remove any HTML tags, especially script and iframe tags.
 */
export function sanitizeInput(text: string): string {
  if (!text) return "";
  // Strip script tags and content entirely
  let clean = text.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  // Strip iframe tags and content
  clean = clean.replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, "");
  // Strip style tags and content
  clean = clean.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
  // Strip generic HTML tags but leave text inside
  clean = clean.replace(/<\/?[a-z][^>]*>/gi, "");
  // Strip javascript: pseudo-protocol strings
  clean = clean.replace(/javascript:/gi, "");
  // Trim spaces
  return clean.trim();
}

/**
 * Validates email structure.
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

/**
 * Validates text length against max limit to prevent buffer overflows / payload abuse.
 */
export function validateLength(text: string, maxLength: number): boolean {
  if (!text) return true;
  return text.length <= maxLength;
}

/**
 * Validates role names (alphanumeric, spaces, dashes, parentheses).
 */
export function validateRole(role: string): boolean {
  if (!role) return false;
  const clean = sanitizeInput(role);
  if (clean.length === 0) return false;
  // Allow letters, numbers, spaces, dashes, commas, parentheses
  const re = /^[a-zA-Z0-9\s\-,\(\)]+$/;
  return re.test(clean) && clean.length <= 100;
}
