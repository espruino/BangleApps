const { execSync } = require("child_process");
const { readFileSync } = require("fs");
const https = require("https");

function usage(){
  console.log(`Usage: pr-tag.js [--local] [revision-range]`);
  console.log(`--local: don't fetch the PR description - useful for local testing`);
  process.exit(2);
}

async function main() {
  let local = false;
  let rev;
  for(const arg of process.argv.slice(2)){
    if(arg === "--local")
      local = true;
    else if(/^-/.test(arg))
      usage();
    else if(!rev)
      rev = arg;
    else
      usage();
  }

  if(!rev) rev = "origin/master...";

  if(!local && await shouldSkip()){
    console.error("Skipping PR");
    process.exit(0);
  }

  const apps = execSync(
    `git diff --name-only ${rev} -- apps/ |
      grep -o "apps/[^/]*" |
      sort |
      uniq`,
    { encoding: "utf8" }
  ).split("\n").filter(x => x);

  if(apps.length === 0) process.exit(1); // pipeline failed

  const authorToApp = {};

  for(const app of apps){
    const metadata = JSON.parse(readFileSync(`${app}/metadata.json`, "utf8"));
    let authorField = metadata.author;
    if(!authorField) continue;

    const authors = Array.isArray(authorField) ? authorField : [authorField];

    for(const author of authors){
      if(!authorToApp[author])
        authorToApp[author] = new Set();

      authorToApp[author].add(app);
    }
  }

  const prevTags = await previousTags();

  for(let [author, apps] of Object.entries(authorToApp)){
    if(author in prevTags){
      apps = new Set([...apps].filter(app => !prevTags[author].has(app)));
      if(apps.size === 0)
        continue;
    }

    apps = [...apps].sort();

    console.log(`tagging ${author} for ${apps.join(", ")}`);
  }
}

// allow skipping of tagging if the PR description contains a specific message
async function shouldSkip() {
  const desc = await fetchPRDesc({
    prNumber: getenv("PR_NUM"),
    repo: getenv("REPO"),
    token: getenv("GITHUB_TOKEN"),
  });

  return desc
    .split("\n")
    .filter(line => /^tag-bot: skip\s*$/.test(line))
    .length > 0;
}

// returns { author: Set(apps) }
async function previousTags() {
  const comments = await fetchPRComments({
    prNumber: getenv("PR_NUM"),
    repo: getenv("REPO"),
    token: getenv("GITHUB_TOKEN"),
  });

  const tags = {};

  comments
    .filter(({ user: { login, type } }) => type === "Bot" && login === "github-actions[bot]")
    .map(({ body }) => body)
    .flatMap(body =>
      body
        .split("\n")
        .map(line => {
          const parts = line.split(" ");
          if(parts.length === 4 && parts[0] === "tagging" && parts[2] === "for")
            return { author: parts[1], app: parts[3].replace(/`/g, "") };
        })
        .filter(x => x)
    )
    .forEach(({ author, app }) => {
      if(!tags[author]) tags[author] = new Set();
      tags[author].add(app);
    });

  return tags;
}

function fetchPRDesc({ prNumber, repo, token }) {
  return fetchGH({
    path: `/repos/${repo}/pulls/${prNumber}`,
    token
  }).then(data => JSON.parse(data).body);
}

function fetchPRComments({ prNumber, repo, token }) {
  return fetchGH({
    path: `/repos/${repo}/issues/${prNumber}/comments`,
    token
  }).then(data => JSON.parse(data));
}

function fetchGH({ path, token }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path,
      method: "GET",
      headers: {
        "User-Agent": "node.js",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json"
      }
    };

    https.get(options, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            resolve(data);
          } catch (e) {
            reject(e);
          }
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    }).on("error", reject);
  });
}

function getenv(name) {
  const val = process.env[name];
  if(!val){
    console.error(`Need environment variable $${name}`);
    process.exit(1);
  }
  return val;
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
