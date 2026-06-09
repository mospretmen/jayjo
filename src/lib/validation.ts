/**
 * Lightweight client-side form validation + sanitization.
 *
 * Sanitization here is intentionally conservative — we strip C0 control characters
 * (except \t \n \r), collapse runs of whitespace, and trim/clamp length. We do
 * NOT strip HTML on the client; any persistence path validates again on the
 * server (Zod schemas + DB parameterised queries) so the server is authoritative.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Built dynamically so the source file stays free of literal control characters
// (which would otherwise trip eslint's no-irregular-whitespace rule).
// Matches U+0000–U+0008, U+000B, U+000C, U+000E–U+001F, U+007F.
const CONTROL_CHARS_RE = (() => {
  const ranges = [
    [0x00, 0x08],
    [0x0b, 0x0c],
    [0x0e, 0x1f],
    [0x7f, 0x7f],
  ];
  const chars = ranges
    .map(([from, to]) =>
      Array.from({ length: to - from + 1 }, (_, i) => String.fromCharCode(from + i)).join(""),
    )
    .join("");
  return new RegExp(`[${chars}]`, "g");
})();

export function sanitizeText(input: string, maxLen = 5000): string {
  return input.replace(CONTROL_CHARS_RE, "").replace(/\s+/g, " ").trim().slice(0, maxLen);
}

export function sanitizeEmail(input: string): string {
  return input.trim().toLowerCase().slice(0, 254);
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface ContactInput {
  name: string;
  email: string;
  company?: string;
  projectType: string;
  budget?: string;
  timeline?: string;
  message: string;
}

export function validateContact(form: ContactInput): FieldErrors<ContactInput> {
  const errors: FieldErrors<ContactInput> = {};
  const name = sanitizeText(form.name, 100);
  if (name.length < 2) errors.name = "Please enter your name.";

  const email = sanitizeEmail(form.email);
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

  if (!form.projectType) errors.projectType = "Choose a project type.";

  const message = sanitizeText(form.message, 5000);
  if (message.length < 10) {
    errors.message = "Tell us a little more about the project (at least 10 characters).";
  }
  return errors;
}

export function validateNewsletter(email: string): string | undefined {
  const e = sanitizeEmail(email);
  if (!e) return "Enter your email to subscribe.";
  if (!EMAIL_RE.test(e)) return "That email doesn't look right.";
  return undefined;
}
