Bangle.on("message", (t, m) => {
  require("Storage").open("messagesdebug.log", "a").write(`${t}: ${JSON.stringify(m)}\n`);
});