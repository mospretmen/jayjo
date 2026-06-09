import { Link } from "react-router-dom";
import { aboutPage } from "@/content/pages/about";
import { Reveal } from "@/components/motion/Reveal";

export default function About() {
  return (
    <section className="container-page py-6 md:py-8">
      <div className="grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-12 lg:gap-16">
        {/* Editorial spread image — landscape, capped under the viewport */}
        <Reveal>
          <figure className="space-y-2">
            <div className="overflow-hidden rounded-lg">
              <img
                src="/hero/featured-arrangement.jpg"
                alt="An arrangement from the Warm Study series"
                loading="eager"
                decoding="async"
                className="block aspect-[4/3] w-full object-cover md:aspect-[3/4] md:max-h-[68vh]"
              />
            </div>
            <figcaption className="text-xs text-text-muted">
              Warm Study, photographed in the studio.
            </figcaption>
          </figure>
        </Reveal>

        <div className="space-y-4 text-text md:space-y-5">
          <div>
            <p className="eyebrow">{aboutPage.eyebrow}</p>
            <h1 className="mt-1 font-display text-3xl text-text md:text-4xl lg:text-5xl">
              {aboutPage.title}
            </h1>
          </div>

          {aboutPage.body.map((p, i) => (
            <Reveal key={i} delay={0.06 * i}>
              <p className="text-sm leading-relaxed text-text-muted md:text-base">{p}</p>
            </Reveal>
          ))}

          <Reveal delay={0.24}>
            <div className="flex flex-wrap gap-3 pt-3">
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
