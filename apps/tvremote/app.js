/******************************************************************
* Creator Guptilious (https://github.com/Guptilious)
* Future Features:
*  Samsung TV Support
*  customiser page so config can be created prior to install.
*  
*****************************************************************/

require("Font7x11Numeric7Seg").add(Graphics);

let deviceFileName = "tvdevicelist.json";
let serverDataFile = "tvremote.settings.json";
let serverData = require("Storage").readJSON(serverDataFile, true);
let devicefile = require("Storage").readJSON(deviceFileName, true);

//console.log(require("Storage").list());
//console.log(devicefile);


let serverDns = "webServerDns" in serverData ? serverData.webServerDns : 'undefined';

let serverPort = "port" in serverData ? serverData.port : 'undefined';
let tvIp = "tvIp" in serverData ? serverData.tvIp : 'undefined';
let username = "username" in serverData ? serverData.username : 'undefined';
let password = "password" in serverData ? serverData.password : 'undefined';

let panaIp = tvIp;
//"tvIp" in serverData ? serverData.tvIp : 'undefined';
let settingsPort = "port" in serverData ? serverData.port : 'undefined';

let counter;
let IPASSIGN;
let samsIp;
let countdownTimer = null;
let currNumber = null;
let selected = "NONE";
let currentScreen = "power";
let font = 'Vector';
let RESULT_HEIGHT = 24;
let RIGHT_MARGIN = 15;
let midpoint = (g.getWidth() / 2);
let IP_AREA = [0, RESULT_HEIGHT, g.getWidth(), g.getHeight()]; // values used for key buttons
let KEY_AREA = [0, 24, g.getWidth(), g.getHeight()];
let COLORS = {
  DEFAULT: ['#FF0000'],
  BLACK: ['#000000'],
  WHITE: ['#FFFFFF'],
  GREY: ['#808080', '#222222']
}; // background

let sourceApps = {
  "selection": {
    '!': {
      grid: [0, 1],
      globalGrid: [0, 0],
      key: 'down'
    },
    '^': {
      grid: [0, 0],
      globalGrid: [0, 0],
      key: 'up'
    },
    '<': {
      grid: [1, 0],
      globalGrid: [1, 0],
      key: 'left'
    },
    '>': {
      grid: [1, 1],
      globalGrid: [1, 0],
      key: 'right'
    }
  },
  "volume": {
    'Vol Up': {
      grid: [0, 0],
      globalGrid: [0, 0],
      key: 'volume_up'
    },
    'Vol Dwn': {
      grid: [0, 1],
      globalGrid: [1, 0],
      key: 'volume_down'
    },
    'Mute': {
      grid: [1, 0],
      globalGrid: [2, 0],
      key: 'mute'
    },
    'Options': {
      grid: [1, 1],
      globalGrid: [2, 0],
      key: 'option'
    }
  },
  "numbers": {
    '<': {
      grid: [0, 3],
      globalGrid: [1, 4]
    },
    '0': {
      grid: [1, 3],
      globalGrid: [1, 4]
    },
    'ok': {
      grid: [2, 3],
      globalGrid: [2, 4]
    },
    '1': {
      grid: [0, 2],
      globalGrid: [0, 3]
    },
    '2': {
      grid: [1, 2],
      globalGrid: [1, 3]
    },
    '3': {
      grid: [2, 2],
      globalGrid: [2, 3]
    },
    '4': {
      grid: [0, 1],
      globalGrid: [0, 2]
    },
    '5': {
      grid: [1, 1],
      globalGrid: [1, 2]
    },
    '6': {
      grid: [2, 1],
      globalGrid: [2, 2]
    },
    '7': {
      grid: [0, 0],
      globalGrid: [0, 1]
    },
    '8': {
      grid: [1, 0],
      globalGrid: [1, 1]
    },
    '9': {
      grid: [2, 0],
      globalGrid: [2, 1]
    }
  },
  "apps": [{
      "name": "Disney +",
      "key": "disney"
    },
    {
      "name": "Netflix",
      "key": "netflix"
    },
    {
      "name": "Amazon Prime",
      "key": "prime"
    },
    {
      "name": "Youtube",
      "key": "youtube"
    },
    {
      "name": "Home",
      "key": "home"
    },
    {
      "name": "TV",
      "key": "tv"
    },
    {
      "name": "HDMI1",
      "key": "hdmi1"
    },
    {
      "name": "HDMI2",
      "key": "hdmi2"
    },
    {
      "name": "HDMI3",
      "key": "hdmi3"
    },
    {
      "name": "HDMI4",
      "key": "hdmi4"
    }
  ]
};
let numbersGrid = [3, 4];
let selectionGrid = [2, 2];
let volumeGrid = [2, 2];
let appData = sourceApps.apps;
let volume = sourceApps.volume;
let selection = sourceApps.selection;
let numbers = sourceApps.numbers;

