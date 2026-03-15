(function(back) {
  var pendingTimeCat = null; // XXX: Slight hack; only populated in app.js
  // #region XXX: Ensure these are kept in sync between settings.js and app.js
  const storage = require('Storage');
  function readSettings() {
    return storage.readJSON(SETTINGS_FILE, 1) || {};
  }
  function writeSettings (s) {
    storage.write(SETTINGS_FILE, s);
  }
  function loadSettings() {
    return normalizeSettings(readSettings());
  }
  function saveSettings(s) {
    writeSettings(denormalizeSettings(s, pendingTimeCat));
  }
  // #endregion
  // #region XXX: Ensure these are kept in sync between settings.js, loader-settings.js, and app.js
  const SETTINGS_FILE = "harvester.json";
  function getDefaultSettings() {
    var id1 = Math.round(Date.now()), id2 = id1 + 1; // XXX: Use proper UUIDs, probably with TS
    return {
      fruitful: [
        {},
        {
          color: 'Green', fg: '#0f0', gy: '#020',
          title: 'Work',
          target_min: 480, sec_today: 0, id: id1,
        },
      ],
      hour_color: 'Green',
      hour_fg: '#0f0',
      cur_mode: 0,
      last_reset: null,
      decentering: [
        {},
        {
          title: 'Social Media', sec_today: 0, id: id2,
          fg: '#f00', gy: '#200', color: 'Red',
        }
      ],
      fallow_denominator: 3,
      fallow_buffer: 0,
    };
  }
  function normalizeCat(cat, i, _arr) {
    if (0 === i) return cat; // XXX: Skip sentinels
    // TODO: Normalize or guess at next colors?
    cat.fg = cat.fg || g.theme.fg;
    cat.gy = cat.gy || '#222';
    cat.title = cat.title || '??';
    cat.sec_today = 0 | cat.sec_today;
    if (cat.target_min) cat.target_min = 0 | cat.target_min;
    if (!cat.id) {
      // TODO: Use proper UUID, probably via TS library
      if (!normalizeCat._seq) {
        normalizeCat._seq = 0;
      }
      cat.id = Math.round(Date.now()) + normalizeCat._seq++;
    }
    return cat;
  }
  function normalizeSettings(s) {
    var def = getDefaultSettings();
    if (s.fruitful) {
      s.fruitful = s.fruitful.map(normalizeCat);
    } else {
      s.fruitful = def.fruitful;
    }
    if (s.decentering) {
      s.decentering = s.decentering.map(normalizeCat);
    } else {
      s.decentering = def.decentering;
    }
    if (s.total_sec_by_cat) {
      for (let i = 1; i < s.fruitful.length; i++) {
        s.fruitful[i].sec_today = s.total_sec_by_cat[i];
      }
      for (let i = 1; i < s.decentering.length; i++) {
        s.decentering[i].sec_today = s.total_sec_by_cat[s.total_sec_by_cat.length - i];
      }
      s.fallow_buffer = s.total_sec_by_cat[0];
    }

    s.hour_color = s.hour_color || def.hour_color;
    s.hour_fg = s.hour_fg || def.hour_fg;
    s.fallow_denominator = s.fallow_denominator || def.fallow_denominator;
    s.cur_mode = s.cur_mode || def.cur_mode;
    s.fallow_buffer = s.fallow_buffer || def.fallow_buffer;
    return s;
  }
  function denormalizeSettings(s, pendingTimeCat) {
    delete s.hr_12; // TODO: Allow setting this independently
    if (pendingTimeCat) {
      for (let i = 1; i < s.fruitful.length; i++) {
        s.fruitful[i].sec_today = pendingTimeCat[i];
      }
      for (let i = 1; i < s.decentering.length; i++) {
        s.decentering[i].sec_today = pendingTimeCat[pendingTimeCat.length - i];
      }
      s.fallow_buffer = pendingTimeCat[0];
    }
    if (s.total_sec_by_cat) {
      delete s.total_sec_by_cat;
    }
    return s;
  }
  // #endregion

  // #region XXX: Ensure these are kept in sync between settings.js and loader-settings.js
  const color_options = [
        'Lavender', 'Purple', 'Deep Blue', 'Medium Blue', 'Cyan', 'Dark Green', 'Green',
        'Yellow', 'Orange', 'Red', 'Brick', 'Gray', 'Blk/Wht' ];
  const fg_code = [
        '#f0f', '#80f', '#00f', '#08f', '#0ff', '#080', '#0f0',
        '#ff0', '#f80', '#f00', '#800', '#888', null ];
  const gy_code = [
        '#202', '#202', '#002', '#022', '#022', '#020', '#020',
        '#220', '#220', '#200', '#200', '#222', null ];
  // #endregion

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
      if (!category.title) continue;
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
      if (!category.title) continue;
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
