require('Font5x9Numeric7Seg').add(Graphics);
require('Font7x11Numeric7Seg').add(Graphics);
require('FontTeletext5x9Ascii').add(Graphics);

let settingsMenu = eval(require('Storage').read('score.settings.js'));
let settings = settingsMenu(null, null, true);

let tennisScores = ['00','15','30','40','DC','AD'];

let scores = null;
let tScores = null;
let cSet = null;

let firstShownSet = null;

let settingsMenuOpened = null;
let correctionMode = false;

let w = g.getWidth();
let h = g.getHeight();

let isBangle1 = process.env.BOARD === 'BANGLEJS';

function getXCoord(func) {
  let offset = 40;
  return func(w-offset)+offset;
}

function getSecondsTime() {
  return Math.floor(getTime() * 1000);
}

function setupDisplay() {
  // make sure LCD on Bangle.js 1 stays on
  if (isBangle1) {
    if (settings.keepDisplayOn) {
      Bangle.setLCDTimeout(0);
      Bangle.setLCDPower(true);
    } else {
      Bangle.setLCDTimeout(10);
    }
  }
}

function setupInputWatchers(init) {
  Bangle.setUI('updown', v => {
    if (v) {
      if (isBangle1) {
        let i = settings.mirrorScoreButtons ? v : v * -1;
        handleInput(Math.floor((i+2)/2));
      } else {
        handleInput(Math.floor((v+2)/2)+3);
      }
    }
  });
  if (init) {
    setWatch(() => handleInput(2), isBangle1 ? BTN2 : BTN, { repeat: true });
    Bangle.on('touch', (b, e) => {
      if (isBangle1) {
        if (b === 1) {
          handleInput(3);
        } else {
          handleInput(4);
        }
      } else {
        if (e.x < getXCoord(w => w/2)) {
          handleInput(0);
        } else {
          handleInput(1);
        }
      }
    });
  }
}

function setupMatch() {
  scores = [];
  for (let s = 0; s < sets(); s++) {
    scores.push([0,0,null,0,0]);
  }
  scores.push([0,0,null,0,0]);

  if (settings.enableTennisScoring) {
    tScores = [0,0];
  } else {
    tScores = null;
  }

  scores[0][2] = getSecondsTime();

  cSet = 0;
  setFirstShownSet();

  correctionMode = false;
}

function showSettingsMenu() {
  settingsMenuOpened = getSecondsTime();
  settingsMenu(function (s, reset) {
    E.showMenu();

    settings = s;

    if (reset) {
      setupMatch();
    } else if (getSecondsTime() - settingsMenuOpened < 500 || correctionMode) {
      correctionMode = !correctionMode;
    }

    settingsMenuOpened = null;

    draw();

    setupDisplay();
    setupInputWatchers();
  }, function (msg) {
    switch (msg) {
      case 'end_set':
        updateCurrentSet(1);
        break;
    }
  });
}

function maxScore() {
  return Math.max(settings.maxScore, settings.winScore);
}

function tiebreakMaxScore() {
  return Math.max(settings.maxScoreTiebreakMaxScore, settings.maxScoreTiebreakWinScore);
}

function setsPerPage() {
  return Math.min(settings.setsPerPage, sets());
}

function sets() {
  return settings.winSets * 2 - 1;
}

function currentSet() {
  return matchEnded() ? cSet - 1 : cSet;
}

function shouldTiebreak() {
  return settings.enableMaxScoreTiebreak &&
    scores[cSet][0] + scores[cSet][1] === (maxScore() - 1) * 2;
}

function formatNumber(num, length) {
  return num.toString().padStart(length ? length : 2,"0");
}

function formatDuration(duration) {
  let durS = Math.floor(duration / 1000);
  let durM = Math.floor(durS / 60);
  let durH = Math.floor(durM / 60);
  durS = durS - durM * 60;
  durM = durM - durH * 60;

  durS = formatNumber(durS);
  durM = formatNumber(durM);
  durH = formatNumber(durH);

  let dur = null;
  if (durH > 0) {
    dur = durH + ':' + durM;
  } else {
    dur = durM + ':' + durS;
  }

  return dur;
}

