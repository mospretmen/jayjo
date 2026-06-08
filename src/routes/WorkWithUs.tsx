import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { workWithUsPage } from "@/content/pages/work-with-us";
import { toast } from "sonner";

export default function WorkWithUs() {
  return (
    <Section>
      <EyebrowHeading
        eyebrow={workWithUsPage.eyebrow}
        title={workWithUsPage.title}
        level={1}
      />
      <div className="mt-6 max-w-prose space-y-4 text-text">
        {workWithUsPage.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Wired to /api/forms-contact in Plan 4
          toast.success("Thanks — we'll be in touch soon.");
          (e.currentTarget as HTMLFormElement).reset();
        }}
        className="mt-12 grid max-w-2xl gap-5"
      >
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
        <div className="space-y-1.5">
          <label htmlFor="message" className="block text-sm text-text">
            Tell us about the project
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="block w-full rounded-md border border-border bg-bg-elevated px-3 py-2.5 text-text outline-none focus:border-accent"
          />
        </div>
        <div>
          <Button type="submit" size="lg">
            Send
          </Button>
        </div>
      </form>
    </Section>
  );
}
