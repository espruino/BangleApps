(function(back) {
    let settings = require('Storage').readJSON('lato.json',1)||{};
    if (typeof settings.dateDisplay !== "boolean") settings.dateDisplay = false; // default value
    if (typeof settings.dateFormat !== "number") settings.dateFormat = 0; // default value
    function save(key, value) {
      settings[key] = value;
      require('Storage').write('lato.json', settings);
    }
    const appMenu = {
      '': {'title': 'Lato'},
      '< Back': back,
      'Display Date?': {
        value: settings.dateDisplay,
        onchange: (v) => {save('dateDisplay', v)}
      },
      "Date Format": {
        value: settings.dateFormat,
        min: 0, max: 2,
        format: v => ["DoW, dd MMM","Locale Short","Locale Long"][v],
        onchange: (v) => {save('dateFormat', v)}
      }
    };
    E.showMenu(appMenu)
  })