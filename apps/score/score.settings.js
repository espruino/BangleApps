(function (back, ret) {

    const fileName = 'score.json'
    let settings = require('Storage').readJSON(fileName, 1) || {};
    const offon = ['No', 'Yes'];

    let changed = false;

    function save(key, value) {
        changed = true;
        settings[key] = value;
        if (key === 'winScore' && settings.maxScore < value) {
            settings.maxScore = value;
        }
        require('Storage').writeJSON(fileName, settings);
    }

    if (settings.winSets == null) {
        settings.winSets = 1;
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

    if (ret) {
        return settings;
    }

    const appMenu = {};
    appMenu[''] = {'title': 'Score Settings'},
    appMenu['< Back'] = function () { back(settings, changed); };
    if (reset) {
        appMenu['Reset match'] = function () { back(settings, true); };
    }
    appMenu['Sets to win'] = {
        value: settings.winSets,
        min:1,
        onchange: m => save('winSets', m)
    };
    appMenu['Sets per page'] = {
        value: settings.setsPerPage,
        min:1,
        max:5,
        onchange: m => save('setsPerPage', m)
    };
    appMenu['Score to win'] = {
        value: settings.winScore,
        min:1,
        onchange: m => save('winScore', m)
    };
    appMenu['2-point lead'] = {
        value: settings.enableTwoAhead,
        format: m => offon[~~m],
        onchange: m => save('enableTwoAhead', m)
    };
    appMenu['Maximum score?'] = {
        value: settings.enableMaxScore,
        format: m => offon[~~m],
        onchange: m => save('enableMaxScore', m)
    };
    appMenu['Maximum score'] = {
        value: settings.maxScore,
        min: 1,
        onchange: m => save('maxScore', m)
    };
    appMenu['Tennis scoring'] = {
        value: settings.enableTennisScoring,
        format: m => offon[~~m],
        onchange: m => save('enableTennisScoring', m)
    };
    appMenu['TB sets?'] = {
        value: settings.enableMaxScoreTiebreak,
        format: m => offon[~~m],
        onchange: m => save('enableMaxScoreTiebreak', m)
    }
    appMenu['TB Score to win'] = {
        value: settings.maxScoreTiebreakWinScore,
        onchange: m => save('maxScoreTiebreakWinScore', m)
    }
    appMenu['TB 2-point lead'] = {
        value: settings.maxScoreTiebreakEnableTwoAhead,
        format: m => offon[~~m],
        onchange: m => save('maxScoreTiebreakEnableTwoAhead', m)
    }
    appMenu['TB max score?'] = {
        value: settings.maxScoreTiebreakEnableMaxScore,
        format: m => offon[~~m],
        onchange: m => save('maxScoreTiebreakEnableMaxScore', m)
    }
    appMenu['TB max score'] = {
        value: settings.maxScoreTiebreakMaxScore,
        onchange: m => save('maxScoreTiebreakMaxScore', m)
    }

    E.showMenu(appMenu)

})
