/**
 * Generate the Studio JayJo hero image (gallery-wall interior in the brand palette).
 * Run separately so we don't re-spend tokens on the artwork batch.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const JOBS = [
  {
    out: "public/hero/hero-gallery-wall.jpg",
    aspect: "16:9",
    prompt:
      `Editorial interior photograph: a curated gallery wall — eight small to medium framed artworks ` +
      `arranged salon-style on a soft parchment-coloured wall, walnut console below holding a single ` +
      `terracotta vase and a brass candlestick, warm afternoon light entering from the left, oak floor ` +
      `with woven rug, cognac leather sofa partially visible, warm pigments throughout (deep fig, ` +
      `cognac, olive moss, soft parchment), no text, no signage, no people, magazine-quality editorial ` +
      `composition like Soho Home or The Invisible Collection, photorealistic, 16:9 horizontal framing.`,
  },
  {
    out: "public/hero/featured-arrangement.jpg",
    aspect: "3:2",
    prompt:
      `Editorial interior photograph: a single oversized framed botanical painting hanging above a ` +
      `dark walnut sideboard, flanked by a tall fiddle-leaf fig plant on the right and a brass floor ` +
      `lamp on the left, soft parchment wall, oak floor, golden-hour light, restrained warm-earth ` +
      `palette (cognac, deep fig, olive moss), no text or signage, no people, editorial styling, ` +
      `photorealistic, 3:2 horizontal framing.`,
  },
];

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) {
  console.error("XAI_API_KEY not set");
  process.exit(1);
}

async function generateOne(job: { out: string; prompt: string }): Promise<void> {
  console.log(`→ ${job.out}`);
  const res = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: "grok-imagine-image",
      prompt: job.prompt,
      n: 1,
      response_format: "url",
    }),
  });
  if (!res.ok) throw new Error(`xAI ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const json = (await res.json()) as { data?: Array<{ url?: string; b64_json?: string }> };
  const item = json.data?.[0];
  if (!item) throw new Error("Empty response");
  let buffer: Buffer;
  if (item.b64_json) buffer = Buffer.from(item.b64_json, "base64");
  else if (item.url) {
    const r = await fetch(item.url);
    buffer = Buffer.from(await r.arrayBuffer());
  } else throw new Error("No data");
  await mkdir(dirname(job.out), { recursive: true });
  await writeFile(job.out, buffer);
  console.log(`  ✓ ${buffer.length} bytes`);
}

(async () => {
  for (const job of JOBS) {
    try {
      await generateOne(job);
    } catch (e) {
      console.error(`  ✗ ${(e as Error).message}`);
    }
  }
})();
