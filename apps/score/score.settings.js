function fillSettingsWithDefaults(settings) {
  if (settings.winSets == null) {
    settings.winSets = 2;
  }
  if (settings.setsPerPage == null) {
    settings.setsPerPage = 5;
  }
  if (settings.winScore == null) {
    settings.winScore = 21;
  }
  if (settings.enableTwoAhead == null) {
    settings.enableTwoAhead = true;
  }
  if (settings.enableMaxScore == null) {
    settings.enableMaxScore = true;
  }
  if (settings.maxScore == null) {
    settings.maxScore = 30;
  }
  if (settings.enableTennisScoring == null) {
    settings.enableTennisScoring = false;
  }

  if (settings.enableMaxScoreTiebreak == null) {
    settings.enableMaxScoreTiebreak = false;
  }
  if (settings.maxScoreTiebreakWinScore == null) {
    settings.maxScoreTiebreakWinScore = 6;
  }
  if (settings.maxScoreTiebreakEnableTwoAhead == null) {
    settings.maxScoreTiebreakEnableTwoAhead = true;
  }
  if (settings.maxScoreTiebreakEnableMaxScore == null) {
    settings.maxScoreTiebreakEnableMaxScore = false;
  }
  if (settings.maxScoreTiebreakMaxScore == null) {
    settings.maxScoreTiebreakMaxScore = 15;
  }

  return settings;
}

(function (back, ret) {

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

  function setAndSave(key, value) {
    changed = true;
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

  const presetMenu = function () {
    let ret = function (changed) { E.showMenu(appMenu(changed ? 3 : null)); };
    let m = {
      '': {'title': 'Score Presets'},
      '< Back': ret,
    };
    for (let i = 0; i < presetNames.length; i++) {
      m[presetNames[i]] = (function (i) {
        return function() {
          changed = true;
          settings = fillSettingsWithDefaults(presets[presetNames[i]]);
          save(settings);
          ret(true);
        };
      })(i);
    }

    return m;
  };

  const appMenu = function (selected) {
    let m = {};

    m[''] = {'title': 'Score Settings'};
    if (selected != null) {
      m[''].selected = selected;
    }
    m['< Back'] = function () { back(settings, changed); };
    if (reset) {
      m['Reset match'] = function () { back(settings, true); };
    }
    m['Presets'] = function () { E.showMenu(presetMenu()); };
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

  E.showMenu(appMenu());

});
