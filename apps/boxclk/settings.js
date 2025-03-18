(function () {
  let storage = require("Storage");
  let fileRegex = /^boxclk-(\d+)\.json$/;
  let selectedConfig;
  let configs = {};
  let hasDefaultConfig = false;

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

  let configFiles = [];
  storage.list().forEach(file => {
    let match = file.match(fileRegex);
    if (match) {
      configFiles.push({ file: file, number: parseInt(match[1]) });
    } else if (file === "boxclk.json") {
      hasDefaultConfig = true;
      let defaultConfig = storage.readJSON(file, 1);
      if (defaultConfig && defaultConfig.selectedConfig != null) {
        // Check if corresponding config file exists
        let configFileName = 'boxclk-' + defaultConfig.selectedConfig + '.json';
        if (storage.read(configFileName)) {
          // If it exists, assign selectedConfig
          selectedConfig = defaultConfig.selectedConfig;
        } else {
          // If it does not exist, set selectedConfig to 0 and update boxclk.json
          defaultConfig.selectedConfig = 0;
          storage.writeJSON("boxclk.json", defaultConfig);
          selectedConfig = 0;
        }
      }
    }
  });

  // Sort the config files by number
  configFiles.sort((a, b) => a.number - b.number);

  configFiles.forEach(configFile => {
    configs[configFile.number] = handleSelection(configFile.number);
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
    '< Back': () => Bangle.showClock(),
    'Cfg:': {
              value: selectedConfig === 0 ? "Default" : selectedConfig,
              format: () => selectedConfig === 0 ? "Default" : selectedConfig
            }
  };

  if (hasDefaultConfig) {
    menu['Default'] = handleSelection('Default');
  }

  Object.keys(configs).forEach(config => {
    menu[config] = handleSelection(config);
  });

  E.showMenu(menu);
})
