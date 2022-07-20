const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");

const TAKEN_IDENTIFIERS = ["ArrayBufferView", "crypto", "File", "Storage"];

function getType(type) {
  if (type.startsWith("+")) type = type.substring(1);
  if (TAKEN_IDENTIFIERS.includes(type)) return "Espruino" + type;
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
let file = [];

function add(text) {
  if (text)
    file = file.concat(
      text.split("\n").map((line) => " ".repeat(indent) + line)
    );
  else file.push("");
}

function get(key, obj, isGlobal) {
  if (key.startsWith("!")) return;
  if (key === "prototype") return;
  if (key in global && isGlobal) return;
  if (TAKEN_IDENTIFIERS.includes(key)) key = "Espruino" + key;
  add(
    "/**\n" +
      (obj["!doc"] || "")
        .split("\n")
        .filter((line) => line)
        .map((line) => line.replace(/^<p>(.*)<\/p>$/, "$1"))
        .concat([`@url ${obj["!url"]}`])
        .map((line) => " * " + line)
        .join("\n") +
      "\n */"
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
    if (topLevel) {
      add(
        `${indent ? "" : "declare "}function ${key}(${args}): ${returnType};`
      );
    } else {
      add(`${key}: (${args}) => ${returnType};`);
    }

    if (hasProperties) {
      add("");
      add(`declare namespace ${key} {`);
      indent += 2;
      for (const key in obj) {
        get(key, obj[key], true);
      }
      indent -= 2;
      add("}");
    }
  } else {
    if (hasProperties) {
      add(`${indent ? "" : "declare "}const ${key}: ${getType(type)} & {`);
      indent += 2;
      topLevel = false;
      for (const key in obj) {
        get(key, obj[key], true);
      }
      topLevel = true;
      indent -= 2;
      add("};");
    } else if (topLevel) {
      add(`${indent ? "" : "declare "}const ${key}: ${getType(type)};`);
    } else {
      add(`${key}: ${getType(type)}`);
    }
  }

  if (obj.prototype) {
    add("");
    add(`type ${key} = {`);
    indent += 2;
    topLevel = false;
    for (const key in obj.prototype) {
      get(key, obj.prototype[key], true);
    }
    topLevel = true;
    indent -= 2;
    add("}");
  }

  add("");
}

fetch("https://espruino.com/json/espruino.json")
  .then((response) => response.json())
  .then((json) => {
    add("/* Note: This file was automatically generated. */\n");
    for (const key in json) {
      get(key, json[key], true);
    }
    fs.writeFileSync("types/main.d.ts", file.join("\n"));
  });
