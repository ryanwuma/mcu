import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
const INDEX_HTML = path.join(ROOT, "index.html");
const OUT_DATA = path.join(ROOT, "mcuData.json");
const OUT_VIDEOS = path.join(ROOT, "localVideoFiles.json");

function extractArray(html, varName) {
  const anchor = `const ${varName} = [`;
  const i = html.indexOf(anchor);
  if (i < 0) throw new Error(`Cannot find ${anchor}`);
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
      const arrText = html.slice(i + `const ${varName} = `.length, p + 1);
      return arrText;
    }
    if (ch === "/" && next === "/") {
      while (p < html.length && html[p] !== "\n") p++;
    }
    if (ch === "/" && next === "*") {
      p += 2;
      while (p < html.length && !(html[p] === "*" && html[p + 1] === "/")) p++;
      p++;
    }
  }
  throw new Error(`Failed to parse array for ${varName}`);
}

function safeParseArray(arrText) {
  const jsonish = arrText
    .replace(/\bundefined\b/g, "null")
    .replace(/,\s*]/g, "]");
  try {
    return JSON.parse(jsonish);
  } catch {
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${arrText});`)();
  }
}

function main() {
  const html = fs.readFileSync(INDEX_HTML, "utf8");
  const mcuArr = safeParseArray(extractArray(html, "mcuData"));
  const videosArr = safeParseArray(extractArray(html, "localVideoFiles"));
  fs.writeFileSync(OUT_DATA, JSON.stringify(mcuArr, null, 2));
  fs.writeFileSync(OUT_VIDEOS, JSON.stringify(videosArr, null, 2));
  console.log(`Wrote ${OUT_DATA} and ${OUT_VIDEOS}`);
}

main();

