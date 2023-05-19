// Capital Omega symbol and Resistor icon from icons8
// https://icons8.com/icon/szAc6YFQmlym/capital-omega
// https://icons8.com/icon/ISAVBnskZod0/resistor

let colorData = {
  black: {
    value: 0,
    multiplier: Math.pow(10, 0),
    hex: '#000'
  },
  brown: {
    value: 1,
    multiplier: Math.pow(10, 1),
    tolerance: 1,
    hex: '#8B4513'
  },
  red: {
    value: 2,
    multiplier: Math.pow(10, 2),
    tolerance: 2,
    hex: '#f00'
  },
  orange: {
    value: 3,
    multiplier: Math.pow(10, 3),
    hex: '#FF9900'
  },
  yellow: {
    value: 4,
    multiplier: Math.pow(10, 4),
    hex: '#ff0'
  },
  green: {
    value: 5,
    multiplier: Math.pow(10, 5),
    tolerance: 0.5,
    hex: '#0f0'
  },
  blue: {
    value: 6,
    multiplier: Math.pow(10, 6),
    tolerance: 0.25,
    hex: '#00f'
  },
  violet: {
    value: 7,
    multiplier: Math.pow(10, 7),
    tolerance: 0.1,
    hex: '#f0f'
  },
  grey: {
    value: 8,
    multiplier: Math.pow(10, 8),
    tolerance: 0.05,
    hex: '#808080'
  },
  white: {
    value: 9,
    multiplier: Math.pow(10, 9),
    hex: '#fff'
  },
  gold: {
    multiplier: Math.pow(10, -1),
    tolerance: 5,
    hex: '#FFD700'
  },
  silver: {
    multiplier: Math.pow(10, -2),
    tolerance: 10,
    hex: '#C0C0C0'
  },
  none: {
    tolerance: 20
  },
};

function clearScreen() { // Except Back Button
  g.clearRect(24, 0, 176, 24);
  g.clearRect(0, 24, 176, 176);
}

function colorBandsToResistance(colorBands) {
  let firstBand = colorBands[0];
  let secondBand = colorBands[1];
  let multiplierBand = colorBands[2];
  let toleranceBand = colorBands[3] || 'none'; // Add a default value for toleranceBand
  let significantDigits = colorData[firstBand].value * 10 + colorData[secondBand].value;
  let multiplier = colorData[multiplierBand].multiplier;
  let resistance = significantDigits * multiplier;
  let tolerance = colorData[toleranceBand].tolerance;
  return [resistance, tolerance];
}

function log10(val) {
  return Math.log(val) / Math.log(10);
}

function resistanceToColorBands(resistance, tolerance) {
  let multiplier = Math.floor(log10(resistance));
  let firstDigit = Math.floor(resistance / Math.pow(10, multiplier));
  resistance -= firstDigit * Math.pow(10, multiplier);
  multiplier--; // for the next digit
  let secondDigit = Math.floor(resistance / Math.pow(10, multiplier));
  resistance -= secondDigit * Math.pow(10, multiplier);
  console.log("First Digit: " + firstDigit);
  console.log("Second Digit: " + secondDigit);
  console.log("Multiplier: " + multiplier);
  let firstBandEntry = Object.entries(colorData).find(function(entry) {
    return entry[1].value === firstDigit;
  });
  let firstBand = firstBandEntry ? firstBandEntry[1].hex : undefined;
  let secondBandEntry = Object.entries(colorData).find(function(entry) {
    return entry[1].value === secondDigit;
  });
  let secondBand = secondBandEntry ? secondBandEntry[1].hex : undefined;
  let multiplierBandEntry = Object.entries(colorData).find(function(entry) {
    return entry[1].multiplier === Math.pow(10, multiplier);
  });
  let multiplierBand = multiplierBandEntry ? multiplierBandEntry[1].hex : undefined;
  let toleranceBandEntry = Object.entries(colorData).find(function(entry) {
    return entry[1].tolerance === tolerance;
  });
  let toleranceBand = toleranceBandEntry ? toleranceBandEntry[1].hex : undefined;
  console.log("Color bands: " + [firstBand, secondBand, multiplierBand, toleranceBand]);
  return [firstBand, secondBand, multiplierBand, toleranceBand];
}

