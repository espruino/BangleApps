require('Font5x9Numeric7Seg').add(Graphics);
require('Font7x11Numeric7Seg').add(Graphics);
require('FontTeletext5x9Ascii').add(Graphics);

const KEY_SCORE_L = 0;
const KEY_SCORE_R = 1;
const KEY_MENU = 2;
const KEY_TENNIS_H = 3;
const KEY_TENNIS_L = 4;

let settingsMenu = eval(require('Storage').read('score.settings.js'));
let settings = settingsMenu(null, null, true);

let tennisScores = ['00','15','30','40','DC','AD'];

let scores = null;
let tScores = null;
let cSet = null;
let matchEnd = null;

let firstShownSet = null;

let settingsMenuOpened = null;
let correctionMode = false;

let w = g.getWidth();
let h = g.getHeight();

let isBangle1 = process.env.BOARD === 'BANGLEJS' || process.env.BOARD === 'EMSCRIPTEN';

function getXCoord(func) {
  let offset = 20;
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
  Bangle.setUI('updown',
    isBangle1
    ? (v => {
      if (v) {
        let i = settings.mirrorScoreButtons ? v : v * -1;
        handleInput(Math.floor((i+2)/2));
      }
    })
    : (v => {
      if (v) {
        // +1 -> 4
        // -1 -> 3
        handleInput(Math.floor((v+2)/2)+3);
      }
    })
  );
  if (init) {
    setWatch(
      () => handleInput(KEY_MENU),
      isBangle1 ? BTN2 : BTN,
      { repeat: true },
    );
    Bangle.on('touch',
      isBangle1
      ? ((b, e) => {
        if (b === 1) {
          handleInput(KEY_TENNIS_H);
        } else {
          handleInput(KEY_TENNIS_L);
        }
      })
      : ((b, e) => {
        if (e.y > 18) {
          if (e.x < getXCoord(w => w/2)) {
            handleInput(KEY_SCORE_L);
          } else {
            handleInput(KEY_SCORE_R);
          }
        } else {
          // long press except if we have the menu opened or we are in the emulator (that doesn't
          // seem to support long press events)
          if (e.type === 2 || settingsMenuOpened || process.env.BOARD === 'EMSCRIPTEN2') {
            handleInput(KEY_MENU);
          } else {
            let p = null;

            if (matchWon(0)) p = 0;
            else if (matchWon(1)) p = 1;

            // display full instructions if there is space available, or brief ones otherwise
            if (p === null) {
              drawInitialMsg();
            } else {
              g.setFontAlign(0,0);
              g.setFont('Teletext5x9Ascii',1);
              g.drawString(
                "-Long press-",
                getXCoord(w => p === 0 ? w/4*3: (w/4) + 20),
                15
              );
            }
          }
        }
      })
    );
  }
}

function setupMatch() {
  matchEnd = null;
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
  settingsMenu(function (s, reset, back) {
    // console.log('reset:', reset, 'back:', back);
    if (isBangle1) {
      E.showMenu();
    }

    settings = s;

    if (reset) {
      setupMatch();
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
      case 'correct_mode':
        correctionMode = !correctionMode;
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
    scores[cSet][0] === scores[cSet][1] &&
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

  // reachedMaxScore || (winScoreReached && isTwoAhead);
  return (settings.maxScoreTiebreakEnableMaxScore && pScore >= tiebreakMaxScore()) ||
    ((pScore >= settings.maxScoreTiebreakWinScore) &&
     (!settings.maxScoreTiebreakEnableTwoAhead || pScore - p2Score >= 2));
}

function setWon(set, player) {
  let pScore = scores[set][player];
  let p2Score = scores[set][~~!player];

  // (tiebreak won / max score) || (winScoreReached && isTwoAhead) || manuallyEndedWon
  return (
    (settings.enableMaxScoreTiebreak ? tiebreakWon(set, player) : settings.enableMaxScore && pScore >= maxScore()) ||
      (pScore >= settings.winScore && (!settings.enableTwoAhead || pScore - p2Score >= 2)) ||
      (cSet > set ? pScore > p2Score : false)
  );
}

function setEnded(set) {
  return setWon(set, 0) || setWon(set, 1);
}

function setsWon(player) {
  return Uint16Array(sets()).fill(0).map((_, s) => ~~setWon(s, player)).reduce((a,v) => a+v, 0);
}

function matchWon(player) {
  return setsWon(player) >= settings.winSets;
}

function matchEnded() {
  // query if the match is ended only if: the value is not already saved or the set changed
  if (matchEnd == null || matchEnd.set != cSet) {
    matchEnd = {
      ended: (matchWon(0) || matchWon(1)) && cSet > (setsWon(0) + setsWon(1) - 1),
      set: cSet,
    }
  }
  return matchEnd.ended
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
  // console.log('button:', button);
  if (settingsMenuOpened) {

    if (!isBangle1 && button == KEY_MENU) { // Bangle2 long press, hide menu
      E.showMenu();

      settingsMenuOpened = null;

      draw();

      setupDisplay();
      setupInputWatchers();

    }
    return;
  }

  switch (button) {
    case KEY_SCORE_L:
    case KEY_SCORE_R:
      score(button);
      break;
    case KEY_MENU:
      showSettingsMenu();
      return;
    case KEY_TENNIS_H:
    case KEY_TENNIS_L: {
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
  g.reset().setFontAlign(0,0).clear();

  for (let p = 0; p < 2; p++) {
    if (matchWon(p)) {
      g.setFontAlign(0,0);
      g.setFont('Teletext5x9Ascii',2);
      g.drawString(
        "WINS",
        getXCoord(w => p === 0 ? w/4 + 7 : w/4*3 + 7),
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
        getXCoord(w => p === 0 ? w/2 - 6 : w/2 + 9),
        h-5
      );
    }
  }
  g.setFontAlign(0,0);

  if (correctionMode) {
    g.setFont('Teletext5x9Ascii',2);
    g.drawString(
      "R",
      getXCoord(w => w/2) + 1,
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
      g.drawString(dur2, 2, y+10);
    }

    for (let p = 0; p < 2; p++) {
      if (!setWon(set, p === 0 ? 1 : 0) || matchEnded()) {
        let bigNumX = getXCoord(w => p === 0 ? w/4-2 : w/4*3+5);
        let smallNumX = getXCoord(w => p === 0 ? w/2-1 : w/2+2);

        if (settings.enableTennisScoring && set === cSet && !shouldTiebreak()) {
          g.setFontAlign(0,0);
          g.setFont('7x11Numeric7Seg',3);
          g.drawString(
            formatNumber(tennisScores[tScores[p]]),
            bigNumX,
            y
          );
        } else if (set === cSet && shouldTiebreak()) {
          g.setFontAlign(0,0);
          g.setFont('7x11Numeric7Seg',3);
          g.drawString(
            formatNumber(scores[set][3+p], 3),
            bigNumX + (p === 0 ? -5 : 5),
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

        if (set === cSet && (shouldTiebreak() || settings.enableTennisScoring)) {
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

function drawInitialMsg() {
  if (!isBangle1) {
    g.setFontAlign(0,0);
    g.setFont('Teletext5x9Ascii',1);
    g.drawString(
      "-Long press here for menu-",
      90,
      15
    );
  }
}

setupDisplay();
setupInputWatchers(true);
setupMatch();
draw();
drawInitialMsg();
