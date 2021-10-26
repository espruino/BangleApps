(function (back) {
  const storage = require('Storage');
  const SETTINGS_FILE = "ffcniftyb.json";

  const colors = {
    65535: 'White',
    63488: 'Red',
    65504: 'Yellow',
    2047: 'Cyan',
    2016: 'Green',
    31: 'Blue',
    0: 'Black',
  }

  function load(settings) {
    return Object.assign(settings, storage.readJSON(SETTINGS_FILE, 1) || {});
  }

  function save(settings) {
    storage.write(SETTINGS_FILE, settings)
  }

  const settings = load({
    color: 63488 /* red */,
  });

  const saveColor = (color) => () => {
    settings.color = color;
    save(settings);
    back();
  };

  function showMenu(items, opt) {
    items[''] = opt || {};
    items['< Back'] = back;
    E.showMenu(items);
  }

  showMenu(
    Object.keys(colors).reduce((menu, color) => {
      menu[colors[color]] = saveColor(color);
      return menu;
    }, {}),
    {
      title: 'Color',
      selected: Object.keys(colors).indexOf(settings.color)
    }
  );
});
