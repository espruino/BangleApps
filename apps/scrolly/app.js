Bangle.loadWidgets();

Graphics.prototype.setFontDoto = function(scale) {
  // Actual height 40 (39 - 0)
  // 1 BPP
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    32,
    atob("GAwQFBQUFAwQEBQUEBQQFBQUFBQUFBQUFBQQEBQUFBQUFBQUFBQUFBQQFBQUFBQUFBQUFBQUFBQUFBQQFBAUFBAUFBQUFBQUFBAUFBAUFBQUFBQUFBQUFBQUFBQMFBQAFgsQACcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADBQUExQGFBAUFBgXABQUEBYNDBAUFAwQCxQYHBwdFBQUFBQUFBQUFBQUFBAQEBAUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEBAQEBQUFBQUFBQUFBQUFBQUFBQ="),
    40+(scale<<8)+(1<<16)
  );
};

// Load settings
const SETTINGS = 'scrolly.json';
let settings = Object.assign({
  maxBright: true,
  doNotDim: true,
  speed: 50,
  rotate: 0,
  countdown: true,
  lastText: '',
  rememberText: true
}, require('Storage').readJSON(SETTINGS, true) || {});

let x;
let scrollInterval, countdownInterval;
let countdownNum;
let text = settings.lastText;
let originalOptions = Bangle.getOptions();
let brightness = require('Storage').readJSON('setting.json').brightness;

// Main interface
var Layout = require("Layout");
var layout = new Layout( {
  type: 'v', c: [
    { // Text area
      type: 'txt',
      font: '6x8:2',
      label: text ? text : 'Enter text...', // Show prompt if text not set
      col: text ? g.theme.fg2 : '#555', // Grey text if prompt shown
      id: 'text',
      wrap: true,
      height: Bangle.appRect.h - 52, // Icons are 32px, padding 10px top and bottom
      width: g.getWidth(),
      valign:0,
      cb: l=> editText() // Tapping the text area triggers the same editor as the pen icon
    },
    {
      type: 'h', c: [
        { // Edit icon
          type: 'img',
          pad: 10,
          src: require("heatshrink").decompress(atob("kEg4kA///6f8gH41VStP6gGYBYPv2dV1uyykkvOe+/LrVNteW2sA3Bc4hnM4APM5mY5geM51m3ogL5mGs1r7geK48bswgL5lxiO2EAJBIDwMRiIgC3ggHDwURilGs25B4weDiNCkgPIDwkikV7xgeLkUvrpPGDw311guFDw9aD0sMyIeMB4O2DxgPCsIeLgHNW4MSDxUA5IPBsgeKgHOB4Nmp4eJgHLB4W/DxMM522s279PDDxEM7HuxPc5kwB5Pd5nMFhAPDDZQAyA=")),
          cb: l=> editText()
        },
        { // Settings icon
          type: 'img',
          pad: 10,
          src: require("heatshrink").decompress(atob("kEg4UA///6ec1VSqOMEzUVqoHFqoHUisBA4NAiglDr/1qtUCofq1YZDqte1Wq2oZBDoNaA4OlA4dqA4OpqtQA4Pq1EqEANAF4Oq0EK1QvCguqwEC1VQA4wPKD4IPFF4InBF4MAH4xHCvQHB1oHDL4ofBq4HB6pvDqt//p/DisFR4QHCV64HJiolEAAw=")), 
          cb: l=> showSettings()
        },
        { // Scroll icon
          type: 'img',
          pad: 10,
          src: require("heatshrink").decompress(atob("kEg4UB8EH/4AC+mnqoAQqAgBA4goCgoGCqgxDA4VAA4cVCwgYEA4kBDwogCGoMD+AHFgWsFAYHC1XAA4Q2BA4OwA42oA4wYCgoHEDAIHNC42rMAQHD0AvGI4ZPCCwQHDgYWCM4J3HA4qHBS5CnHYwTIFDwoQECwTJDAwoAFA")),
          id: 'scrollBtn', 
          cb: l=>{
            if (text) {
              scrollText();
            } else {
              E.showAlert('No text to scroll').then(() => {
                layout.setUI();
                layout.render();
              });
            }
          }
        },
      ]
    }
  ]
}, {back: load});

