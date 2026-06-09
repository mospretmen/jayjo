/**
 * Generate the Studio JayJo logomark + a square brandmark suitable for the
 * favicon at small sizes. Saves to public/branding/.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const JOBS = [
  {
    out: "public/branding/logo-square.png",
    prompt:
      `Minimalist art-studio logomark for "Studio JayJo" (rendered as the monogram "J" interlocked with ` +
      `a small "j"), serif glyph inspired by Cormorant Garamond, deep cocoa brown ink on warm parchment ` +
      `cream background, centred square composition, generous whitespace, fine-line painterly mark, ` +
      `no other text, no slogan, gallery-quality, suitable as a favicon and brand mark, refined editorial ` +
      `art-direction aesthetic.`,
  },
  {
    out: "public/branding/logo-wordmark.png",
    prompt:
      `Editorial wordmark for "Studio JayJo" in elegant Cormorant Garamond serif, deep cocoa brown letters ` +
      `on warm parchment cream background, two-line layout with "Studio" smaller on top and "JayJo" larger ` +
      `below, tasteful tracking, generous margin, art-gallery brand aesthetic, no extra glyphs, no slogans, ` +
      `horizontal composition.`,
  },
];

const API_KEY = process.env.XAI_API_KEY;
if (!API_KEY) {
  console.error("XAI_API_KEY not set");
  process.exit(1);
}

async function generateOne(job: { out: string; prompt: string }) {
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
