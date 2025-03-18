#!/usr/bin/env node

/**
 * @file
 * Run this to ensure that the lint exemptions are all valid.
 * If any of the exempt app files have been changed, this script will remove the exemption for that file.
 *
 * Run it like this:
 * node bin/sync-lint-exemptions.mjs
 */

import fs from "node:fs/promises";

// Nodejs v18 compatibility (v18 is end-of-life in april 2025)
if(!("crypto" in globalThis)) globalThis.crypto = (await import("node:crypto")).webcrypto;

const exemptionsFilePath = "../apps/lint_exemptions.js";

const exemptions = (await import(exemptionsFilePath)).default;

for (const filePath of Object.keys(exemptions)) {
  const fileContents = await fs.readFile(filePath, "utf8");
  const currentHash = await hashContents(fileContents);
  if (exemptions[filePath].hash !== currentHash) {
    delete exemptions[filePath];
    console.log(
      `! Removed lint exemptions for '${filePath}' because it has been edited`,
    );
  }
}

const output = `module.exports = ${JSON.stringify(exemptions, undefined, 2)};\n`;
await fs.writeFile("bin/" + exemptionsFilePath, output);

console.log(`✔️ Synchronized all lint exemptions\n`);

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
