#!/usr/bin/env node

/**
 * @file
 * You can use this script to exempt an app file from a specific eslint rule.
 *
 * This should only be used to exempt existing apps when a new lint rule is added.
 * You are not allowed to exempt your new app from existing lint rules.
 *
 * Run it like this:
 * node bin/exempt-lint.mjs LINTRULE FILEPATH
 *
 * Example command:
 * node bin/exempt-lint.mjs no-unused-vars ./apps/_example_app/app.js
 */

import fs from "node:fs/promises";

// Nodejs v18 compatibility (v18 is end-of-life in april 2025)
if(!("crypto" in globalThis)) globalThis.crypto = (await import("node:crypto")).webcrypto;

const lintRule = process.argv[2];
if (!lintRule) {
  throw new Error(
    "First argument needs to be a lint rule, something like 'no-unused-vars'",
  );
}

const filePathInput = process.argv[3];
const filePathMatch = filePathInput?.match(
  /^(?:.*?\/apps\/|apps\/|\/)?(?<path>.*\.[jt]s)$/iu,
);
const filePath = filePathMatch?.groups?.path;
if (!filePath) {
  throw new Error(
    "Second argument needs to be a file path that looks something like './apps/_example_app/app.js'",
  );
}

const exemptionsFilePath = "../apps/lint_exemptions.js";

const exemptions = (await import(exemptionsFilePath)).default;

const fileContents = await fs.readFile(`apps/${filePath}`, "utf8");

const exemption = exemptions[filePath] || {};
exemption.hash = await hashContents(fileContents);
const rules = new Set(exemption.rules || []);
rules.add(lintRule);
exemption.rules = [...rules];
exemptions[filePath] = exemption;

const output = `module.exports = ${JSON.stringify(exemptions, undefined, 2)};\n`;
await fs.writeFile(`bin/${exemptionsFilePath}`, output);

console.log(`✔️ '${filePath}' is now exempt from the rule '${lintRule}'`);

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
 */
async function hashContents(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}
