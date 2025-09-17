const { execSync } = require("child_process");
const { readFileSync } = require("fs");
const https = require("https");

function usage(){
  console.log(`Usage: pr-tag.js [--local] [--dry] [revision-range]`);
  console.log(`--local: don't fetch the PR description, etc, just show the changes apps/authors`);
  console.log(`--dry: don't perform the final comment`);
  process.exit(2);
}

async function main() {
  let local = false;
  let dry = false;
  let rev;
  for(const arg of process.argv.slice(2)){
    if(arg === "--local")
      local = true;
    else if(arg === "--dry")
      dry = true;
    else if(/^-/.test(arg))
      usage();
    else if(!rev)
      rev = arg;
    else
      usage();
  }

  if(!rev) rev = "origin/master...";

  if(!local && await shouldSkip()){
    debug("Skipping PR");
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
    debug(`Changed app: ${app}, author field: ${authorField}`);
    if(!authorField) continue;

    const authors = Array.isArray(authorField) ? authorField : [authorField];

    for(const author of authors){
      if(!authorToApp[author])
        authorToApp[author] = new Set();

      authorToApp[author].add(app);
    }
  }

  const prevTags = local ? {} : await previousTags();
  const output = [];

  for(let [author, apps] of Object.entries(authorToApp)){
    if(author in prevTags){
      apps = new Set([...apps].filter(app => !prevTags[author].has(app)));
      if(apps.size === 0){
        debug(`Skipping ${author} - no new apps`);
        continue;
      }
    }

    output.push(makeLine({ author, apps }));
  }

  if(output.length){
    if(local || dry){
      for(const out of output)
        console.log(out)
    }else{
      await postComment({
        prNumber: getenv("PR_NUM"),
        repo: getenv("REPO"),
        token: getenv("GITHUB_TOKEN"),
        comment: output.join("\n"),
      });
    }
  }
}

function makeLine({ author, apps }) {
  apps = [...apps].sort();

  return `tagging @${author} for ${apps.map(a => `\`${a}\``).join(", ")}`
}

function parseLine(line) {
  const parts = line.split(" ");

  if(parts.length >= 4 && parts[0] === "tagging" && parts[2] === "for")
    return { author: parts[1], apps: parts.slice(3).map(app => app.replace(/[,`]/g, "")) };
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
        .map(parseLine)
        .filter(x => x)
    )
    .forEach(({ author, apps }) => {
      if(!tags[author]) tags[author] = new Set();
      for(const app of apps)
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

function postComment({ prNumber, repo, token, comment }) {
  return fetchGH({
    path: `/repos/${repo}/issues/${prNumber}/comments`,
    token,
    data: { body: comment },
  }).then(data => JSON.parse(data));
}

function fetchGH({ path, token, data }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.github.com",
      path,
      method: data ? "POST" : "GET",
      headers: {
        "User-Agent": "node.js",
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json"
      },
    };

    if(data)
      options.body = data;

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

function debug(...args) {
  console.error(...args);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
