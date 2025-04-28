(function (back, inApp, ret) {
  const isBangle1 = process.env.BOARD === 'BANGLEJS'

  function fillSettingsWithDefaults(settings) {
    settings = Object.assign({
      winSets: 2,
      setsPerPage: 5,
      winScore: 21,
      enableTwoAhead: true,
      enableMaxScore: true,
      maxScore: 30,
      enableTennisScoring: false,

      enableMaxScoreTiebreak: false,
      maxScoreTiebreakWinScore: 6,
      maxScoreTiebreakEnableTwoAhead: true,
      maxScoreTiebreakEnableMaxScore: false,
      maxScoreTiebreakMaxScore: 15,
    }, settings);

    if (isBangle1) {
      settings = Object.assign({
        mirrorScoreButtons: false,
        keepDisplayOn: true,
      }, settings);
    }

    return settings;
  }

  const fileName = 'score.json';
  let settings = require('Storage').readJSON(fileName, 1) || {};
  const offon = ['No', 'Yes'];

  let presetsFileName = 'score.presets.json';
  let presets = require('Storage').readJSON(presetsFileName);
  let presetNames = Object.keys(presets);

  let changed = false;

  function save(settings) {
    require('Storage').writeJSON(fileName, settings);
  }

  function setAndSave(key, value, notChanged) {
    if (!notChanged) {
      changed = true;
    }
    settings[key] = value;
    if (key === 'winScore' && settings.maxScore < value) {
      settings.maxScore = value;
    }
    save(settings);
  }

  settings = fillSettingsWithDefaults(settings);

  if (ret) {
    return settings;
  }

  const presetMenu = function (appMenuBack) {
    let ret = function (changed) { E.showMenu(appMenu(appMenuBack, changed ? 2 : null)); };
    let m = {
      '': {'title': 'Score Presets'},
      '< Back': ret,
    };
    for (let i = 0; i < presetNames.length; i++) {
      m[presetNames[i]] = (function (i) {
        return function() {
          changed = true;
          let mirrorScoreButtons = settings.mirrorScoreButtons;
          let keepDisplayOn = settings.keepDisplayOn;

          settings = fillSettingsWithDefaults(presets[presetNames[i]]);

          settings.mirrorScoreButtons = mirrorScoreButtons;
          settings.keepDisplayOn = keepDisplayOn;
          save(settings);
          ret(true);
        };
      })(i);
    }

    return m;
  };

  const appMenu = function (back, selected) {
    let m = {};

    m[''] = {'title': 'Score Settings'};
    if (selected != null) {
      m[''].selected = selected;
    }
    m['< Back'] = function () { back(settings, changed, true); };
    m['Presets'] = function () { E.showMenu(presetMenu(back)); };
    if (isBangle1) {
      m['Mirror Buttons'] = {
        value: settings.mirrorScoreButtons,
        format: m => offon[~~m],
        onchange: m => setAndSave('mirrorScoreButtons', m, true),
      };
      m['Keep display on'] = {
        value: settings.keepDisplayOn,
        format: m => offon[~~m],
        onchange: m => setAndSave('keepDisplayOn', m, true),
      }
    }
    m['Sets to win'] = {
      value: settings.winSets,
      min:1,
      onchange: m => setAndSave('winSets', m),
    };
    m['Sets per page'] = {
      value: settings.setsPerPage,
      min:1,
      max:5,
      onchange: m => setAndSave('setsPerPage', m),
    };
    m['Score to win'] = {
      value: settings.winScore,
      min:1,
      max: 999,
      onchange: m => setAndSave('winScore', m),
    };
    m['2-point lead'] = {
      value: settings.enableTwoAhead,
      format: m => offon[~~m],
      onchange: m => setAndSave('enableTwoAhead', m),
    };
    m['Maximum score?'] = {
      value: settings.enableMaxScore,
      format: m => offon[~~m],
      onchange: m => setAndSave('enableMaxScore', m),
    };
    m['Maximum score'] = {
      value: settings.maxScore,
      min: 1,
      max: 999,
      onchange: m => setAndSave('maxScore', m),
    };
    m['Tennis scoring'] = {
      value: settings.enableTennisScoring,
      format: m => offon[~~m],
      onchange: m => setAndSave('enableTennisScoring', m),
    };
    m['TB sets?'] = {
      value: settings.enableMaxScoreTiebreak,
      format: m => offon[~~m],
      onchange: m => setAndSave('enableMaxScoreTiebreak', m),
    };
    m['TB Score to win'] = {
      value: settings.maxScoreTiebreakWinScore,
      onchange: m => setAndSave('maxScoreTiebreakWinScore', m),
    };
    m['TB 2-point lead'] = {
      value: settings.maxScoreTiebreakEnableTwoAhead,
      format: m => offon[~~m],
      onchange: m => setAndSave('maxScoreTiebreakEnableTwoAhead', m),
    };
    m['TB max score?'] = {
      value: settings.maxScoreTiebreakEnableMaxScore,
      format: m => offon[~~m],
      onchange: m => setAndSave('maxScoreTiebreakEnableMaxScore', m),
    };
    m['TB max score'] = {
      value: settings.maxScoreTiebreakMaxScore,
      onchange: m => setAndSave('maxScoreTiebreakMaxScore', m),
    };

    return m;
  };

  const inAppMenu = function () {
    let m = {
      '': {'title': 'Score Menu'},
      '< Back': function () { back(settings, changed); },
      'Correct mode': function () { inApp('correct_mode'); back(settings, false); },
      'Reset match': function () { back(settings, true); },
      'End current set': function () { inApp('end_set'); back(settings, changed); },
      'Configuration': function () { E.showMenu(appMenu(function () {
        E.showMenu(inAppMenu());
      })); },
    };

    return m;
  };

  if (inApp != null) {
    E.showMenu(inAppMenu());
  } else {
    E.showMenu(appMenu(back));
  }
})
