type TallySettings = TallySetting[];
type TallySetting = { name: string };

(function(back) {
  const storage = require("Storage");
  const SETTINGS_FILE = "tallycfg.json";

  const tallycfg = storage.readJSON(SETTINGS_FILE, 1) as TallySettings || [];

  function saveSettings() {
    storage.writeJSON(SETTINGS_FILE, tallycfg);
  }

  function showMainMenu() {
    const menu: Menu = {
      "": { "title": "Tally Configs" },
      "< Back": back,
      "Add New": () => showEditMenu(),
    };

    tallycfg.forEach((tally, index) => {
      menu[tally.name] = () => showEditMenu(tally, index);
    });

    E.showMenu(menu);
  }

  function showEditMenu(tally?: TallySetting, index?: number) {
    const isNew = tally == null;
    if (tally == null) {
      tally = { name: "" };
      index = tallycfg.length;
      tallycfg.push(tally);
    }

    const menu: Menu = {
      "": { "title": isNew ? "New Tally" : "Edit Tally" },
      "< Back": () => {
        saveSettings();
        showMainMenu();
      },
    };

    menu[tally.name || "<set name>"] = () => {
      require("textinput")
        .input({ text: tally.name })
        .then(text => {
          tally.name = text;

          showEditMenu(tally, index);
        });
    };

    if (!isNew) {
      menu["Delete"] = () => {
        tallycfg.splice(index!, 1);
        saveSettings();
        showMainMenu();
      };
    }

    E.showMenu(menu);
  }

  showMainMenu();
}) satisfies SettingsFunc;
