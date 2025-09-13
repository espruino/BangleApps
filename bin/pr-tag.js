const { execSync } = require("child_process");
const { readFileSync } = require("fs");

function usage(){
  console.log(`Usage: pr-tag.js [revision-range]`);
  process.exit(2);
}

let rev;
for(const arg of process.argv.slice(2)){
  if(/^-/.test(arg))
    usage();
  else if(!rev)
    rev = arg;
  else
    usage();
}

if(!rev) rev = "origin/master...";

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

for(let [author, apps] of Object.entries(authorToApp)){
  apps = [...apps].sort();

  console.log(`tagging ${author} for ${apps.join(", ")}`);
}
