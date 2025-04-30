(function (back) {
    var storage = require("Storage");
    var SETTINGS_FILE = "tallycfg.json";
    var tallycfg = storage.readJSON(SETTINGS_FILE, 1) || [];
    function saveSettings() {
        storage.writeJSON(SETTINGS_FILE, tallycfg);
    }
    function showMainMenu() {
        var menu = {
            "": { "title": "Tally Configs" },
            "< Back": back,
            "Add New": function () { return showEditMenu(); },
        };
        tallycfg.forEach(function (tally, index) {
            menu[tally.name] = function () { return showEditMenu(tally, index); };
        });
        E.showMenu(menu);
    }
    function showEditMenu(tally, index) {
        var isNew = tally == null;
        if (tally == null) {
            tally = { name: "" };
            index = tallycfg.length;
            tallycfg.push(tally);
        }
        var menu = {
            "": { "title": isNew ? "New Tally" : "Edit Tally" },
            "< Back": function () {
                saveSettings();
                showMainMenu();
            },
        };
        menu[tally.name || "<set name>"] = function () {
            require("textinput")
                .input({ text: tally.name })
                .then(function (text) {
                tally.name = text;
                showEditMenu(tally, index);
            });
        };
        if (!isNew) {
            menu["Delete"] = function () {
                tallycfg.splice(index, 1);
                saveSettings();
                showMainMenu();
            };
        }
        E.showMenu(menu);
    }
    showMainMenu();
})