function drawResistor(colorBands, tolerance) {
  let img = require("Storage").read("rescalc-resistor.img");
  let resistorBodyWidth = 51;
  let resistorBodyHeight = 43;
  let resistorStartX = 52;
  var bandColors = colorBands;
  var numcolorBands = bandColors.length;
  var resistorStartY = ((g.getHeight() - resistorBodyHeight) / 2) + 48;
  clearScreen();
  g.drawImage(img, 0, 112);
  var bandWidth = (resistorBodyWidth - (numcolorBands * 2 - 1)) / numcolorBands; // width of each band, accounting for the spacing
  var bandHeight = resistorBodyHeight; // height of each band
  var currentX = resistorStartX; // starting point for the first band
  // Define the tolerance values that will trigger the fourth band
  var validTolerances = [1, 2, 0.5, 0.25, 0.1, 0.05, 5, 10];

  for (var i = 0; i < numcolorBands; i++) {
    // Skip the fourth band and its outlines if the tolerance is not in the valid list
    if (i === 3 && !validTolerances.includes(tolerance)) continue;

    var bandX = currentX; // calculate the x-coordinate of the band
    var bandY = resistorStartY; // y-coordinate of the band

    g.setColor(bandColors[i]); // set the color for the band
    g.fillRect(bandX, bandY, bandX + bandWidth, bandY + bandHeight);

    // Draw band outlines
    g.setColor('#000'); // set the color for the outline
    g.drawLine(bandX, bandY, bandX, bandY + bandHeight); // left outline
    g.drawLine(bandX + bandWidth, bandY, bandX + bandWidth, bandY + bandHeight); // right outline

    // if it's the fourth band, shift it over by an additional 12 pixels
    if (i === 2) {
      currentX = bandX + bandWidth + 5 + 12; // update the current X position for the next band, accounting for the spacing
    } else {
      currentX = bandX + bandWidth + 5; // update the current X position for the next band, accounting for the spacing
    }
  }
}

function omega() {
  return require("heatshrink").decompress(atob("mUywISP//AAgUB//+Aon/8AFEBgYFBDId/AoP4AoM//EH/4FBj/wBAIfBh4PBg/8gEDAQIbBFQIoCj4SBBAIPBCoM/wASDh5BCj/AgYqBCQPwgIkCgAiBDwQcCj4eCg/gAIJgC/ABBCQV+AIQrCDDMPP4QDBJQsAJQYDBMYorDDwJdDNoQSCg4eBh4CBSQSPCSQc/HAKuCg5LBv4uCBIIOCUoSnCCQQUCdYTuDbIOAAQUfeIICCboLgCPgIYLNwQAPA="));
}

function formatResistance(resistance) {
  var units = ["", "k", "M", "G"];
  var unitIndex = 0;
  while (resistance >= 1000 && unitIndex < units.length - 1) {
    resistance /= 1000;
    unitIndex++;
  }
  // Convert to string and truncate unnecessary zeroes
  var resistanceStr = String(resistance);
  if (resistanceStr.length > 5) { // if length is more than 5 including decimal point
    resistanceStr = resistance.toFixed(2);
  }
  return {
    value: resistanceStr,
    unit: units[unitIndex]
  };
}

function drawResistance(resistance, tolerance) {
  var x = g.getWidth() / 2;
  var y = 40;
  var formattedResistance = formatResistance(resistance);
  var resistanceStr = formattedResistance.value;
  var unit = formattedResistance.unit;
  g.reset();

  // draw resistance value
  g.setFontAlign(0, 0).setFont("Vector", 54);
  g.clearRect(0, y - 15, g.getWidth(), y + 25); // clear the background
  g.drawString(resistanceStr, x + 4, y);

  // draw unit, symbol and tolerance
  y += 46;
  g.setFontAlign(-1, 0).setFont("Vector", 27);

  var toleranceShift = tolerance.toString().replace('.', '').length > 2 ? 8 : 0;
  var unitX = ((unit === "M" || unit === "G") ? 0 : 8) - toleranceShift;
  var omegaX = (unit ? 46 : 36) - toleranceShift; // Shift the Omega symbol to the left if there is no unit

  g.drawString(unit.padStart(3), unitX, y);

  // Draw the Ohm symbol to the right of the unit
  g.drawImage(omega(), omegaX, y - 13, {
    scale: 0.45
  });

  g.setFontAlign(1, 0).setFont("Vector", 27);

  // Define the tolerance values that will trigger the fourth band
  var validTolerances = [1, 2, 0.5, 0.25, 0.1, 0.05, 5, 10];

  // Check if the tolerance is not in the valid list, and if it's not, set it to 20
  if (!validTolerances.includes(tolerance)) {
    tolerance = 20;
  }

  var toleranceStr = "±" + tolerance + "%";
  var toleranceX = tolerance.toString().replace('.', '').length > 2 ? 10 : 14;
  g.drawString(toleranceStr.padEnd(4), 176 - toleranceX, y);
}