function tiebreakWon(set, player) {
  let pScore = scores[set][3+player];
  let p2Score = scores[set][3+~~!player];

  let winScoreReached = pScore >= settings.maxScoreTiebreakWinScore;
  let isTwoAhead = !settings.maxScoreTiebreakEnableTwoAhead || pScore - p2Score >= 2;
  let reachedMaxScore = settings.maxScoreTiebreakEnableMaxScore && pScore >= tiebreakMaxScore();

  return reachedMaxScore || (winScoreReached && isTwoAhead);
}

function setWon(set, player) {
  let pScore = scores[set][player];
  let p2Score = scores[set][~~!player];

  let winScoreReached = pScore >= settings.winScore;
  let isTwoAhead = !settings.enableTwoAhead || pScore - p2Score >= 2;
  let tiebreakW = tiebreakWon(set, player);
  let reachedMaxScore = settings.enableMaxScore && pScore >= maxScore();
  let manuallyEndedWon = cSet > set ? pScore > p2Score : false;

  return (
    (settings.enableMaxScoreTiebreak ? tiebreakW : reachedMaxScore) ||
      (winScoreReached && isTwoAhead) ||
      manuallyEndedWon
  );
}

function setEnded(set) {
  return setWon(set, 0) || setWon(set, 1);
}

function setsWon(player) {
  return Array(sets()).fill(0).map((_, s) => ~~setWon(s, player)).reduce((a,v) => a+v, 0);
}

function matchWon(player) {
  return setsWon(player) >= settings.winSets;
}

function matchEnded() {
  return (matchWon(0) || matchWon(1)) && cSet > (setsWon(0) + setsWon(1) - 1);
}

function matchScore(player) {
  return scores.reduce((acc, val) => acc += val[player], 0);
}

function setFirstShownSet() {
  firstShownSet = Math.max(0, currentSet() - setsPerPage() + 1);
}

function updateCurrentSet(val) {
  if (val > 0) {
    cSet++;
  } else if (val < 0) {
    cSet--;
  } else {
    return;
  }
  setFirstShownSet();

  if (val > 0) {
    scores[cSet][2] = getSecondsTime();

    if (matchEnded()) {
      firstShownSet = 0;
    }
  }
}

function score(player) {
  if (!matchEnded()) {
    setFirstShownSet();
  }

  if (correctionMode) {
    if (
      scores[cSet][0] === 0 && scores[cSet][1] === 0 &&
        scores[cSet][3] === 0 && scores[cSet][4] === 0 &&
        cSet > 0
    ) {
      updateCurrentSet(-1);
    }

    if (scores[cSet][3] > 0 || scores[cSet][4] > 0) {
      if (scores[cSet][3+player] > 0) {
        scores[cSet][3+player]--;
      }
    } else if (scores[cSet][player] > 0) {
      if (
        !settings.enableTennisScoring ||
          (tScores[player] === 0 && tScores[~~!player] === 0)
      ) {
        scores[cSet][player]--;
      } else {
        tScores[player] = 0;
        tScores[~~!player] = 0;
      }
    }
  } else {
    if (matchEnded()) return;

    if (shouldTiebreak()) {
      scores[cSet][3+player]++;
    } else if (settings.enableTennisScoring) {
      if (tScores[player] === 4 && tScores[~~!player] === 5) { // DC : AD
        tScores[~~!player]--;
      } else if (tScores[player] === 2 && tScores[~~!player] === 3) { // 30 : 40
        tScores[0] = 4;
        tScores[1] = 4;
      } else if (tScores[player] === 3 || tScores[player] === 5) { // 40 / AD
        tScores[0] = 0;
        tScores[1] = 0;
        scores[cSet][player]++;
      } else {
        tScores[player]++;
      }
    } else {
      scores[cSet][player]++;
    }

    if (setEnded(cSet) && cSet < sets()) {
      if (shouldTiebreak()) {
        scores[cSet][player]++;
      }
      updateCurrentSet(1);
    }
  }
}

function handleInput(button) {
  if (settingsMenuOpened) {
    return;
  }

  switch (button) {
    case 0:
    case 1:
      score(button);
      break;
    case 2:
      showSettingsMenu();
      return;
    case 3:
    case 4: {
      let hLimit = currentSet() - setsPerPage() + 1;
      let lLimit = 0;
      let val = (button * 2 - 7);
      firstShownSet += val;
      if (firstShownSet > hLimit) firstShownSet = hLimit;
      if (firstShownSet < lLimit) firstShownSet = lLimit;
      break;
    }
  }

  draw();
}

