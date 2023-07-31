// Capital Omega symbol and Resistor icon from icons8
// https://icons8.com/icon/szAc6YFQmlym/capital-omega
// https://icons8.com/icon/ISAVBnskZod0/resistor

let colorData = {
  Black: { value: 0, multiplier: 1, hex: '#000' },
  Brown: { value: 1, multiplier: 10, tolerance: 1, hex: '#8B4513' },
  Red: { value: 2, multiplier: 100, tolerance: 2, hex: '#f00' },
  Orange: { value: 3, multiplier: 1000, hex: '#FF9900' },
  Yellow: { value: 4, multiplier: 10000, hex: '#ff0' },
  Green: { value: 5, multiplier: 100000, tolerance: 0.5, hex: '#0f0' },
  Blue: { value: 6, multiplier: 1000000, tolerance: 0.25, hex: '#00f' },
  Violet: { value: 7, multiplier: 10000000, tolerance: 0.1, hex: '#f0f' },
  Grey: { value: 8, multiplier: 100000000, tolerance: 0.05, hex: '#808080' },
  White: { value: 9, multiplier: 1000000000, hex: '#fff' },
  Gold: { multiplier: 0.1, tolerance: 5, hex: '#FFD700' },
  Silver: { multiplier: 0.01, tolerance: 10, hex: '#C0C0C0' },
  None: { tolerance: 20 },
};

function clearScreen() { // Except Back Button
  g.clearRect(24, 0, 176, 24);
  g.clearRect(0, 24, 176, 176);
}

function colorBandsToResistance(colorBands) {
  let firstBand = colorBands[0];
  let secondBand = colorBands[1];
  let multiplierBand = colorBands[2];
  let toleranceBand = colorBands[3] || 'None'; // Add a default value for toleranceBand
  let significantDigits = colorData[firstBand].value * 10 + colorData[secondBand].value;
  let multiplier = colorData[multiplierBand].multiplier;
  let resistance = significantDigits * multiplier;
  let tolerance = colorData[toleranceBand].tolerance;
  return [resistance, tolerance];
}

// Function to get color bands based on resistance and tolerance
function resistanceToColorBands(resistance, tolerance) {
  let firstDigit, secondDigit, multiplier;
  let resistanceStr = resistance.toString();
  let decimalIndex = resistanceStr.indexOf('.');

  // Handle resistance with decimal
  if (decimalIndex !== -1) {
    let integerDigits = resistanceStr.substring(0, decimalIndex);
    let decimalDigits = resistanceStr.substring(decimalIndex + 1);
    let leadingZeros = decimalDigits.match(/^0*/)[0].length;

    // If resistance is less than 1
    if (parseInt(integerDigits) === 0) {
      if (leadingZeros === decimalDigits.length - 1) {
        // If only one significant digit
        firstDigit = 0;
        secondDigit = parseInt(decimalDigits.charAt(leadingZeros));
        multiplier = 1 / Math.pow(10, leadingZeros + 1);
      } else {
        // If more than one significant digit
        firstDigit = parseInt(decimalDigits.charAt(leadingZeros));
        secondDigit = parseInt(decimalDigits.charAt(leadingZeros + 1));
        multiplier = 1 / Math.pow(10, leadingZeros + 2);
      }
    } else {
      // If resistance is greater than 1
      firstDigit = parseInt(integerDigits.charAt(0));
      secondDigit = parseInt(decimalDigits.charAt(0));
      multiplier = 1 / Math.pow(10, decimalDigits.length);
    }
  } else {
    // Handle resistance without decimal
    firstDigit = resistanceStr.length === 1 ? 0 : parseInt(resistanceStr.charAt(0));
    secondDigit = parseInt(resistanceStr.charAt(resistanceStr.length === 1 ? 0 : 1));
    multiplier = Math.pow(10, resistanceStr.length - 2);
  }

  // Generate color bands array
  let bands = [
    getBandColor('value', firstDigit),
    getBandColor('value', secondDigit),
    getBandColor('multiplier', multiplier),
  ];

  // Add tolerance color band if provided
  let toleranceBand = getBandColor('tolerance', tolerance);
  if (toleranceBand) bands.push(toleranceBand);
  return bands;
}

