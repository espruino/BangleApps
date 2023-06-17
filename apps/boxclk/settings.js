let storage = require("Storage");
let fileRegex = /^boxclk-(\d+)\.json$/;
let selectedConfig;

function getNextConfigNumber() {
  let maxNumber = 0;
  storage.list().forEach(file => {
    let match = file.match(fileRegex);
    if (match) {
      let number = parseInt(match[1]);
      if (number > maxNumber) {
        maxNumber = number;
      }
    }
  });
  return maxNumber + 1;
}

(function () {
  let configs = {};
  let hasDefaultConfig = false;

  function handleSelection(config) {
    return function () {
      selectedConfig = config === "Default" ? 0 : config;
      menu["Cfg:"].value = selectedConfig === 0 ? "Default" : selectedConfig;
      E.showMenu(menu);

      // Retrieve existing data and update selectedConfig
      let defaultConfig = storage.readJSON("boxclk.json", 1) || {};
      defaultConfig.selectedConfig = selectedConfig;
      storage.writeJSON("boxclk.json", defaultConfig);
    };
  }

  storage.list().forEach(file => {
    let match = file.match(fileRegex);
    if (match) {
      let configNumber = match[1];
      configs[configNumber] = handleSelection(configNumber);
    } else if (file === "boxclk.json") {
      hasDefaultConfig = true;
      let defaultConfig = storage.readJSON(file, 1);
      if (defaultConfig && defaultConfig.selectedConfig) {
        selectedConfig = defaultConfig.selectedConfig === 0 ? 0 : defaultConfig.selectedConfig;
      }
    }
  });

  if (!selectedConfig) {
    if (hasDefaultConfig) {
      selectedConfig = "Default";
    } else {
      let nextConfigNumber = getNextConfigNumber();
      selectedConfig = nextConfigNumber.toString();
      configs[selectedConfig] = handleSelection(selectedConfig);
    }
  }

  let menu = {
    '': { 'title': '-- Box Clock --' },
    '< Back': () => Bangle.showLauncher(),
    'Cfg:': { value: selectedConfig === 0 ? "Default" : selectedConfig, format: () => selectedConfig === 0 ? "Default" : selectedConfig },
  };

  if (hasDefaultConfig) {
    menu['Default'] = handleSelection('Default');
  }

  Object.keys(configs).forEach(config => {
    menu[config] = handleSelection(config);
  });

  E.showMenu(menu);
})();
