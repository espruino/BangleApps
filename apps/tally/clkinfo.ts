(function() {
  const storage = require("Storage");
  const tallyEntries = storage.readJSON("tallycfg.json", 1) as TallySettings || [];

  // transparent
  const img = atob("GBiBAAAAAAAAAAAAAB//+D///DAADDAADDAYDDAYDDAZjDAZjDGZjDGZjDGZjDGZjDAADDAADD///B//+APAAAMAAAIAAAAAAAAAAA==")
  // non-transparent
  //const img = atob("GBgBAAAAAAAAAAAAH//4P//8MAAMMAAMMBgMMBgMMBmMMBmMMZmMMZmMMZmMMZmMMAAMMAAMP//8H//4A4AAAwAAAgAAAAAAAAAA")

  return {
    name: "Tally",
    img,
    items: tallyEntries.map(ent => ({
      name: ent.name,
      img,
      get: function() {
        return { text: this.name, img };
      },
      run: function() {
        const f = storage.open("tallies.csv", "a");
        f.write([
          new Date().toISOString(),
          this.name,
        ].join(",") + "\n");
      },
      show: function(){},
      hide: function(){},
    })),
  };
}) satisfies ClockInfoFunc
