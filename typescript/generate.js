const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");

const TAKEN_IDENTIFIERS = ["ArrayBufferView", "File"];

function getType(type) {
  if (type.startsWith("+")) type = type.substring(1);
  if (TAKEN_IDENTIFIERS.includes(type)) type = "Espruino" + type;
  switch (type) {
    case undefined:
    case "?":
      return "any";
    case "bool":
      return "boolean";
    case "String":
      return "string";
    case "Array":
      return "any[]";
    case "Promise":
      return "Promise<any>";
    default:
      return type;
  }
}

let indent = 0;
let topLevel = true;
let file = { lines: [], indent: 0 };
let libraries = { lines: [], indent: 2 };

function add(text, f) {
  if (!f) f = file;
  if (text)
    f.lines.push(
      ...text.split("\n").map((line) => " ".repeat(f.indent) + line.trimEnd())
    );
  else f.lines.push("");
}

function get(key, obj, isGlobal, f) {
  if (!f) f = file;
  if (key.startsWith("!")) return;
  if (key === "prototype") return;
  if (key in global && isGlobal) return;
  if (TAKEN_IDENTIFIERS.includes(key)) key = "Espruino" + key;
  add(
    "/**\n" +
      (obj["!doc"] || "")
        .split("\n")
        .filter((line) => line)
        .map((line) =>
          line
            .replace("^<p>(.*)</p>$", "$1")
            .replace("<p>", "")
            .replace("</p>", "\n")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&gt;/g, ">")
            .replace(/&lt;/g, "<")
            .replace(/&amp;/g, "&")
            .replace(/&deg;/g, "°")
            .replace(/<\/?strong>/g, "**")
            .replace(/<\/?em>/g, "*")
            .replace(/<\/?code>/g, "`")
            .replace(/<\/?ul>/g, "\n")
            .replace(/<li>/g, "- ")
            .replace(/<\/li>/g, "")
            .replace(/<pre>`/g, "\n```\n")
            .replace(/<h3 id="[^"\n]+">([^\n]+)<\/h3>/g, "\n\n# $1\n\n")
            .replace(/`<\/pre>/g, "```\n")
            .replace(/<span class="[^"]+">/g, "")
            .replace(/<\/span>/g, "")
            .replace(
              /<a href="([^\n"]*)">([^\n<>]*)<\/a>/g,
              (_, address, name) => {
                if (address.startsWith("/"))
                  address = "https://espruino.com/" + address;
                return `[${name}](${address})`;
              }
            )
            .split("\n")
        )
        .flat()
        .concat([`@url ${obj["!url"]}`])
        .join("\n")
        .replace(/\n\n+/g, "\n\n")
        .split("\n")
        .map((line) => " * " + line)
        .join("\n") +
      "\n */",
    f
  );

  const type = obj["!type"] || "?";
  const hasProperties = Object.keys(obj).filter(
    (key) => !key.startsWith("!") && key !== "prototype"
  ).length;
  if (type.startsWith("fn(")) {
    const returnType = getType(
      type.includes("->") ? type.replace(/^.*-> (.*)$/, "$1") : "void"
    );
    let args = type.replace(/^fn\((.*)\).*/, "$1");
    if (args)
      args = args
        .split(", ")
        .map((argument) => {
          const pair = argument.split(": ");
          if (pair[0] === "function") pair[0] = "fn";
          if (pair[0] === "var") pair[0] = "variable";
          pair[1] = getType(pair[1]);
          return pair.join(": ");
        })
        .join(", ");

    if (obj["!library"]) {
      add(`${key}: {`, libraries);
      libraries.indent += 2;
      topLevel = false;
      for (const key in obj) {
        get(key, obj[key], true, libraries);
      }
      topLevel = true;
      libraries.indent -= 2;
      add("};", libraries);
    } else if (hasProperties) {
      add(`${indent ? "" : "declare "}const ${key}: {`, f);
      file.indent += 2;
      topLevel = false;
      for (const key in obj) {
        get(key, obj[key], true);
      }
      topLevel = true;
      file.indent -= 2;
      add("};", f);
    } else if (topLevel) {
      if (key === "require") {
        add(
          `declare function require<T extends keyof Modules>(moduleName: T): Modules[T];`,
          f
        );
        add(
          `declare function require<T extends Exclude<string, keyof Modules>>(moduleName: T): any;`,
          f
        );
      } else {
        add(
          `${indent ? "" : "declare "}function ${key}(${args}): ${returnType};`,
          f
        );
      }
    } else {
      add(`${key}: (${args}) => ${returnType};`, f);
    }
  } else if (hasProperties) {
    add(`${indent ? "" : "declare "}const ${key}: ${getType(type)} & {`, f);
    file.indent += 2;
    topLevel = false;
    for (const key in obj) {
      get(key, obj[key], true);
    }
    topLevel = true;
    file.indent -= 2;
    add("};", f);
  } else if (topLevel) {
    add(`${indent ? "" : "declare "}const ${key}: ${getType(type)};`, f);
  } else {
    add(`${key}: ${getType(type)}`, f);
  }

  if (obj.prototype) {
    add("", f);
    add(`type ${key} = {`, f);
    file.indent += 2;
    topLevel = false;
    for (const key in obj.prototype) {
      get(key, obj.prototype[key], true);
    }
    topLevel = true;
    file.indent -= 2;
    add("}", f);
  }

  add("", f);
}

// fetch("https://espruino.com/json/espruino.json")
// .then((response) => response.json())
// .then((json) => {
const json = JSON.parse(fs.readFileSync("./espruino.json"));
add("/* Note: This file was automatically generated. */\n");
for (const key in json) {
  get(key, json[key], true);
}
add("type Modules = {");
add(libraries.lines.join("\n"));
add("}");
fs.writeFileSync("types/main.d.ts", file.lines.join("\n"));
// });
