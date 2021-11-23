Bangle.loadWidgets();
Bangle.drawWidgets();

const modeNames = ["Off", "Alarms", "Silent"];
let scheds = require("Storage").readJSON("qmsched.json", 1);
/*scheds = [
  { hr : 6.5, // hours + minutes/60
    mode : 1, // quiet mode (0/1/2)
  }
];*/
if (!scheds) {
  // set default schedule on first load of app
  scheds = [
    {"hr": 8, "mode": 0},
    {"hr": 22, "mode": 1},
  ];
  require("Storage").writeJSON("qmsched.json", scheds);
}
if (scheds.length && scheds.some(s => "last" in s)) {
  // cleanup: remove "last" values (used by old versions)
  scheds = scheds.map(s => {
    delete s.last;
    return s;
  });
  require("Storage").writeJSON("qmsched.json", scheds);
}

function formatTime(t) {
  const hrs = 0|t;
  const mins = Math.round((t-hrs)*60);
  return (" "+hrs).substr(-2)+":"+("0"+mins).substr(-2);
}

function showMainMenu() {
  let menu = {"": {"title": "Quiet Mode"}};
  // "Current Mode""Silent" won't fit on Bangle.js 2
  menu["Current" + ((process.env.HWVERSION===2)?"":" Mode")]= {
    value: (require("Storage").readJSON("setting.json", 1) || {}).quiet|0,
    format: v => modeNames[v],
    onchange: function(v) {
      if (v<0) {v = 2;}
      if (v>2) {v = 0;}
      require("qmsched").setMode(v);
      this.value = v;
    },
  };
  scheds.sort((a, b) => (a.hr-b.hr));
  scheds.forEach((sched, idx) => {
    const name = modeNames[sched.mode];
    const txt = formatTime(sched.hr)+" ".repeat(14-name.length)+name;
    menu[txt] = function() {
      showEditMenu(idx);
    };
  });
  menu["Add Schedule"] = () => showEditMenu(-1);
  menu["< Back"] = () => {load();};
  return E.showMenu(menu);
}

function showEditMenu(index) {
  const isNew = index<0;
  let hrs = 12, mins = 0;
  let mode = 1;
  if (!isNew) {
    const s = scheds[index];
    hrs = 0|s.hr;
    mins = Math.round((s.hr-hrs)*60);
    mode = s.mode;
  }
  const menu = {
    "": {"title": (isNew ? "Add" : "Edit")+" Schedule"},
    "Hours": {
      value: hrs,
      onchange: function(v) {
        if (v<0) {v = 23;}
        if (v>23) {v = 0;}
        hrs = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    "Minutes": {
      value: mins,
      onchange: function(v) {
        if (v<0) {v = 59;}
        if (v>59) {v = 0;}
        mins = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    "Switch to": {
      value: mode,
      format: v => modeNames[v],
      onchange: function(v) {
        if (v<0) {v = 2;}
        if (v>2) {v = 0;}
        mode = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
  };
  function getSched() {
    return {
      hr: hrs+(mins/60),
      mode: mode,
    };
  }
  menu["> Save"] = function() {
    if (isNew) {
      scheds.push(getSched());
    } else {
      scheds[index] = getSched();
    }
    require("Storage").writeJSON("qmsched.json", scheds);
    showMainMenu();
  };
  if (!isNew) {
    menu["> Delete"] = function() {
      scheds.splice(index, 1);
      require("Storage").writeJSON("qmsched.json", scheds);
      showMainMenu();
    };
  }
  menu["< Cancel"] = showMainMenu;
  return E.showMenu(menu);
}

showMainMenu();
