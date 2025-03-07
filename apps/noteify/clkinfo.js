(function() {
  var notes = require("Storage").readJSON("noteify.json", true) || [];
  return {
    name: "Noteify",
    items: notes.map((entry, i) => ({
      name: "Noteify "+i,
      get: () => ({ text: entry.note }),
      show: function() {},
      hide: function() {}
    }))
  };
})
