import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { workWithUsPage } from "@/content/pages/work-with-us";
import { toast } from "sonner";

export default function WorkWithUs() {
  return (
    <section className="container-page py-10 md:py-12 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start">
        <div className="space-y-4">
          <p className="eyebrow">{workWithUsPage.eyebrow}</p>
          <h1 className="font-display text-3xl text-text md:text-4xl">{workWithUsPage.title}</h1>
          <p className="text-sm leading-relaxed text-text-muted">{workWithUsPage.body[0]}</p>
          <p className="text-sm leading-relaxed text-text-muted">{workWithUsPage.body[1]}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Wired to /api/forms-contact in Plan 4
            toast.success("Thanks — we'll be in touch soon.");
            (e.currentTarget as HTMLFormElement).reset();
          }}
          className="rounded-lg border border-border bg-bg-elevated p-6 md:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="name" label="Your name" required />
            <Input name="email" label="Email" type="email" required />
            <Input name="company" label="Company (optional)" />
            <Select name="project_type" label="Project type" required defaultValue="">
              <option value="" disabled>
                Select…
              </option>
              {workWithUsPage.projectTypes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
            <Input name="budget" label="Budget (optional)" placeholder="e.g. $2k–$8k" />
            <Input
              name="timeline"
              label="Timeline (optional)"
              placeholder="e.g. installing in March"
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
              className="block w-full rounded-md border border-border bg-bg px-3 py-2.5 text-text outline-none focus:border-accent"
            />
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-xs text-text-muted">We typically reply within 2 business days.</p>
            <Button type="submit" size="md">
              Send inquiry
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
