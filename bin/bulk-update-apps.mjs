#!/usr/bin/env node

/**
 * @file
 * You can use this script to bump the version of many apps with the same changes.
 * You need to specify a hash for a git commit along with a message that describes the changes made to the apps.
 *
 * The apps that were changed in the git commit are bumped to a new minor version,
 * and their changelogs are updated with the message you provided.
 *
 * Run it like this:
 * node bin/bulk-update-apps.mjs GITHASH CHANGELOGMESSAGE
 *
 * Example command:
 * node bin/bulk-update-apps.mjs 29ced17i7 'Minor code improvements'
 *
 * You can also run it in output mode like this:
 * node bin/bulk-update-apps.mjs GITHASH --output
 *
 * This mode doesn't make any changes to your files, it outputs the ID's of all apps that would be bumped.
 */

import { exec } from "node:child_process";
import fs from "node:fs/promises";

const commitHash = process.argv[2];
if (!commitHash || commitHash === "--output") {
  throw new Error(
    "First argument needs to be a git commit hash, something like '29ced17i7'",
  );
}

const changelogMessage = process.argv[3];
if (!changelogMessage) {
  throw new Error(
    "Second argument needs to be a changelog message, something like 'Minor code improvements'",
  );
}

let outputFlag = false;
if (process.argv[3] === "--output" || process.argv[4] === "--output") {
  outputFlag = true;
}

const gitOutput = await new Promise((resolve) => {
  exec(
    `git diff-tree --no-commit-id --name-only ${commitHash} -r`,
    (error, stdout, stderr) => {
      if (error) {
        throw new Error(`Could not get git diff: ${error}`);
      } else if (stderr) {
        throw new Error(`Could not get git diff: ${stderr}`);
      } else if (!stdout) {
        throw new Error(`Git command did not return any data`);
      }

      resolve(stdout);
    },
  );
});

/**
 * Extract the id of each app and make sure there are no duplicates
 */
const appIds = [
  ...new Set(
    [...gitOutput.matchAll(/^(?:.*?\/apps\/|apps\/)(?<id>.*?)\//gmu)]
      .map((match) => match?.groups?.id)
      .filter((match) => match),
  ),
];

if (outputFlag) {
  for (const appId of appIds) {
    console.log(appId);
  }
} else {
  for (const appId of appIds) {
    const metadataPath = `apps/${appId}/metadata.json`;
    const changelogPath = `apps/${appId}/ChangeLog`;

    const metadataContent = await fs.readFile(metadataPath, {
      encoding: "utf8",
    });
    const metadata = JSON.parse(metadataContent);

    const minorVersionNumber = parseInt(metadata.version.split(".").at(-1));
    const newMinorVersionString = `${minorVersionNumber < 9 ? "0" : ""}${(minorVersionNumber + 1).toString()}`;
    const newVersion = [
      ...metadata.version.split(".").slice(0, -1),
      newMinorVersionString,
    ].join(".");

    const versionMatch = metadataContent.match(
      /^\s*(?<declaration>"version"\s*:\s*".*"\s*,)/mu,
    );
    const newMatadataContent = metadataContent.replace(
      versionMatch.groups.declaration,
      `"version": "${newVersion}",`,
    );
    await fs.writeFile(metadataPath, newMatadataContent);

    let changelog = await fs.readFile(changelogPath, {
      encoding: "utf8",
      flag: "a+",
    });

    changelog = changelog.replace(/\n*$/u, ""); //trim trailing whitespace
    changelog ||= "0.01: New app!"; // init the changelog file if it doesn't exist
    changelog += `\n${newVersion}: ${changelogMessage}\n`; // add the new version with correct whitespace

    await fs.writeFile(changelogPath, changelog, { flag: "w+" });
  }
}