// Helper function to get color band based on property and value
function getBandColor(property, value) {
  let entry = Object.entries(colorData).find(function (entry) {
    return entry[1][property] === value;
  });
  return entry ? entry[1].hex : undefined;
}

function drawResistor(colorBands, tolerance) {
  let img = require("Storage").read("rescalc-resistor.img");
  let resistorBodyWidth = 51;
  let resistorBodyHeight = 43;
  let resistorStartX = 52;
  let bandColors = colorBands;
  let numColorBands = bandColors.length;
  let resistorStartY = ((g.getHeight() - resistorBodyHeight) / 2) + 48;
  clearScreen();
  g.drawImage(img, 0, 112);
  let bandWidth = (resistorBodyWidth - (numColorBands * 2 - 1)) / numColorBands; // width of each band, accounting for the spacing
  let bandHeight = resistorBodyHeight; // height of each band
  let currentX = resistorStartX; // starting point for the first band
  // Define the tolerance values that will trigger the fourth band
  let validTolerances = [1, 2, 0.5, 0.25, 0.1, 0.05, 5, 10];
  for (let i = 0; i < numColorBands; i++) {
    // Skip the fourth band and its outlines if the tolerance is not in the valid list
    if (i === 3 && !validTolerances.includes(tolerance)) continue;
    let bandX = currentX; // calculate the x-coordinate of the band
    let bandY = resistorStartY; // y-coordinate of the band
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
  let units = ["", "k", "M", "G"];
  let unitIndex = 0;
  while (resistance >= 1000 && unitIndex < units.length - 1) {
    resistance /= 1000;
    unitIndex++;
  }
  // Convert to string and truncate unnecessary zeroes
  let resistanceStr = String(resistance);
  if (resistanceStr.length > 5) { // if length is more than 5 including decimal point
    resistanceStr = resistance.toFixed(2);
  }
  return {
    value: resistanceStr,
    unit: units[unitIndex]
  };
}

function drawResistance(resistance, tolerance) {
  let x = g.getWidth() / 2;
  let y = 40;
  let formattedResistance = formatResistance(resistance);
  let resistanceStr = formattedResistance.value;
  let unit = formattedResistance.unit;
  g.reset();
  // draw resistance value
  g.setFontAlign(0, 0).setFont("Vector", 54);
  g.clearRect(0, y - 15, g.getWidth(), y + 25); // clear the background
  g.drawString(resistanceStr, x + 4, y);
  // draw unit, symbol, and tolerance
  y += 46;
  g.setFontAlign(-1, 0).setFont("Vector", 27);
  let toleranceShift = tolerance.toString().replace('.', '').length > 2 ? 8 : 0;
  let unitX = ((unit === "M" || unit === "G") ? 0 : 8) - toleranceShift;
  let omegaX = (unit ? 46 : 36) - toleranceShift; // Shift the Omega symbol to the left if there is no unit
  g.drawString(unit.padStart(3), unitX, y);
  // Draw the Ohm symbol to the right of the unit
  g.drawImage(omega(), omegaX, y - 13, { scale: 0.45 });
  g.setFontAlign(1, 0).setFont("Vector", 27);
  // Define the tolerance values that will trigger the fourth band
  let validTolerances = [1, 2, 0.5, 0.25, 0.1, 0.05, 5, 10];
  // Check if the tolerance is not in the valid list, and if it's not, set it to 20
  if (!validTolerances.includes(tolerance)) {
    tolerance = 20;
  }
  let toleranceStr = "±" + tolerance + "%";
  let toleranceX = tolerance.toString().replace('.', '').length > 2 ? 10 : 14;
  g.drawString(toleranceStr.padEnd(4), 176 - toleranceX, y);
}

(function () {
  let colorBands;
  let inputColorBands;
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
    colorBands = null;
    inputColorBands = null;
  }

  function showColorBandMenu(bandNumber) {
    let colorBandMenu = {
      '': {
        'title': `Band ${bandNumber}`
      },
      '< Back': function () {
        E.showMenu(colorEntryMenu);
      },
    };

    // Populate colorBandMenu with colors from colorData
    for (let color in colorData) {
      if (bandNumber === 1 || bandNumber === 2) {
        if (color !== 'None' && color !== 'Gold' && color !== 'Silver') {
          (function (color) {
            colorBandMenu[color] = function () {
              setBandColor(bandNumber, color);
            };
          })(color);
        }
      } else if (bandNumber === 3) {
        if (color !== 'None') {
          (function (color) {
            colorBandMenu[color] = function () {
              setBandColor(bandNumber, color);
            };
          })(color);
        }
      } else if (bandNumber === 4) {
        if (colorData[color].hasOwnProperty('tolerance')) {
          (function (color) {
            colorBandMenu[color] = function () {
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
    // Update the color band in the colorEntryMenu
    colorEntryMenu[`${bandNumber}:`].value = color;
    showColorEntryMenu();
  }

  function showColorEntryMenu() {
    colorEntryMenu = {
      '': {
        'title': 'Band Color'
      },
      '< Back': function () {
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
      'Draw Resistor': function () {
        inputColorBands = settings.colorBands;
        let values = colorBandsToResistance(inputColorBands);
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
      '< Back': function () {
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
          // Update the value of 'Multiplier' in resistanceEntryMenu
          resistanceEntryMenu["Multiplier"] = function () {
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
      '< Back': function () {
        showResistanceEntryMenu();
      }
    };

    // Generate menu items for each tolerance value in colorData
    for (let color in colorData) {
      if (colorData[color].hasOwnProperty('tolerance')) {
        let tolerance = parseFloat(colorData[color].tolerance); // Parse the tolerance as a float
        toleranceMenu[`${tolerance}%`] = () => {
          settings.tolerance = tolerance;
          // Update the value of 'Tolerance (%)' in resistanceEntryMenu
          resistanceEntryMenu["Tolerance (%)"] = function () {
            showToleranceMenu();
          };
          showResistanceEntryMenu();
        };
      }
    }
    E.showMenu(toleranceMenu);
  }

  function drawResistorAndResistance(resistance, tolerance) {
    if (inputColorBands) {
      colorBands = inputColorBands.map(color => {
        if (colorData.hasOwnProperty(color)) {
          return colorData[color].hex;
        } else {
          return;
        }
      });
    } else {
      colorBands = resistanceToColorBands(resistance, tolerance);
    }
    drawResistor(colorBands, tolerance);
    drawResistance(resistance, tolerance);
    resetSettings();
  }

  let resistanceEntryMenu = {
    '': {
      'title': 'Resistance'
    },
    '< Back': function () {
      clearScreen();
      E.showMenu(mainMenu);
    },
    'Ohms': {
      value: 0,
      min: 0,
      max: 99,
      wrap: true,
      format: v => '',
      onchange: v => { }
    },
    'Multiplier': function () {
      showMultiplierMenu();
    },
    'Tolerance (%)': function () {
      showToleranceMenu();
    },
    'Draw Resistor': function () {
      showDrawingMenu();
    }
  };

  function showResistanceEntryMenu() {
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
    };
    E.showMenu(resistanceEntryMenu);
  }

  function showDrawingMenu() {
    let drawingMenu = {
      '': {
        'title': ''
      },
      '< Back': function () {
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
    'Resistance': function () {
      resetSettings();
      showResistanceEntryMenu();
    },
    'Colors': function () {
      resetSettings();
      showColorEntryMenu();
    },
  };
  E.showMenu(mainMenu);
})();