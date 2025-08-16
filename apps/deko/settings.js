(function (back) {
  const storage = require('Storage');
  const settingsFile = 'deko.settings.json';
  const defaultSettings = {
    loadWidgets: 1,
  };
  const settings = Object.assign(
    defaultSettings,
    storage.readJSON(settingsFile, 1) || {},
  );
  const loadWidgetsChoices = ['No', 'Yes', 'Unlocked'];

  const save = () => storage.write(settingsFile, settings);

  const appMenu = {
    '': { title: 'Deko Clock' },
    '< Back': back,
    'Load widgets?': {
      value: settings.loadWidgets,
      min: 0,
      max: 2,
      step: 1,
      format: (v) => loadWidgetsChoices[v],
      onchange: (v) => {
        settings.loadWidgets = v;
        save();
      },
    },
  };

  E.showMenu(appMenu);
})
