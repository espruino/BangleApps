var storage = require("Storage");
function readTallies() {
    var tallies = [];
    var f = storage.open("tallies.csv", "r");
    var line;
    while ((line = f.readLine()) !== undefined) {
        var parts = line.replace("\n", "").split(",");
        tallies.push({ date: new Date(parts[0]), name: parts[1] });
    }
    return tallies;
}
function saveTallies(tallies) {
    var f = storage.open("tallies.csv", "w");
    for (var _i = 0, tallies_1 = tallies; _i < tallies_1.length; _i++) {
        var tally = tallies_1[_i];
        f.write([tally.date.toISOString(), tally.name].join(",") + "\n");
    }
}
var dayEq = function (a, b) {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
};
function showTallies(tallies) {
    var menu = {
        "": { title: "Tallies" },
        "< Back": function () { return load(); },
    };
    var today = new Date;
    var day;
    tallies.forEach(function (tally, i) {
        var td = tally.date;
        if (!dayEq(day !== null && day !== void 0 ? day : today, td)) {
            var s = "".concat(td.getFullYear(), "-").concat(pad2(td.getMonth() + 1), "-").concat(pad2(td.getDate()));
            menu[s] = function () { };
            day = td;
        }
        menu["".concat(tfmt(tally), ": ").concat(tally.name)] = function () { return editTally(tallies, i); };
    });
    E.showMenu(menu);
}
function editTally(tallies, i) {
    var tally = tallies[i];
    var onback = function () {
        saveTallies(tallies);
        E.removeListener("kill", onback);
    };
    E.on("kill", onback);
    var menu = {
        "": { title: "Edit ".concat(tally.name) },
        "< Back": function () {
            onback();
            showTallies(tallies);
        },
        "Name": {
            value: tally.name,
            onchange: function () {
                setTimeout(function () {
                    require("textinput")
                        .input({ text: tally.name })
                        .then(function (text) {
                        if (text) {
                            tally.name = text;
                        }
                        editTally(tallies, i);
                    });
                }, 0);
            },
        },
        "Time": {
            value: tally.date.getTime(),
            format: function (_tm) { return tfmt(tally); },
            onchange: function (v) {
                tally.date = new Date(v);
            },
            step: 60000,
        },
        "Delete": function () {
            E.showPrompt("Delete \"".concat(tally.name, "\"?"), {
                title: "Delete",
                buttons: { Yes: true, No: false },
            }).then(function (confirm) {
                if (confirm) {
                    tallies.splice(i, 1);
                    saveTallies(tallies);
                    showTallies(tallies);
                    return;
                }
                editTally(tallies, i);
            });
        },
    };
    E.showMenu(menu);
}
function tfmt(tally) {
    var d = tally.date;
    return "".concat(d.getHours(), ":").concat(pad2(d.getMinutes()));
}
var pad2 = function (s) { return ("0" + s.toFixed(0)).slice(-2); };
showTallies(readTallies());