function draw() {
  g.setFontAlign(0,0);
  g.clear();

  for (let p = 0; p < 2; p++) {
    if (matchWon(p)) {
      g.setFontAlign(0,0);
      g.setFont('Teletext5x9Ascii',2);
      g.drawString(
        "WINNER",
        getXCoord(w => p === 0 ? w/4 : w/4*3),
        15
      );
    } else if (matchEnded()) {
      g.setFontAlign(1,0);

      g.setFont('Teletext5x9Ascii',1);
      g.drawString(
        (currentSet()+1) + ' set' + (currentSet() > 0 ? 's' : ''),
        40,
        8
      );

      let dur1 = formatDuration(scores[cSet][2] - scores[0][2]);
      g.setFont('5x9Numeric7Seg',1);
      g.drawString(
        dur1,
        40,
        18
      );
    }

    g.setFontAlign(p === 0 ? -1 : 1,1);
    g.setFont('5x9Numeric7Seg',2);
    g.drawString(
      setsWon(p),
      getXCoord(w => p === 0 ? 5 : w-3),
      h-5
    );

    if (!settings.enableTennisScoring) {
      g.setFontAlign(p === 0 ? 1 : -1,1);
      g.setFont('7x11Numeric7Seg',2);
      g.drawString(
        formatNumber(matchScore(p), 3),
        getXCoord(w => p === 0 ? w/2 - 3 : w/2 + 6),
        h-5
      );
    }
  }
  g.setFontAlign(0,0);

  if (correctionMode) {
    g.setFont('Teletext5x9Ascii',2);
    g.drawString(
      "R",
      getXCoord(w => w/2),
      h-10
    );
  }

  let lastShownSet = Math.min(
    sets(),
    currentSet() + 1,
    firstShownSet+setsPerPage()
  );
  let setsOnCurrentPage = Math.min(
    sets(),
    setsPerPage()
  );
  for (let set = firstShownSet; set < lastShownSet; set++) {
    if (set < 0) continue;

    let y = (h-15)/(setsOnCurrentPage+1)*(set-firstShownSet+1)+5;

    g.setFontAlign(-1,0);
    g.setFont('7x11Numeric7Seg',1);
    g.drawString(set+1, 5, y-10);
    if (scores[set+1][2] != null) {
      let dur2 = formatDuration(scores[set+1][2] - scores[set][2]);
      g.drawString(dur2, 5, y+10);
    }

    for (let p = 0; p < 2; p++) {
      if (!setWon(set, p === 0 ? 1 : 0) || matchEnded()) {
        let bigNumX = getXCoord(w => p === 0 ? w/4-12 : w/4*3+15);
        let smallNumX = getXCoord(w => p === 0 ? w/2-2 : w/2+3);

        if (settings.enableTennisScoring && set === cSet && !shouldTiebreak()) {
          g.setFontAlign(0,0);
          g.setFont('7x11Numeric7Seg',3);
          g.drawString(
            formatNumber(tennisScores[tScores[p]]),
            bigNumX,
            y
          );
        } else if (shouldTiebreak() && set === cSet) {
          g.setFontAlign(0,0);
          g.setFont('7x11Numeric7Seg',3);
          g.drawString(
            formatNumber(scores[set][3+p], 3),
            bigNumX,
            y
          );
        } else {
          g.setFontAlign(0,0);
          g.setFont('7x11Numeric7Seg',3);
          g.drawString(
            formatNumber(scores[set][p]),
            bigNumX,
            y
          );
        }

        if ((shouldTiebreak() || settings.enableTennisScoring) && set === cSet) {
          g.setFontAlign(p === 0 ? 1 : -1,0);
          g.setFont('7x11Numeric7Seg',1);
          g.drawString(
            formatNumber(scores[set][p]),
            smallNumX,
            y
          );
        } else if ((scores[set][3] !== 0 || scores[set][4] !== 0) && set !== cSet) {
          g.setFontAlign(p === 0 ? 1 : -1,0);
          g.setFont('7x11Numeric7Seg',1);
          g.drawString(
            formatNumber(scores[set][3+p], 3),
            smallNumX,
            y
          );
        }
      }
    }
  }

  // draw separator
  g.drawLine(getXCoord(w => w/2), 20, getXCoord(w => w/2), h-25);

  g.flip();
}

setupDisplay();
setupInputWatchers(true);
setupMatch();
draw();
