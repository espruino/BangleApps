(function(back) {
  const storage = require("Storage");
  const SETTINGS_FILE = "boxclk.settings.json";
  const DEFAULT_CONFIG_FILE = "boxclk.default-cfg.json";
  const CONFIG_PREFIX = "boxclk.cfg.";
  const CONFIG_SUFFIX = ".json";
  const DEFAULT_CONFIG = "default";

  const sanitizeConfigName = name => {
    name = (name || "").toString().trim().toLowerCase();
    name = name.replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
    return name || DEFAULT_CONFIG;
  };

  const prettifyConfigName = name => {
    return (name || DEFAULT_CONFIG).replace(/[-_]+/g, " ");
  };

  const compareConfigNames = (a, b) => {
    if (a === DEFAULT_CONFIG) return -1;
    if (b === DEFAULT_CONFIG) return 1;
    a = prettifyConfigName(a).toLowerCase();
    b = prettifyConfigName(b).toLowerCase();
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  };

  const configNameFromFilename = file => {
    if (file === DEFAULT_CONFIG_FILE) return DEFAULT_CONFIG;
    if (file.indexOf(CONFIG_PREFIX) === 0) {
      const name = sanitizeConfigName(file.slice(CONFIG_PREFIX.length, -CONFIG_SUFFIX.length));
      return name === DEFAULT_CONFIG ? null : name;
    }
    return null;
  };

  const readSettings = () => storage.readJSON(SETTINGS_FILE, 1) || {};

  const listConfigNames = () => {
    const files = storage.list(/^boxclk\.cfg\..+\.json$/);
    if (storage.read(DEFAULT_CONFIG_FILE)) files.unshift(DEFAULT_CONFIG_FILE);
    return files
      .map(configNameFromFilename)
      .filter(name => !!name)
      .sort(compareConfigNames);
  };

  let settings = readSettings();
  let selectedConfig = sanitizeConfigName(settings.selectedConfig || DEFAULT_CONFIG);
  let configNames = listConfigNames();
  if (configNames.indexOf(selectedConfig) < 0) selectedConfig = configNames[0] || DEFAULT_CONFIG;

  const saveSettings = () => {
    const current = readSettings();
    const currentConfigNames = listConfigNames();
    if (currentConfigNames.indexOf(selectedConfig) < 0) selectedConfig = currentConfigNames[0] || DEFAULT_CONFIG;
    current.selectedConfig = selectedConfig;
    current.knownConfigs = currentConfigNames.slice();
    storage.writeJSON(SETTINGS_FILE, current);
  };

  const showLayoutHelp = () => {
    E.showAlert(
      "Triple-tap the clock to enter layout mode.\nTap a box to select it.\nDrag to move it.\nTap outside to deselect.\nDouble-tap the background to save and exit.",
      "Layout"
    ).then(showMenu);
  };

  const addMenuItem = (menu, label, value) => {
    while (Object.prototype.hasOwnProperty.call(menu, label)) label += " ";
    menu[label] = value;
  };

  function showConfigMenu() {
    settings = readSettings();
    configNames = listConfigNames();
    if (configNames.indexOf(selectedConfig) < 0) selectedConfig = configNames[0] || DEFAULT_CONFIG;

    const menu = {
      "": { title: "Layouts" },
      "< Back": () => showMenu()
    };

    configNames.forEach(name => {
      addMenuItem(menu, (name === selectedConfig ? "* " : "") + prettifyConfigName(name), () => {
        selectedConfig = name;
        saveSettings();
        showMenu();
      });
    });

    E.showMenu(menu);
  }

  function showMenu() {
    settings = readSettings();
    configNames = listConfigNames();
    if (configNames.indexOf(selectedConfig) < 0) selectedConfig = configNames[0] || DEFAULT_CONFIG;
    const menu = {
      "": { title: "Box Clock" },
      "< Back": () => back(),
      "Open Box Clock": () => load("boxclk.app.js"),
      "Layout Help": () => showLayoutHelp()
    };
    const layoutLabel = "Layout: " + prettifyConfigName(selectedConfig);
    const menuWithLayout = {
      "": menu[""],
      "< Back": menu["< Back"]
    };
    menuWithLayout[layoutLabel] = () => showConfigMenu();
    menuWithLayout["Open Box Clock"] = menu["Open Box Clock"];
    menuWithLayout["Layout Help"] = menu["Layout Help"];
    E.showMenu(menuWithLayout);
  }

  showMenu();
})
