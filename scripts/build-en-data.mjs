import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const MCU_DATA_JSON = path.join(ROOT, "mcuData.json");
const OUT_JSON = path.join(ROOT, "mcuData.en.json");

function readMcuDataJson() {
  if (!fs.existsSync(MCU_DATA_JSON)) {
    throw new Error("Missing mcuData.json. Run scripts/extract-data-from-index.mjs first.");
  }
  return JSON.parse(fs.readFileSync(MCU_DATA_JSON, "utf8"));
}

async function callAi(prompt, systemInstruction) {
  const res = await fetch("https://wumatv.cn/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt, systemInstruction }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.error) throw new Error(String(data.error));
  return String(data.text || "");
}

function extractJsonObject(raw) {
  const s = String(raw || "");
  const m = s.match(/\{[\s\S]*\}/);
  return (m && m[0]) ? m[0] : "";
}

function tryParseJsonLenient(jsonText) {
  if (!jsonText) throw new Error("Empty JSON text");
  try {
    return JSON.parse(jsonText);
  } catch (e1) {
    // Light repairs: remove trailing commas and convert smart quotes
    const repaired = jsonText
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(repaired);
  }
}

async function callAiJson(prompt, sys, retries = 2) {
  let lastErr = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const raw = await callAi(
        prompt,
        sys +
          "\nCRITICAL: Output MUST be a single JSON object only. No markdown, no comments, no extra text."
      );
      const jsonText = extractJsonObject(raw.trim());
      return tryParseJsonLenient(jsonText);
    } catch (e) {
      lastErr = e;
      await sleep(400);
    }
  }
  throw lastErr || new Error("Failed to parse AI JSON");
}

function keyOf(item) {
  return String(item?.enTitle || item?.title || item?.yt || "").trim();
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const mcuData = readMcuDataJson();

  const existing = fs.existsSync(OUT_JSON)
    ? JSON.parse(fs.readFileSync(OUT_JSON, "utf8"))
    : {};

  const items = mcuData
    .map((it) => ({
      key: keyOf(it),
      title: it.enTitle || it.title,
      desc: it.desc || "",
      chars: it.chars || "",
      impact: it.impact || "",
    }))
    .filter((it) => it.key && (it.desc || it.chars || it.impact));

  const pending = items.filter((it) => !existing[it.key]);
  console.log(`Total translatable: ${items.length}, pending: ${pending.length}`);

  const sys =
    "You translate MCU archive text into natural, concise English.\n" +
    "Return ONLY valid JSON. For each input item, output keys: key, descEn, charsEn, impactEn.\n" +
    "Rules: keep proper nouns, keep comma-separated names, avoid extra fluff.\n" +
    "Output format: { \"items\": [ {\"key\":\"...\",\"descEn\":\"...\",\"charsEn\":\"...\",\"impactEn\":\"...\"}, ... ] }";

  const batches = chunk(pending, 10);
  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];
    const prompt = JSON.stringify({ items: batch });
    console.log(`Batch ${bi + 1}/${batches.length} ...`);
    const parsed = await callAiJson(prompt, sys, 2);
    const outItems = Array.isArray(parsed.items) ? parsed.items : [];
    for (const x of outItems) {
      if (!x || !x.key) continue;
      existing[String(x.key).trim()] = {
        descEn: String(x.descEn || "").trim(),
        charsEn: String(x.charsEn || "").trim(),
        impactEn: String(x.impactEn || "").trim(),
        _ts: Date.now(),
      };
    }
    fs.writeFileSync(OUT_JSON, JSON.stringify(existing, null, 2));
    await sleep(250);
  }

  console.log(`Wrote: ${OUT_JSON}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

