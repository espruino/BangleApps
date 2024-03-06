Bangle.loadWidgets();
Bangle.drawWidgets();

var settings = require("Storage").readJSON("tabata.json",1)||{};
settings.pause = settings.pause || 10;
settings.training = settings.training || 20;
settings.rounds = settings.rounds || 8;

const MAX_SECONDS = 100;

function debounce(callback, ms) {
  var timer;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
}

function saveSettings() {
  require("Storage").write("tabata.json",JSON.stringify(settings));
}

var saveSettingsDebounce = debounce(saveSettings, 250);

function showMainMenu() {
  const menu = {
    '': { 'title': 'Tabata Training' },
    '>> Start >>': ()=> {
      startTabata();
    },
    'Pause sec.': {
      value: settings.pause,
        min : 0, max : MAX_SECONDS, wrap : true,
      onchange: v => {
        settings.pause=v;
        saveSettingsDebounce();
      }
    },
    'Trainig sec.': {
      value: settings.training,
      min : 0, max : MAX_SECONDS, wrap : true,
      onchange: v => {
        settings.training=v;
        saveSettingsDebounce();
      }
    },
    'Rounds': {
      value: settings.rounds,
      onchange: function(v){if (v<0)v=MAX_SECONDS;if (v>MAX_SECONDS)v=0;settings.rounds=v;this.value=v;
        saveSettingsDebounce();
      }
    },
    '< Back': () => load()
  };
  menu['< Back'] =  ()=>{load();};
  return E.showMenu(menu);
}

function startTabata() {
  g.clear();
  Bangle.setLCDMode("doublebuffered");
  g.flip();
  var pause = settings.pause,
    training = settings.training,
    round = 1,
    active = true,
    clearBtn1, clearBtn2, clearBtn3, timer;
  Bangle.buzz(1000, 1);

  function exitTraining() {
    clearTimeout(timer);
    clearWatch(clearBtn1);
    clearWatch(clearBtn2);
    clearWatch(clearBtn2); // TODO: Should it be Btn3 here?
    showMainMenu();
  }

  clearBtn1 = setWatch(exitTraining, BTN1);
  clearBtn2 = setWatch(exitTraining, BTN2);
  clearBtn3 = setWatch(exitTraining, BTN3);


  timer = setInterval(function() {
    if (round > settings.rounds) {
      exitTraining();
      return;
    }

    if (active) {
      drawCountDown(round, training, active);
      training--;
    } else {
      drawCountDown(round, pause, active);
      pause--;
      if (pause !== 0) {
        Bangle.buzz(50, 0.2);
      }
    }

    if (training === 0) {
      training = settings.training;
      active = false;
      Bangle.buzz(500, 1);
    }
    if (pause === 0) {
      round++;
      pause = settings.pause;
      active = true;
      Bangle.buzz(1000, 1);
    }
  }, 1000);
}

function drawCountDown(round, count, active) {
  g.clear();

  g.setFontAlign(0,0);
  g.setFont("6x8", 2);
  g.drawString("Round " + round + "/" + settings.rounds,120,6);

  g.setFont("6x8", 6);
  g.drawString("" + count,120,80);

  g.setFont("6x8",2);
  g.drawString(active ? "Training" : "Pause", 120,45);
  g.flip();
}

showMainMenu();
