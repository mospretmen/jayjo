/**
 * Generate placeholder art via xAI Grok (`grok-2-image-1212`).
 *
 * Reads XAI_API_KEY from process.env. For each entry in the JOBS list,
 * generates one image and writes it to the target path.
 *
 * Usage:
 *   XAI_API_KEY=xai-... npx tsx scripts/grok-generate-art.ts
 *
 * Run again to regenerate (each call hits the API). Skip individual jobs
 * by removing them from JOBS.
 */
import { writeFile } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

interface Job {
  out: string;
  prompt: string;
}

const STUDIO_VOCABULARY =
  "warm earth-tone painting, parchment background, cocoa and walnut shadows, cognac and deep fig accents, " +
  "muted olive moss, oil on linen aesthetic, gallery-quality, soft natural light, no text, no signature, " +
  "minimalist composition, painterly brushwork, archival fine-art aesthetic";

const JOBS: Job[] = [
  {
    out: "public/art/evening-fig/main.jpg",
    prompt:
      `Still-life painting of a single ripe fig on a parchment-coloured linen cloth, evening light, ` +
      `deep fig burgundy and warm walnut tones, vertical 4:5 composition. ${STUDIO_VOCABULARY}`,
  },
  {
    out: "public/art/olive-grove/main.jpg",
    prompt:
      `An olive grove in late-afternoon light, three weathered trees, olive moss greens and warm greige sky, ` +
      `vertical 4:5 composition, oil on linen, painterly. ${STUDIO_VOCABULARY}`,
  },
  {
    out: "public/art/cognac-still/main.jpg",
    prompt:
      `Still-life with a single bone-coloured ceramic bowl on a cognac leather surface, warm walnut shadow, ` +
      `vertical 4:5 composition, restrained composition. ${STUDIO_VOCABULARY}`,
  },
  {
    out: "public/art/parchment-bloom/main.jpg",
    prompt:
      `A loose botanical study — small wild blooms in soft pinks and olive on a warm ivory parchment ` +
      `background, vertical 4:5 composition, fresh and quiet. ${STUDIO_VOCABULARY}`,
  },
  {
    out: "public/galleries/warm-study/hero.jpg",
    prompt:
      `Interior photograph: a warm reading nook with three framed artworks above a walnut console, ` +
      `cognac leather chair, single brass lamp, terracotta and fig palette, late afternoon light, ` +
      `editorial interior styling, horizontal 3:2 composition, Soho Home aesthetic`,
  },
  {
    out: "public/galleries/dusk-arrangement/hero.jpg",
    prompt:
      `Interior photograph: a living room wall arrangement — one large framed olive-grove painting ` +
      `flanked by two smaller botanical prints above an antique sideboard, dusky olive and burgundy ` +
      `palette, lit by a single floor lamp, horizontal 3:2 composition, editorial interior styling`,
  },
];

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) {
  console.error("XAI_API_KEY not set. Add it to .env or pass on the command line.");
  process.exit(1);
}

async function generateOne(job: Job): Promise<void> {
  console.log(`→ ${job.out}`);

  const res = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-imagine-image",
      prompt: job.prompt,
      n: 1,
      response_format: "url",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`xAI ${res.status}: ${text.slice(0, 400)}`);
  }

  const json = (await res.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
  const item = json.data?.[0];
  if (!item) throw new Error("Empty response from xAI");

  let buffer: Buffer;
  if (item.b64_json) {
    buffer = Buffer.from(item.b64_json, "base64");
  } else if (item.url) {
    const imageRes = await fetch(item.url);
    if (!imageRes.ok) throw new Error(`Image download failed: ${imageRes.status}`);
    buffer = Buffer.from(await imageRes.arrayBuffer());
  } else {
    throw new Error("Response had neither url nor b64_json");
  }

  await mkdir(dirname(job.out), { recursive: true });
  await writeFile(job.out, buffer);
  console.log(`  ✓ wrote ${buffer.length} bytes`);
}

async function main() {
  for (const job of JOBS) {
    try {
      await generateOne(job);
    } catch (e) {
      console.error(`  ✗ ${job.out}: ${(e as Error).message}`);
    }
  }
  console.log("\nDone.");
}

main();