function assignScreen(screen) {
  currentScreen = screen;
  console.log(currentScreen);
}

function sendPost(keyPress) {
  serverPort = settingsPort;
  tvIp = panaIp;
  let credentials = btoa(`${username}:${password}`);
  let serverUrl = `https://${serverDns}:${serverPort}`;

  let keyJson = {
    "command": keyPress,
    "tvip": tvIp,
  };

  Bangle.http(
      serverUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify(keyJson)
      })
    .then(response => {
      console.log("Response received:", response);
    }).catch(error => {
      console.error("Error sending data:", error);
    });
}

function receiveDevices() {
  let serverPort = settingsPort;
  let credentials = btoa(`${username}:${password}`);
  let serverUrl = `https://${serverDns}:${serverPort}/ssdp-devices.json`;
  return Bangle.http(
    serverUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`
      },
    }).then(data => {
    require("Storage").write(deviceFileName, data);
    devicefile = require("Storage").readJSON(deviceFileName, true);
  });
}

function prepareScreen(screen, grid, defaultColor, area) { // grid, [3, 4], colour, grid area size
  for (let k in screen) {
    if (screen.hasOwnProperty(k)) {
      screen[k].color = screen[k].color || defaultColor;
      let position = [];
      let xGrid = (area[2] - area[0]) / grid[0];
      let yGrid = (area[3] - area[1]) / grid[1];

      //console.log(xGrid + " " + yGrid);
      position[0] = area[0] + xGrid * screen[k].grid[0];
      position[1] = area[1] + yGrid * screen[k].grid[1];

      position[2] = position[0] + xGrid - 1;
      position[3] = position[1] + yGrid - 1;

      screen[k].xy = position;
      //console.log("prepared " + screen+"\n");
    }
  }
  Bangle.setUI({
    mode: "custom",
    back: function() {
      appMenu();
    }
  });
}

function drawKey(name, k, selected) { // number, number data, NONE
  g.setColor(COLORS.DEFAULT[0]); // set color for rectangles
  g.setFont('Vector', 20).setFontAlign(0, 0);
  g.fillRect(k.xy[0], k.xy[1], k.xy[2], k.xy[3]); // create rectangles based on letters xy areas

  g.setColor(COLORS.BLACK[0]).drawRect(k.xy[0], k.xy[1], k.xy[2], k.xy[3]);

  g.setColor(COLORS.WHITE[0]); // color for numbers
  g.drawString(name, (k.xy[0] + k.xy[2]) / 2, (k.xy[1] + k.xy[3]) / 2); // center the keys to the rectangle that is drawn
}

function drawKeys(area, buttons) {
  g.setColor(COLORS.DEFAULT[0]); // background colour
  g.fillRect(area[0], area[1], area[2], area[3]); // number grid area
  for (let k in buttons) {
    if (buttons.hasOwnProperty(k)) {
      drawKey(k, buttons[k], k == selected);
    }
  }
}

function displayOutput(num, screenValue) { // top block
  num = num.toString();
  g.setFont('Vector', 18); //'7x11Numeric7Seg'
  g.setFontAlign(1, 0);
  g.setBgColor(0).clearRect(0, 0, g.getWidth(), RESULT_HEIGHT - 1);
  g.setColor(-1); // value

  g.drawString(num, g.getWidth() - RIGHT_MARGIN, RESULT_HEIGHT / 2);
}

function buttonPress(val, screenValue) {

  if (screenValue === "ip") {
    if (val === "<") currNumber = currNumber.slice(0, -1);
    else if (val === ".") currNumber = currNumber + ".";
    else currNumber = currNumber == null ? val : currNumber + val; // currNumber is null if no value pressed

    let ipcount = (currNumber.match(/\./g) || []).length;
    if (ipcount > 3 || currNumber.length > 15) currNumber = currNumber.slice(0, -1);

    displayOutput(currNumber, screenValue);
  }

  let checkValue = appData.some(app => app.name === screenValue); // check app data

  if (checkValue) sendPost(val); // app values

  if (screenValue === "numbers") {
    if (val === '<') sendPost('back');
    else if (val === 'ok') sendPost('enter');
    else sendPost("num_" + val);
  } else if (screenValue === "selection") sendPost(selection[val].key);
  else if (screenValue === "volume") sendPost(volume[val].key);
}

const powerScreen = () => {
  currentScreen = "power";
  g.setColor(COLORS.GREY[0]).fillRect(0, 24, g.getWidth(), g.getWidth()); // outer circ
  g.setColor(COLORS.WHITE[0]).fillCircle(midpoint, 76 + 24, 50); // inner circ
  g.setColor(COLORS.BLACK[0]).setFont('Vector', 25).setFontAlign(0, 0).drawString("On/Off", 88, 76 + 24); // circ text

  Bangle.setUI({
    mode: "custom",
    back: function() {
      mainMenu();
    }
  });
};

const appMenu = () => {

  assignScreen("apps");
  E.showScroller({
    h: 54,
    c: appData.length,
    draw: (i, r) => {
      let sourceOption = appData[i];
      g.setColor(COLORS.DEFAULT[0]).fillRect((r.x), (r.y), (r.x + r.w), (r.y + r.h));
      g.setColor(COLORS.BLACK[0]).drawRect((r.x), (r.y), (r.x + r.w), (r.y + r.h));
      g.setColor(COLORS.WHITE[0]).setFont(font, 20).setFontAlign(-1, 1).drawString(sourceOption.name, 15, r.y + 32);
    },

    select: i => {
      let sourceOption = appData[i];
      let appPressed = sourceOption.name;
      let appKey = sourceOption.key;
      buttonPress(appKey, appPressed);
    },

    back: main => {
      E.showScroller();
      powerScreen();
    },
  });
  g.flip(); // force a render before widgets have finished drawing
};

function ipScreen() {
  //require("widget_utils").hide();
  assignScreen("ip");
  currNumber = "";
  prepareScreen(numbers, numbersGrid, COLORS.DEFAULT, IP_AREA);
  drawKeys(IP_AREA, numbers);
  displayOutput(0);
}

let tvSelector = {
  "": {
    title: "TV Selector",
    back: function() {
      load(); //E.showMenu(tvSelector);
    }
  },
  "Panasonic": function() {
    assignScreen("power");
    powerScreen();
  },
  "Samsung": function() {
    assignScreen("power");
    powerScreen();
  },
  "Settings": function() {
    subMenu();
  }
};

function mainMenu() {
  assignScreen("mainmenu");
  E.showMenu(tvSelector);
}

function clearCountdown() {
  if (countdownTimer) {
    clearTimeout(countdownTimer);
    countdownTimer = null;
  }
}

function countDown(callback) {
  require("widget_utils").show();
  if (counter === 0) {
    callback(); // Call the callback function when countdown reaches 0
    return;
  }
  E.showMessage(`Searching for devices...\n${counter}`, "Device Search");
  counter--;
  countdownTimer = setTimeout(() => countDown(callback), 1000);
}

function clearDisplayOutput() {
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}

function subMenu() {

  if (typeof IPASSIGN !== 'undefined' && currNumber !== "") {
    if (IPASSIGN === "pana") {
      console.log("current numeber = " + currNumber);
      panaIp = currNumber;
      console.log("pana ip " + panaIp);
      console.log("default ip " + serverData.tvIp);
      serverData.tvIp = panaIp;
      require("Storage").write(serverDataFile, serverData);
      console.log("tv ip is now " + serverData.tvIp);

    } else if (IPASSIGN === "sams") {
      samsIp = currNumber;

    } else if (IPASSIGN === "port") {
      settingsPort = currNumber;
      console.log("setting port " + settingsPort);
      console.log("server port " + serverData.port);
      serverData.port = settingsPort;
      require("Storage").write(serverDataFile, serverData);
      console.log("port is now " + serverData.port);
    }
  }

  require("widget_utils").show();
  assignScreen("settingssub");
  clearDisplayOutput();

  let settingssub = {
    "": {
      title: "Settings",
      back: function() {
        E.showMenu(tvSelector);
        clearCountdown();
      }
    },
  };

  if (typeof settingsPort !== 'undefined' && settingsPort !== 'undefined') {
    let portHeader = `Port: ${settingsPort}`;
    settingssub[portHeader] = function() {
      IPASSIGN = "port";
      ipScreen();
    };
  } else {
    settingssub["Set DNS Port"] = function() {
      IPASSIGN = "port";
      ipScreen();
    };
  }

  if (typeof panaIp !== 'undefined' && panaIp !== 'undefined') {
    let panaheader = `Pana IP: ${panaIp}`;
    settingssub[panaheader] = function() {
      IPASSIGN = "pana";
      E.showMenu(deviceSelect);
      devicefile = require("Storage").readJSON("tvdevicelist.json", true);
      console.log(devicefile);
    };
  } else {
    settingssub["Set Pana IP"] = function() {
      IPASSIGN = "pana";
      ipScreen();
    };
  }

  if (typeof samsIp !== 'undefined' && panaIp !== 'undefined') {
    let samsheader = `Sams IP: ${samsIp}`;
    settingssub[samsheader] = function() {
      IPASSIGN = "sams";
      ipScreen();
    };
  } else {
    settingssub["Set Sams IP"] = function() {
      IPASSIGN = "sams";
      ipScreen();
    };
  }

  E.showMenu(settingssub);
}

const deviceMenu = () => {
  let parsedResp = JSON.parse(devicefile.resp);
  E.showScroller({
    h: 54,
    c: parsedResp.length,
    draw: (i, r) => {
      let sourceOption = parsedResp[i];
      g.setColor(COLORS.DEFAULT[0]).fillRect((r.x), (r.y), (r.x + r.w), (r.y + r.h));
      g.setColor(COLORS.BLACK[0]).drawRect((r.x), (r.y), (r.x + r.w), (r.y + r.h));
      g.setColor(COLORS.WHITE[0]).setFont(font, 15).setFontAlign(-1, 1).drawString(sourceOption.name, 15, r.y + 32);
    },

    select: i => {
      let sourceOption = parsedResp[i];
      //let devicePressed = sourceOption.name;
      let deviceIp = sourceOption.ip;

      assignScreen("deviceSearch");
      serverData.tvIp = deviceIp.replace('http://', '');
      currNumber = serverData.tvIp;
      require("Storage").write(serverDataFile, serverData);
      console.log("tv ip is now " + serverData.tvIp);
      subMenu();
    },

    back: main => {
      E.showScroller();
      E.showMenu(deviceSelect);
    },
  });
  g.flip(); // force a render before widgets have finished drawing
};


let deviceSelect = {
  "": {
    title: "Device Select",
    back: function() {
      subMenu();
    }
  },
  "Manual IP Assign": function() {
    ipScreen();
  },
  "Device Select": function() {
    receiveDevices();
    counter = 5;
    countDown(deviceMenu);
  }
};


function swipeHandler(LR, UD) {
  if (LR == -1) { // swipe left
    if (currentScreen === "power") {
      assignScreen("apps");
      appMenu();

    } else if (currentScreen === "apps") {
      //require("widget_utils").hide();
      assignScreen("selection");
      E.showScroller();
      prepareScreen(selection, selectionGrid, COLORS.DEFAULT, KEY_AREA);
      drawKeys(KEY_AREA, selection);

    } else if (currentScreen === "volume") {
      sendPost("fast_forward");

    } else if (currentScreen === "selection") {
      sendPost("enter");
    }
  }
  if (LR == 1) { // swipe right
    if (currentScreen === "apps") {
      assignScreen("power");
      E.showScroller();
      powerScreen();
    } else if (currentScreen === "volume") {
      sendPost("rewind");
    } else if (currentScreen === "selection") {
      sendPost("back");
    }
  }
  if (UD == -1) { // swipe up
    if (currentScreen === "selection") {
      assignScreen("volume");
      prepareScreen(volume, volumeGrid, COLORS.DEFAULT, KEY_AREA);
      drawKeys(KEY_AREA, volume);
    } else if (currentScreen === "volume") {
      sendPost("enter");
    } else if (currentScreen === "ip") {
      buttonPress(".", "ip");
    } else if (currentScreen == "numbers") {
      assignScreen("selection");
      prepareScreen(selection, selectionGrid, COLORS.DEFAULT, KEY_AREA);
      drawKeys(KEY_AREA, selection);
    }
  }
  if (UD == 1) { // swipe down
    if (currentScreen === "volume") {
      assignScreen("selection");
      prepareScreen(selection, selectionGrid, COLORS.DEFAULT, KEY_AREA);
      drawKeys(KEY_AREA, selection);
    } else if (currentScreen === "selection") {
      assignScreen("numbers");
      prepareScreen(numbers, numbersGrid, COLORS.DEFAULT, KEY_AREA);
      drawKeys(KEY_AREA, numbers);
    }
  }
}
Bangle.on('swipe', swipeHandler);


function touchHandler(button, e) {
  const screenActions = {
    ip: () => checkButtons(numbers),
    volume: () => checkButtons(volume),
    numbers: () => checkButtons(numbers),
    selection: () => checkButtons(selection),
    power: () => {
      if (Math.pow(e.x - 88, 2) + Math.pow(e.y - 88, 2) < 2500) {
        sendPost("power");
      }
    }
  };

  function checkButtons(buttonMap) {
    for (let key in buttonMap) {
      if (typeof buttonMap[key] === "undefined") continue;
      let r = buttonMap[key].xy;

      if (e.x >= r[0] && e.y >= r[1] && e.x < r[2] && e.y < r[3]) {
        if (currentScreen === "ip" && key === "ok") {
          subMenu();
        } else {
          buttonPress("" + key, currentScreen);
        }
      }
    }
  }

  if (currentScreen in screenActions) screenActions[currentScreen]();
}
Bangle.on('touch', touchHandler);

Bangle.loadWidgets();
Bangle.drawWidgets();

if (serverData === undefined) {
  E.showAlert(`No settings.\nSee READ.me`, "Config Error").then(function() {
    mainMenu();
  });
} else {
  mainMenu();
}
