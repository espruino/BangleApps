const { execFileSync } = require("child_process");
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

  const apps = changedApps(rev);

  if(apps.length === 0){
    debug("No apps changed");
    process.exit(0);
  }

  const authorToApp = {};

  for(const app of apps){
    const metadata = readMetadata(app, rev);
    if(!metadata){
      debug(`Skipping ${app} - no metadata.json`);
      continue;
    }
    let authorField = metadata.author;
    debug(`Changed app: ${app}, author field: ${authorField}`);
    if(!authorField) continue;

    const authors = (Array.isArray(authorField) ? authorField : [authorField])
      .flatMap(a => String(a).split(","))
      .map(a => a.trim().replace(/^@/, ""))
      .filter(a => {
        if(isGitHubHandle(a)) return true;
        if(a) debug(`Ignoring author "${a}" - not a GitHub username`);
        return false;
      });

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

function changedApps(rev) {
  const files = execFileSync(
    "git", ["diff", "--name-only", "-z", rev, "--", "apps/"],
    { encoding: "utf8" }
  ).split("\0").filter(x => x);

  const apps = new Set();
  for(const file of files){
    const m = /^(apps\/[^/]+)\//.exec(file);
    if(m) apps.add(m[1]);
  }

  return [...apps].sort();
}

function readMetadata(app, rev) {
  const [base, head] = rev.split(/\.{2,3}/); // branch1..branch2
  const refs = rev.includes("..")
    ? [head || "HEAD", base || "HEAD"]
    : ["HEAD", rev];

  for(const ref of refs){
    try {
      const json = execFileSync(
        "git", ["show", `${ref}:${app}/metadata.json`],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
      );
      return JSON.parse(json);
    }catch(e){
      // not present at this ref
    }
  }
}

function isGitHubHandle(name) {
  return /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(name);
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

  return (desc || "")
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

  debug(`comments: ${JSON.stringify(comments)}`);

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
  }).then(({ data }) => JSON.parse(data).body);
}

async function fetchPRComments({ prNumber, repo, token }) {
  const perPage = 100;
  const comments = [];

  for(let page = 1; ; page++){
    const { data } = await fetchGH({
      path: `/repos/${repo}/issues/${prNumber}/comments?per_page=${perPage}&page=${page}`,
      token
    });
    const batch = JSON.parse(data);
    comments.push(...batch);
    if(batch.length < perPage)
      return comments;
  }
}

function postComment({ prNumber, repo, token, comment }) {
  return fetchGH({
    path: `/repos/${repo}/issues/${prNumber}/comments`,
    token,
    data: { body: comment },
  }).then(({ data }) => JSON.parse(data));
}

function fetchGH({ path, token, data }) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : undefined;
    const headers = {
      "User-Agent": "node.js",
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json"
    };

    if(payload){
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = https.request({
      hostname: "api.github.com",
      path,
      method: payload ? "POST" : "GET",
      headers,
    }, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300)
          resolve({ data, headers: res.headers });
        else
          reject(new Error(`GitHub API error: ${res.statusCode}: ${data}`));
      });
    });

    req.on("error", reject);
    if(payload) req.write(payload);
    req.end();
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