(function() {
  let settings = {
    resistance: 0,
    tolerance: 0,
    colorBands: ["", "", "", ""]
  };

  function resetSettings() {
    let emptySettings = {
      resistance: 0,
      tolerance: 0,
      colorBands: ["", "", "", ""]
    };
    settings = emptySettings;
  }

  function showColorBandMenu(bandNumber) {
    let colorBandMenu = {
      '': {
        'title': `Band ${bandNumber}`
      },
      '< Back': function() {
        E.showMenu(colorEntryMenu);
      },
    };

    // Populate colorBandMenu with colors from colorData
    for (let color in colorData) {
      if (bandNumber === 1 || bandNumber === 2) {
        if (color !== 'none' && color !== 'gold' && color !== 'silver') {
          (function(color) {
            colorBandMenu[color.charAt(0).toUpperCase() + color.slice(1)] = function() {
              setBandColor(bandNumber, color);
            };
          })(color);
        }
      } else if (bandNumber === 3) {
        if (color !== 'none') {
          (function(color) {
            colorBandMenu[color.charAt(0).toUpperCase() + color.slice(1)] = function() {
              setBandColor(bandNumber, color);
            };
          })(color);
        }
      } else if (bandNumber === 4) {
        if (colorData[color].hasOwnProperty('tolerance')) {
          (function(color) {
            colorBandMenu[color.charAt(0).toUpperCase() + color.slice(1)] = function() {
              setBandColor(bandNumber, color);
            };
          })(color);
        }
      }
    }
    return E.showMenu(colorBandMenu);
  }

  function setBandColor(bandNumber, color) {
    settings.colorBands[bandNumber - 1] = color; // arrays are 0-indexed
    console.log(`Band ${bandNumber} color set to ${color}`);

    // Update the color band in the colorEntryMenu
    colorEntryMenu[`${bandNumber}:`].value = color;

    showColorEntryMenu();
  }

  function showColorEntryMenu() {
    colorEntryMenu = {
      '': {
        'title': 'Band Color'
      },
      '< Back': function() {
        clearScreen();
        E.showMenu(mainMenu);
      },
      '1:': {
        value: settings.colorBands[0] || "",
        format: (v) => `${v}`,
        onchange: () => {
          clearScreen();
          setTimeout(() => showColorBandMenu(1), 5);
        }
      },
      '2:': {
        value: settings.colorBands[1] || "",
        format: (v) => `${v}`,
        onchange: () => {
          clearScreen();
          setTimeout(() => showColorBandMenu(2), 5);
        }
      },
      '3:': {
        value: settings.colorBands[2] || "",
        format: (v) => `${v}`,
        onchange: () => {
          clearScreen();
          setTimeout(() => showColorBandMenu(3), 5);
        }
      },
      '4:': {
        value: settings.colorBands[3] || "",
        format: (v) => `${v}`,
        onchange: () => {
          clearScreen();
          setTimeout(() => showColorBandMenu(4), 5);
        }
      },
      'Draw Resistor': function() {
        let colorBands = settings.colorBands;
        let values = colorBandsToResistance(colorBands);
        settings.resistance = values[0];
        settings.tolerance = values[1];
        showDrawingMenu();
      }
    };

    E.showMenu(colorEntryMenu);
  }

  function showMultiplierMenu() {
    let multiplierMenu = {
      '': {
        'title': 'Multiplier'
      },
      '< Back': function() {
        showResistanceEntryMenu();
      }
    };

    // Generate menu items for each Multiplier value in colorData
    for (let color in colorData) {
      if (colorData[color].hasOwnProperty('multiplier')) {
        let multiplierValue = parseFloat(colorData[color].multiplier); // Parse the multiplier as a float
        let formattedMultiplier = formatMultiplier(multiplierValue);
        multiplierMenu[`${formattedMultiplier}`] = () => {
          settings.multiplier = multiplierValue;
          console.log(`Multiplier changed to: ${settings.multiplier}`);
          // Update the value of 'Multiplier' in resistanceEntryMenu
          resistanceEntryMenu["Multiplier"] = function() {
            showMultiplierMenu();
          };
          showResistanceEntryMenu();
        };
      }
    }

    E.showMenu(multiplierMenu);
  }

  // Helper function to format multiplier as exponential notation for values >= 1000
  function formatMultiplier(multiplier) {
    if (multiplier >= 1000) {
      let exponent = Math.log(multiplier) / Math.log(10);
      return `10^${exponent}`;
    } else {
      return multiplier.toString();
    }
  }

  function showToleranceMenu() {
    let toleranceMenu = {
      '': {
        'title': 'Tolerance'
      },
      '< Back': function() {
        showResistanceEntryMenu();
      }
    };

    // Generate menu items for each tolerance value in colorData
    for (let color in colorData) {
      if (colorData[color].hasOwnProperty('tolerance')) {
        let tolerance = parseFloat(colorData[color].tolerance); // Parse the tolerance as a float
        toleranceMenu[`${tolerance}%`] = () => {
          settings.tolerance = tolerance;
          console.log(settings.tolerance);
          // Update the value of 'Tolerance (%)' in resistanceEntryMenu
          resistanceEntryMenu["Tolerance (%)"] = function() {
            showToleranceMenu();
          };
          showResistanceEntryMenu();
        };
      }
    }

    E.showMenu(toleranceMenu);
  }

  function drawResistorAndResistance(resistance, tolerance, multipliedResistance) {
    console.log('Draw Resistor clicked');
    let colorBands = resistanceToColorBands(multipliedResistance || resistance, tolerance);
    drawResistor(colorBands, tolerance);
    drawResistance(resistance, tolerance);
    resetSettings();
  }

  let resistanceEntryMenu = {
    '': {
      'title': 'Resistance'
    },
    '< Back': function() {
      clearScreen();
      E.showMenu(mainMenu);
    },
    'Ohms': {
      value: 0,
      min: 0,
      max: 99,
      wrap: true,
      format: v => '',
      onchange: v => {}
    },
    'Multiplier': function() {
      showMultiplierMenu();
    },
    'Tolerance (%)': function() {
      showToleranceMenu();
    },
    'Draw Resistor': function() {
      showDrawingMenu();
    }
  };

  function showResistanceEntryMenu() {
    // Update the 'Ohms' field
    resistanceEntryMenu['Ohms'].value = settings.resistance;
    resistanceEntryMenu['Ohms'].format = v => {
      let multipliedValue = v * (settings.multiplier || 1);
      let formattedResistance = formatResistance(multipliedValue);
      let resistanceString = `${formattedResistance.value}${formattedResistance.unit}`;
      if (settings.tolerance) {
        return `${resistanceString}, ± ${settings.tolerance}%`;
      } else {
        return v ? `${resistanceString}` : '';
      }
    };
    resistanceEntryMenu['Ohms'].onchange = v => {
      settings.resistance = v || 0;
      console.log('Resistance changed to: ', settings.resistance);
    };

    E.showMenu(resistanceEntryMenu);
  }

  function showDrawingMenu() {
    let drawingMenu = {
      '': {
        'title': 'Resistor Drawing'
      },
      '< Back': function() {
        clearScreen();
        E.showMenu(mainMenu);
      },
    };

    E.showMenu(drawingMenu);

    let resistance = settings.resistance * (settings.multiplier || 1);
    let tolerance = settings.tolerance;
    drawResistorAndResistance(resistance, tolerance);
  }

  let mainMenu = {
    '': {
      'title': 'Resistor Calc'
    },
    '< Back': () => Bangle.showClock(), // return to the clock app
    'Resistance': function() {
      resetSettings();
      showResistanceEntryMenu();
    },
    'Colors': function() {
      resetSettings();
      showColorEntryMenu();
    },
  };
  E.showMenu(mainMenu);
})();
