(function(back) {
  const storage = require('Storage');
  let settings = storage.readJSON('clicompleteclk.json', 1) || {};
  function save(key, value) {
    settings[key] = value;
    storage.write('clicompleteclk.json', settings);
  }
  E.showMenu({
    '': { 'title': 'CLI complete clk' },
    'Show battery': {
      value: "battery" in settings ? settings.battery : false,
      format: () => (settings.battery ? 'Yes' : 'No'),
      onchange: () => {
        settings.battery = !settings.battery
        save('battery', settings.battery);
      },
    },
    '< Back': back,
  });
});
