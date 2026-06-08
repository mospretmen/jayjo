import { Section } from "@/components/ui/Section";
import { EyebrowHeading } from "@/components/ui/EyebrowHeading";
import { aboutPage } from "@/content/pages/about";
import { Reveal } from "@/components/motion/Reveal";

export default function About() {
  return (
    <Section>
      <Reveal>
        <EyebrowHeading eyebrow={aboutPage.eyebrow} title={aboutPage.title} level={1} />
      </Reveal>
      <div className="mt-10 max-w-prose space-y-6 text-text">
        {aboutPage.body.map((p, i) => (
          <Reveal key={i} delay={0.06 * i}>
            <p>{p}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
