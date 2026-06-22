import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envExample = readFileSync(resolve(".env.example"), "utf8");
const source = readFileSync(resolve("src/main.tsx"), "utf8");

for (const key of [
  "VITE_SEEFACTORY_API_BASE",
  "VITE_SEEFACTORY_GOOGLE_CLIENT_ID",
  "VITE_SEEFACTORY_X_REDIRECT_URI",
  "VITE_SEEFACTORY_TELEGRAM_BOT_USERNAME"
]) {
  assert.ok(envExample.includes(`${key}=`), `.env.example must include ${key}.`);
  assert.ok(source.includes(`import.meta.env.${key}`), `Dashboard source must read ${key}.`);
}

assert.ok(
  envExample.includes("VITE_SEEFACTORY_API_BASE=http://127.0.0.1:10087/api/v1"),
  "Dashboard local API example must point to the local public API prefix."
);
assert.ok(
  envExample.includes("VITE_SEEFACTORY_X_REDIRECT_URI=http://127.0.0.1:10106"),
  "Dashboard X redirect example must point to the local Vite dev URL."
);

console.log(JSON.stringify({
  checked: [
    "Dashboard env example exposes public API base",
    "Dashboard env example exposes H5 login client configuration",
    "Dashboard source reads documented VITE_SEEFACTORY_* keys"
  ]
}, null, 2));
