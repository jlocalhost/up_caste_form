/** Name and mobile number of the person filling the form. Format checks only — no OTP. */

export const SUBMITTER_NAME_MAX = 60;

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
// Letters in any script (incl. Devanagari vowel signs), spaces, dots, apostrophes and hyphens.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;

/**
 * Digits a worker means by their 10-digit number: drops spaces/dashes and a
 * leading +91, 91 or 0, then caps at 10 digits. Safe to run on every keystroke and paste.
 */
export function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function isValidPhone(phone: string): boolean {
  return INDIAN_MOBILE.test(phone);
}

export function cleanName(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function isValidName(name: string): boolean {
  const cleaned = cleanName(name);
  return cleaned.length >= 2 && cleaned.length <= SUBMITTER_NAME_MAX && NAME_PATTERN.test(cleaned);
}

/** "98765 43210" for display. */
export function formatPhone(phone: string): string {
  return phone.length === 10 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone;
}
