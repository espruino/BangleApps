(function () {
    var storage = require("Storage");
    var tallyEntries = storage.readJSON("tallycfg.json", 1) || [];
    var img = atob("GBiBAAAAAAAAAAAAAB//+D///DAADDAADDAYDDAYDDAZjDAZjDGZjDGZjDGZjDGZjDAADDAADD///B//+APAAAMAAAIAAAAAAAAAAA==");
    return {
        name: "Tally",
        img: img,
        items: tallyEntries.map(function (ent) { return ({
            name: ent.name,
            img: img,
            get: function () {
                return { text: this.name, img: img };
            },
            run: function () {
                var f = storage.open("tallies.csv", "a");
                f.write([
                    new Date().toISOString(),
                    this.name,
                ].join(",") + "\n");
            },
            show: function () { },
            hide: function () { },
        }); }),
    };
})
