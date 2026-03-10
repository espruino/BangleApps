(function(back) {
  // *** XXX: Ensure these are kept in sync with settings.js ***
  const SETTINGS_FILE = "harvester.json";
  function getDefaultSettings () {
    return {
      fruitful: [
        {
          color: 'Green', fg: '#0f0', gy: '#020',
          title: 'Work',
          target_min: 480,
        },
      ],
      hour_color: 'Green',
      hour_fg: '#0f0',
      cur_mode: 0,
      last_reset: null,
      decentering: [
        {
          title: 'Social Media',
          fg: '#f00', gy: '#200', color: 'Red',
        }
      ],
      fallow_denominator: 3,
    };
  }
  function loadSettings () {
    var def = getDefaultSettings();
    var settings = storage.readJSON(SETTINGS_FILE, 1) || {};
    // TODO: Add per-item normalizer fns
    settings.fruitful = settings.fruitful || def.fruitful;
    settings.decentering = settings.decentering || def.decentering;

    settings.hour_color = settings.hour_color || def.hour_color;
    settings.hour_fg = settings.hour_fg || def.hour_fg;
    settings.fallow_denominator = settings.fallow_denominator || def.fallow_denominator;
    // Converts from JSON or supplies size
    settings.total_sec_by_cat = new Uint16Array(settings.total_sec_by_cat || 16);
    settings.cur_mode = settings.cur_mode || def.cur_mode;
    return settings;
  }
  function saveSettings (s) {
    delete s.hr_12; // TODO: Allow setting this independently
    storage.write(SETTINGS_FILE, s);
  }
  // *** End manual sync area ***

  const color_options = [
        'Lavender', 'Purple', 'Deep Blue', 'Medium Blue', 'Cyan', 'Dark Green', 'Green',
        'Yellow', 'Orange', 'Red', 'Brick', 'Gray', 'Blk/Wht' ];
  const fg_code = [
        '#f0f', '#80f', '#00f', '#08f', '#0ff', '#080', '#0f0',
        '#ff0', '#f80', '#f00', '#800', '#888', null ];
  const gy_code = [
        '#202', '#202', '#002', '#022', '#022', '#020', '#020',
        '#220', '#220', '#200', '#200', '#222', null ];

  function showFruitfulMenu(curCategories) {
    let submenu = { '': { title: 'Fruitful Modes', back: showMainMenu } };
    let reshow = () => E.showMenu(submenu);

    function categoryMenu(category) {
      return {
        '': { title: category.title, back: reshow },
        'Color': {
          value: 0 | color_options.indexOf(category.color),
          min: 0, max: color_options.length - 1,
          format: v => color_options[v],
          onchange: v => {
            category.color = color_options[v];
            category.fg = fg_code[v];
            category.gy = gy_code[v];
            saveSettings(settings);
          }
        },
        'Target': {
          value: 0 | category.target_min, min: 15, max: 600, step: 15, wrap: true,
          onchange: v => {
            category.target_min = v;
            saveSettings(settings);
          },
        },
      };
    }

    for (let category of curCategories) {
      let menuCat = categoryMenu(category);
      menuCat['Delete'] = () => {
        E.showPrompt('Delete this category?', { title: category.title }).then(v => {
          if (v) {
            settings.fruitful = settings.fruitful.filter(c => c.title != category.title);
            saveSettings(settings);
          }
        });
      };
      submenu[category.title] = () => E.showMenu(menuCat);
    }
    let iLastColor = 0 | color_options.indexOf(curCategories[curCategories.length - 1].color);
    // TODO: Allow editing category titles here
    let defaultTitle = `Category ${curCategories.length}`;
    let newCat = { color: color_options[iLastColor + 1], title: defaultTitle };
    let addMenu = categoryMenu(newCat);
    addMenu['Save'] = () => {
      settings.fruitful.push(newCat);
      saveSettings(settings);
      showFruitfulMenu(settings.fruitful);
    };
    submenu['(Add...)'] = () => E.showMenu(addMenu);
    E.showMenu(submenu);
  }

  function showDivergentMenu(curCategories) {
    let submenu = { '': { title: 'Divergent Modes', back: showMainMenu } };
    let reshow = () => E.showMenu(submenu);

    function categoryMenu(category) {
      return {
        '': { title: category.title, back: reshow },
        'Color': {
          value: 0 | color_options.indexOf(category.color),
          min: 0, max: color_options.length - 1,
          format: v => color_options[v],
          onchange: v => {
            category.color = color_options[v];
            category.fg = fg_code[v];
            category.gy = gy_code[v];
            saveSettings(settings);
          }
        },
      };
    }

    for (let category of curCategories) {
      let menuCat = categoryMenu(category);
      menuCat['Delete'] = () => {
        E.showPrompt('Delete this category?', { title: category.title }).then(v => {
          if (v) {
            settings.decentering = settings.decentering.filter(c => c.title != category.title);
            saveSettings(settings);
          }
        });
      };
      submenu[category.title] = () => E.showMenu(menuCat);
    }
    let iLastColor = 0 | color_options.indexOf(curCategories[0].color);
    // TODO: Allow editing category titles here
    let defaultTitle = `Category ${curCategories.length}`;
    let newCat = { color: color_options[iLastColor - 1], title: defaultTitle };
    let addMenu = categoryMenu(newCat);
    addMenu['Save'] = () => {
      settings.decentering.push(newCat);
      saveSettings(settings);
      showDivergentMenu(settings.decentering);
    };
    submenu['(Add...)'] = () => E.showMenu(addMenu);
    E.showMenu(submenu);
  }

  var settings = loadSettings();
  function showMainMenu() {
    let appMenu = {
      '': { title: 'Time Harvester', back: back },
      'Fruitful...': () => showFruitfulMenu(settings.fruitful),
      'Divergent...': () => showDivergentMenu(settings.decentering),
      'Hour Color': {
        value: 0 | color_options.indexOf(settings.color),
        min: 0, max: color_options.length - 1,
        format: v => color_options[v],
        onchange: v => {
          settings.hour_color = color_options[v];
          settings.hour_fg = fg_code[v];
          saveSettings(settings);
        },
      },
      'Fallow Ratio': {
        value: 0 | settings.fallow_denominator, min: 2, max: 6, step: 0.5,
        format: v => `1:${v}`,
        onchange: v => {
          settings.fallow_denominator = v;
          saveSettings(settings);
        },
      },
    };
    E.showMenu(appMenu);
  }

  showMainMenu();
})
