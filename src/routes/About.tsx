import { Link } from "react-router-dom";
import { aboutPage } from "@/content/pages/about";
import { Reveal } from "@/components/motion/Reveal";

export default function About() {
  return (
    <section className="container-page py-6 md:py-10">
      <header className="mb-8 max-w-2xl border-b border-border pb-5">
        <p className="eyebrow">{aboutPage.eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl text-text md:text-3xl">{aboutPage.title}</h1>
      </header>

      <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14 lg:gap-20">
        {/* Editorial spread image */}
        <Reveal>
          <figure className="space-y-3">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src="/hero/featured-arrangement.jpg"
                alt="An interior view of a Studio JayJo arrangement"
                loading="eager"
                decoding="async"
                className="block aspect-[3/4] w-full object-cover"
              />
            </div>
            <figcaption className="text-xs text-text-muted">
              An arrangement from the Warm Study series, photographed in the studio.
            </figcaption>
          </figure>
        </Reveal>

        <div className="space-y-6 text-text">
          {aboutPage.body.map((p, i) => (
            <Reveal key={i} delay={0.06 * i}>
              <p className="leading-relaxed">{p}</p>
            </Reveal>
          ))}

          <Reveal delay={0.24}>
            <div className="border-t border-border pt-6">
              <p className="eyebrow mb-3">In the studio</p>
              <p className="leading-relaxed text-text-muted">
                Every piece is painted in a single sitting in natural light. Originals are
                photographed and listed within a week. Prints are pulled in small editions on
                cotton rag, signed and numbered.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/shop"
                className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-bg outline-none transition hover:bg-burnt focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Browse the studio
              </Link>
              <Link
                to="/work-with-us"
                className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-text outline-none transition hover:bg-bg-elevated focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Work with us
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
