import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const INDEX_HTML = path.join(ROOT, "index.html");
const OUT_JSON = path.join(ROOT, "mcuData.en.json");

function extractMcuDataArrayText(html) {
  const anchor = "const mcuData = [";
  const i = html.indexOf(anchor);
  if (i < 0) throw new Error("Cannot find `const mcuData = [` in index.html");
  let p = i + anchor.length;
  let depth = 1;
  let inS = false;
  let inD = false;
  let inT = false;
  let esc = false;

  for (; p < html.length; p++) {
    const ch = html[p];
    const next = html[p + 1];

    if (esc) {
      esc = false;
      continue;
    }
    if (ch === "\\") {
      esc = true;
      continue;
    }

    if (!inD && !inT && ch === "'" && !inS) {
      inS = true;
      continue;
    }
    if (inS && ch === "'") {
      inS = false;
      continue;
    }

    if (!inS && !inT && ch === '"' && !inD) {
      inD = true;
      continue;
    }
    if (inD && ch === '"') {
      inD = false;
      continue;
    }

    if (!inS && !inD && ch === "`" && !inT) {
      inT = true;
      continue;
    }
    if (inT && ch === "`") {
      inT = false;
      continue;
    }

    if (inS || inD || inT) continue;

    if (ch === "[") depth++;
    if (ch === "]") depth--;
    if (depth === 0) {
      const arrText = html.slice(i + "const mcuData = ".length, p + 1);
      return arrText;
    }
    if (ch === "/" && next === "/") {
      // skip line comments
      while (p < html.length && html[p] !== "\n") p++;
    }
    if (ch === "/" && next === "*") {
      // skip block comments
      p += 2;
      while (p < html.length && !(html[p] === "*" && html[p + 1] === "/")) p++;
      p++;
    }
  }
  throw new Error("Failed to parse mcuData array");
}

function safeParseArray(arrText) {
  // mcuData is a JS array of object literals; it should be JSON-compatible already.
  // To avoid eval, we rely on it being valid JSON after a light normalization.
  // If this ever breaks, we can switch to a real JS parser.
  const jsonish = arrText
    .replace(/\bundefined\b/g, "null")
    .replace(/,\s*]/g, "]");
  try {
    return JSON.parse(jsonish);
  } catch {
    // Fallback: use Function in a sandboxed manner (local file only)
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${arrText});`)();
  }
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
  const html = fs.readFileSync(INDEX_HTML, "utf8");
  const arrText = extractMcuDataArrayText(html);
  const mcuData = safeParseArray(arrText);

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

