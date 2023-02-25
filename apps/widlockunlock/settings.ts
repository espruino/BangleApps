((back: () => void) => {
  type Location = "tl" | "tr";
  type Settings = {
    location: Location;
  };

  const storage = require('Storage');

  const filename = 'lockunlock.settings.json';
  const settings: Settings = Object.assign(
    storage.readJSON(filename, true) || {},
    { location: "tl" }
  );

  const save = () =>
    storage.writeJSON(filename, settings);

  const locations: Array<Location> = [ "tl", "tr" ];

  const menu = {
    '': { 'title': 'Lock/Unlock' },
    '< Back': back,
    'Location': {
      value: (() => {
        const i = locations.indexOf(settings.location);
        return i < 0 ? 0 : i;
      })(),
      min: 0,
      max: locations.length - 1,
      wrap: true,
      format: (v: number) => locations[v]!,
      onchange: (v: number) => {
        settings.location = locations[v]!;
        save();
      },
    },
  };
  E.showMenu(menu);
});
