(function(back, faceEdit, helpShown) {
  // Shared library for face drawing and settings loading.
  let lib = require('tinyheads.lib.js');

  let paletteCanvas;
  let featureColour = 'faceColour';
  let colourSelectTimeout;

  let scale = 6; // Smaller scale than on the clock itself, so that selection arrows can be shown down the sides

  // 27 colours
  let colours = [
    '#000', '#008', '#00f',
    '#800', '#808', '#80f',
    '#080', '#088', '#08f',
    '#880', '#888', '#88f',
    '#0f0', '#0f8', '#0ff',
    '#8f0', '#8f8', '#8ff',
    '#f00', '#f08', '#f0f',
    '#001', '#001', '#001',
    '#f80', '#f88', '#f8f',
    '#001', '#001', '#001',
    '#ff0', '#ff8', '#fff',
    '#001', '#001', '#001'
  ];

  let colorW = 6;
  let colorScale = Math.floor(176/colorW);

  function writeSettings() {
    require('Storage').writeJSON(lib.settingsFile, lib.settings);
  }

  function setSetting(key,value) {
    lib.settings[key] = value;
    writeSettings();
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
    return stringItems(name,lib.settings[name], values, labels);
  }

  // Colour selection mode
  function colourSelect(index) {
    Bangle.setUI({
      mode: "custom",
      touch: colourTouchHandler,
      btn: () => { // On button press write colour settings and return to feature selection
        colourSelectTimeout = null;
        writeSettings();
        featureSelect();
      }
    });

    // Create a canvas for the palette and set each pixel
    if (paletteCanvas === undefined) {
      paletteCanvas = Graphics.createArrayBuffer(colorW, colorW, 8, {msb:true});
      paletteCanvas.setBgColor(0, 0, 0);
      paletteCanvas.clear();


      for (let i=0; i<(colorW*colorW); i++) {
        let x = (i % colorW);
        let y = Math.floor(i / colorW);

        paletteCanvas.setPixel(x, y, colours[i]);
      }
    }

    // Scale the canvas to full screen size
    g.setBgColor(0, 0, 0);
    g.clear();
    g.drawImage(paletteCanvas, 0, 0, {scale: colorScale});
    g.setColor(1, 1, 1);
    g.setFontAlign(0, 0);
    g.setFont("6x8:2");
    let c = featureColour.split('Colour')[0];
    g.drawString(c[0].toUpperCase() + c.slice(1), 132, 132);

    if (index !== undefined) { // If a colour has been selected draw it in a larger box
      let x = (index % colorW) * colorScale;
      let y = Math.floor((index / colorW)) * colorScale;
      g.setColor(0, 0, 0);
      g.fillRect(x-(colorScale/2), y-(colorScale/2), x+(colorScale/2)+colorScale, y+(colorScale/2)+colorScale);
      g.setColor(colours[index]);
      g.fillRect(x-(colorScale/2)-2, y-(colorScale/2)-2, x+(colorScale/2)+colorScale-2, y+(colorScale/2)+colorScale-2);
    }
  }

  // Feature selection mode
  function featureSelect() {
    E.showMenu(); // Remove previous menu
    Bangle.setUI({
      mode: "custom",
      touch: featureTouchHandler,
      btn: () => { // On button press write settings and return to the main menu
        writeSettings();
        require("widget_utils").show();
        E.showMenu(mainMenu);
      }
    });

    lib.drawFace(scale);

    // Arrows
    for (let i=0; i<4; i++) {
      g.setColor(0, 0, 0);
      g.fillPolyAA([0, 22+(i*44), 34, 5+(i*44), 34, 39+(i*44)]);
      g.fillPolyAA([175, 22+(i*44), 141, 5+(i*44), 141, 39+(i*44)]);
      g.setColor(1, 1, 0);
      g.fillPolyAA([5, 22+(i*44), 31, 10+(i*44), 31, 34+(i*44)]);
      g.fillPolyAA([170, 22+(i*44), 144, 10+(i*44), 144, 34+(i*44)]);
    }

  }

  // Cycle between features
  function modifyFeature(feature, inc, max) {
    lib.settings[feature] += inc;
    if (lib.settings[feature] < 0) {
      lib.settings[feature] = max - 1;
    } else if (lib.settings[feature] >= max) {
      lib.settings[feature] = 0;
    }
  }

  let featureTouchHandler = (button, xy) => {
    let inc = 0;
    // Left size decrements feature, right side increments
    if (xy.x < 45) {
      inc = -1;
    }
    if (xy.x > 130) {
      inc = 1;
    }

    // Center selects feature for colour changing
    if (xy.x>44 && xy.x<132) {
      let yOffset = (g.getHeight() - (lib.faceH * scale)) / 2;
      let featureHeight = (lib.faceH * scale) / 4; // All features are considered to be of equal heights when selecting
      if (xy.y > yOffset && xy.y < yOffset + (lib.faceH * scale)) {
        if (xy.type == 0) { // Short press, select feature
          if (xy.y < yOffset + featureHeight) {
            featureColour = 'hairColour';
          } else if (xy.y < yOffset + featureHeight*2) {
            featureColour = 'eyesColour';
          } else if (xy.y < yOffset + featureHeight*3) {
            featureColour = 'noseColour';
          } else {
            featureColour = 'mouthColour';
          }
        } else { // Long press, select skin
          featureColour = 'faceColour';
        }
        // Show colour palette
        colourSelect();
      }
    } else { // Which arrow was pressed
      if (xy.y < 44) {
        modifyFeature('hairNum', inc, lib.maxHair);
      } else if (xy.y < 88) {
        modifyFeature('eyesNum', inc, lib.maxEyes);
      } else if (xy.y < 132) {
        modifyFeature('noseNum', inc, lib.maxNose);
      } else {
        modifyFeature('mouthNum', inc, lib.maxMouth);
      }
      if (inc !== 0) { // Redraw if feature has been altered
        featureSelect();
      }
    }
  };

  let colourTouchHandler = (button, xy) => {
    let index = Math.floor(xy.x / colorScale) + (Math.floor(xy.y / colorScale) * colorW);
    if (colours[index] !== '#001') {
      lib.settings[featureColour] = colours[index];
      // Redraw the palette with the chosen colour enlarged for a few ms
      colourSelect(index);
      if (colourSelectTimeout) clearTimeout(colourSelectTimeout);
      colourSelectTimeout = setTimeout(function() {
        colourSelectTimeout = undefined;
        // If colour choice not quickly changed, save settings and return to feature selection
        writeSettings();
        featureSelect();
      }, 700);
    }
  };

  function editFace() {
    require("widget_utils").hide();
    if (! helpShown) { // Don't show the help text every time
      E.showPrompt('Editing a face -\nUse arrows to cycle through facial features.', {buttons : {"Ok":true}}).then(function(v) {
        E.showPrompt('Tap feature to change colour, long press the face to change skin colour.', {buttons : {"Ok":true}}).then(function(v) {
          helpShown = true;
          featureSelect();
        });
      });
    } else {
      featureSelect();
    }
  }

  let mainMenu = {
    '' : {
      'title' : 'Tinyheads',
      back: () => {
        back();
      },
    },
    'Face': () => {
      editFace();
    },
    'Analog Clock': stringInSettings('analogClock', ['off', 'on', 'unlock'], ['Off', 'On', 'Unlocked']),
    'Analog Colour': stringInSettings('analogColour', ['#000', '#fff', '#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'], ['Black', 'White', 'Red', 'Green', 'Blue', 'Yellow', 'Cyan', 'Magenta']),
    'Digital Clock': stringInSettings('digitalClock', ['off', 'on', 'unlock'], ['Off', 'On', 'Unlocked']),
    'Digital Position': stringInSettings('digitalPosition', ['bottom', 'top'], ['Bottom', 'Top']),
    'Show Widgets': stringInSettings('showWidgets', ['off', 'on', 'unlock'], ['Off', 'On', 'Unlocked']),
    'BT Status Eyes': {
      value: !!lib.settings.btStatusEyes,
      onchange: v => {
        setSetting('btStatusEyes', v);
      }
    }
  };

  if (faceEdit) { // faceEdit passed from main clock so we're taken directly to the feature selection
    E.showMenu();
    editFace();
  } else { // Otherwise if entered from settings display main menu
    E.showMenu(mainMenu);
  }
})
