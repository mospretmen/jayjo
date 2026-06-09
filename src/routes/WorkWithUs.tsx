import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { workWithUsPage } from "@/content/pages/work-with-us";
import { toast } from "sonner";
import {
  validateContact,
  sanitizeText,
  sanitizeEmail,
  type FieldErrors,
  type ContactInput,
} from "@/lib/validation";

type Errors = FieldErrors<ContactInput>;

export default function WorkWithUs() {
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData(e.currentTarget);
    const form: ContactInput = {
      name: sanitizeText(String(data.get("name") ?? ""), 100),
      email: sanitizeEmail(String(data.get("email") ?? "")),
      company: sanitizeText(String(data.get("company") ?? ""), 200),
      projectType: sanitizeText(String(data.get("projectType") ?? ""), 50),
      budget: sanitizeText(String(data.get("budget") ?? ""), 100),
      timeline: sanitizeText(String(data.get("timeline") ?? ""), 100),
      message: sanitizeText(String(data.get("message") ?? ""), 5000),
    };
    const errs = validateContact(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitting(false);
      // Move focus to first invalid field
      const firstKey = Object.keys(errs)[0];
      const el = e.currentTarget.querySelector<HTMLElement>(`[name="${firstKey}"]`);
      el?.focus();
      toast.error("Please fix the highlighted fields.");
      return;
    }

    // Backend wires in Plan 4 — for now, simulate a request so we exercise
    // the loading state and surface a friendly success/failure UX.
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.success("Thanks — we'll be in touch soon.");
      (e.currentTarget as HTMLFormElement).reset();
      setErrors({});
    } catch {
      toast.error("Could not send right now. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  function clearError(field: keyof Errors) {
    if (!errors[field]) return;
    const next = { ...errors };
    delete next[field];
    setErrors(next);
  }

  return (
    <section className="container-page py-6 md:py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-start lg:gap-12">
        <div className="space-y-3">
          <p className="eyebrow">{workWithUsPage.eyebrow}</p>
          <h1 className="font-display text-2xl text-text md:text-3xl">{workWithUsPage.title}</h1>
          <p className="text-sm leading-relaxed text-text-muted">{workWithUsPage.body[0]}</p>
          <p className="text-sm leading-relaxed text-text-muted">{workWithUsPage.body[1]}</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="rounded-lg border border-border bg-bg-elevated p-5 md:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="name"
              label="Your name"
              required
              maxLength={100}
              autoComplete="name"
              error={errors.name}
              onChange={() => clearError("name")}
            />
            <Input
              name="email"
              label="Email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              inputMode="email"
              error={errors.email}
              onChange={() => clearError("email")}
            />
            <Input
              name="company"
              label="Company (optional)"
              maxLength={200}
              autoComplete="organization"
            />
            <Select
              name="projectType"
              label="Project type"
              required
              defaultValue=""
              error={errors.projectType}
              onChange={() => clearError("projectType")}
            >
              <option value="" disabled>Select…</option>
              {workWithUsPage.projectTypes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
            <Input
              name="budget"
              label="Budget (optional)"
              placeholder="e.g. $2k–$8k"
              maxLength={100}
            />
            <Input
              name="timeline"
              label="Timeline (optional)"
              placeholder="e.g. installing in March"
              maxLength={100}
            />
          </div>
          <div className="mt-4 space-y-1.5">
            <label htmlFor="message" className="block text-sm text-text">
              Tell us about the project
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              required
              maxLength={5000}
              onChange={() => clearError("message")}
              aria-invalid={errors.message ? "true" : "false"}
              aria-describedby={errors.message ? "message-error" : undefined}
              className="block w-full rounded-md border border-border bg-bg px-3 py-2.5 text-text outline-none focus:border-accent"
            />
            {errors.message && (
              <p id="message-error" className="text-xs text-fig">{errors.message}</p>
            )}
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs text-text-muted">We typically reply within 2 business days.</p>
            <Button type="submit" size="md" disabled={submitting}>
              {submitting ? "Sending…" : "Send inquiry"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
