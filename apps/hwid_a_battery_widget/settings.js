(back => {
  const S = require('Storage');

  const SETTINGS_FILE = "hwid_a_battery_widget.settings.json";
  const settings = S.readJSON(SETTINGS_FILE, 1) || {
    showHighMark: true,
  };

  const save = () => S.write(SETTINGS_FILE, settings);

  E.showMenu({
    '': { 'title': 'Battery Widget (hank mod)' },
    '< Back': back,
    'Show high mark': {
      value: settings.showHighMark,
      onchange: v => {
        settings.showHighMark = v;
        save();
      },
    },
  });
})