// Display scrolling text
function scrollText() {
  require("widget_utils").hide();

  Bangle.setUI({
    mode:"custom",
    btn: () => { // Button returns to main interface
      if (scrollInterval) // Stop scroll
        clearInterval(scrollInterval);
      if (countdownInterval) // Stop countdown
        clearInterval(countdownInterval);

      // Reset screen to original settings
      g.setRotation(0);
      Bangle.setOptions(originalOptions);
      Bangle.setLCDBrightness(brightness);

      // Draw the main interface
      require("widget_utils").show();
      g.clearRect(Bangle.appRect);
      layout.setUI();
      layout.render();
    }
  });

  // Setup screen
  if (settings.doNotDim) { // Don't lock or turn off the backlight while scrolling
    Bangle.setOptions({backlightTimeout: 0, lockTimeout: 0});
    Bangle.setBacklight(1);
  } else { // For some reason the screen locking resets the font style and alignment, so don't allow this to happen while scrolling
    Bangle.setOptions({lockTimeout: 0});
  }
  if (settings.maxBright) {
    Bangle.setLCDBrightness(1);
  }
  g.setRotation(settings.rotate);

  g.setFontDoto(4);
  g.setColor(g.theme.fg);
  g.setBgColor(g.theme.bg);

  if (settings.countdown) { // Display a countdown timer before scrolling
    g.setFontAlign(0, 0);
    countdownNum = 3;
    countdown();
    countdownInterval = setInterval(() => {
      if (countdownNum == 0) {
        clearInterval(countdownInterval);
        startScrolling();
      } else {
        countdown();
      }
    }, 1000);
  } else { // No countdown, so just scroll
    startScrolling();
  }
}

// Start the scroll animation
function startScrolling() {
  g.clear();
  g.setFontAlign(-1, 0); // Vertical align text

  x=g.getWidth(); // Start the text just off screen

  scrollInterval = setInterval(() => {
    g.clear();
    g.drawString(text, x, g.getHeight()/2);
    x=x-10;
    if (x<-g.stringWidth(text)) { // Loop the text
      x=g.getWidth();
    }
  }, settings.speed);
}

// Show countdown timer
function countdown() {
    g.clear();
    g.drawString(countdownNum, g.getWidth()/2, g.getHeight()/2);
    countdownNum--;
}

// Load keyboard and set text
function editText() {
  try {
    require("textinput").input({text:text}).then(result => {
      text = result;
      if (settings.rememberText) {
        setSetting('lastText', text);
      }
      layout.text.label = text ? text : 'Enter text...'; // Show prompt if text not set
      layout.text.col = text ? g.theme.fg2 : '#555'; // Grey text if prompt shown
      layout.setUI();
      layout.render();
      Bangle.drawWidgets();
    });
  } catch (error) {
    E.showAlert('Please install a keyboard app').then(() => {
      layout.setUI();
      layout.render();
    });
  }
}

// Save setting key
function setSetting(key,value) {
  settings[key] = value;
  require('Storage').writeJSON(SETTINGS, settings);
}

// Helper method which uses int-based menu item for set of string values and their labels
function stringItems(key, startvalue, values, labels) {
  return {
    value: (startvalue === undefined ? 0 : values.indexOf(startvalue)),
    format: v => labels[v],
    min: 0,
    max: values.length - 1,
    wrap: true,
    step: 1,
    onchange: v => {
      setSetting(key,values[v]);
    }
  };
}

// Helper method which breaks string set settings down to local settings object
function stringInSettings(name, values, labels) {
  return stringItems(name,settings[name], values, labels);
}

// Settings menu
function showSettings() {
  E.showMenu({
    '' : { 'title' : 'Settings' },
    '< Back' : () => {
      g.clearRect(Bangle.appRect);
      layout.setUI();
      layout.render();
    },
    'Rotate': stringInSettings('rotate', [0, 1, 2, 3], [0, 90, 180, 270]),
    'Speed': stringInSettings('speed', [10, 50, 80], ['Fast', 'Medium', 'Slow']),
    'Max bright': {
      value: !!settings.maxBright,
      onchange: v => {
        setSetting('maxBright', v);
      },
    },
    "Don't dim": {
      value: !!settings.doNotDim,
      onchange: v => {
        setSetting('doNotDim', v);
      },
    },
    'Countdown': {
      value: !!settings.countdown,
      onchange: v => {
        setSetting('countdown', v);
      },
    },
    'Remember text': {
      value: !!settings.rememberText,
      onchange: v => {
        setSetting('rememberText', v);
        if (v) {
          setSetting('lastText', text);
        } else {
          setSetting('lastText', '');
        }
      },
    }
  });
}

// Initial layout render
g.clear();
Bangle.drawWidgets();
layout.render();


