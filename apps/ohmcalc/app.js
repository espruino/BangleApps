let Layout = require("Layout");

// Definitions for units and formulas for electrical measurements.
const UNITS = {
  "Voltage (V)": "Volts",
  "Current (I)": "Amps",
  "Resistance (R)": "Ohms",
  "Power (P)": "Watts",
};
const FORMULAS = {
  'Voltage (V)': {
    'Current (I), Resistance (R)': "{0} * {1}",
    'Power (P), Current (I)': "{0} / {1}",
    'Power (P), Resistance (R)': "Math.sqrt({0} * {1})"
  },
  'Current (I)': {
    'Voltage (V), Resistance (R)': "{0} / {1}",
    'Power (P), Voltage (V)': "{0} / {1}",
    'Power (P), Resistance (R)': "Math.sqrt({0} / {1})"
  },
  'Resistance (R)': {
    'Voltage (V), Current (I)': "{0} / {1}",
    'Power (P), Current (I)': "{0} / (Math.pow({1}, 2))",
    'Power (P), Voltage (V)': "(Math.pow({0}, 2)) / {1}"
  },
  'Power (P)': {
    'Voltage (V), Current (I)': "{0} * {1}",
    'Current (I), Resistance (R)': "(Math.pow({0}, 2)) * {1}",
    'Voltage (V), Resistance (R)': "(Math.pow({0}, 2)) / {1}"
  },
};

// Screen positioning settings
let btnSize = 23;
let xCenter = g.getWidth() / 2;
let yCenter = g.getHeight() / 2;

// Variables to hold state
let lastStringWidth = 0;
let halfStringWidth = lastStringWidth / 2;
let calculatedVariable;
let selectedVariable;
let variableValues = {};
let inputStr = "";

// Function references
let handleEnter;
let showVariableSelectionMenu;
let showInputMenu;
let resultsMenu;

// Setup the layout for input buttons
let layout = new Layout({
  type: "v",
  c: [
    { type: "txt", font: "6x8:3", label: "", id: "label" },
    { type: "h", c: "123".split("").map(i => ({ type: "btn", font: "6x8:3", label: i, cb: () => { handleButtonPress(i); }, fillx: 1, filly: 1 })) },
    { type: "h", c: "456".split("").map(i => ({ type: "btn", font: "6x8:3", label: i, cb: () => { handleButtonPress(i); }, fillx: 1, filly: 1 })) },
    { type: "h", c: "789".split("").map(i => ({ type: "btn", font: "6x8:3", label: i, cb: () => { handleButtonPress(i); }, fillx: 1, filly: 1 })) },
    { type: "h", c: ".0C".split("").map(i => ({ type: "btn", font: "6x8:3", label: i, cb: () => { handleButtonPress(i); }, fillx: 1, filly: 1 })) },
    { type: "h", c: [{ type: "btn", font: "6x8:2", label: "Enter", cb: () => { handleEnter(); }, fillx: 1, filly: 1 }] }
  ]
}, { lazy: false });

// Clears area at the top of the screen where the text is displayed
function clearTextArea() { // Except Back Button
  let x2 = g.getWidth();
  g.clearRect(0, 0, x2, btnSize);
}

// Function to clear the entire screen, except for the Back button
function clearScreen() {
  let x2 = g.getWidth();
  let y2 = g.getHeight();
  g.clearRect(btnSize, 0, x2, btnSize);
  g.clearRect(0, btnSize, x2, y2);
}

// Function to set up and display the calculator input screen
function showCalculatorInputScreen(variable) {
  selectedVariable = variable;
  layout.setUI();
  layout.render();
}

// Function to set and display the current value of the input
// Adjusts the font size to fit the screen width
function setValue(newStr) {
  clearTextArea();
  inputStr = newStr;

  // Here we check the width of the string and adjust the font size
  // Start with a standard font size and increase if the string is too wide
  let fontSize = "6x8:3";  // start with a standard size
  g.setFont(fontSize);

  // If the string is too long to fit on the screen, adjust the font size
  while (g.stringWidth(inputStr) > g.getWidth() - 10 && fontSize !== "6x8:1") {
    fontSize = "6x8:" + (Number(fontSize.split(":")[1]) - 1).toString();
    g.setFont(fontSize);
  }

  layout.label.label = inputStr;
  g.drawString(inputStr, layout.label.x, layout.label.y + 11);
  lastStringWidth = g.stringWidth(inputStr);
}

// Function to handle the press of a button and append its value to the current input
function handleButtonPress(value) {
  inputStr = value === 'C' ? '' : inputStr + value;
  setValue(inputStr);
}

// Function to format the unit of measurement
function formatUnit(unit, value) {
  return parseFloat(value) === 1 ? unit.slice(0, -1) : unit;
}

// Calculates the value of the selected variable based on the entered values
// Also handles rounding and trimming of long decimal numbers
function calculateValue(calculatedVariable, variableValues) {
  let formulas = FORMULAS[calculatedVariable];
  let formulaKeys = Object.keys(formulas);
  for (let i = 0; i < formulaKeys.length; i++) {
    let formulaKey = formulaKeys[i];
    let variables = formulaKey.split(', ');
    if (variables.every(variable => variableValues.hasOwnProperty(variable))) {
      let formula = formulas[formulaKey];
      let formulaValues = variables.map(variable => variableValues[variable]);
      let calculatedValue = eval(formula.replace(/\{(\d+)\}/g, (_, index) => formulaValues[index]));

      // Check if the number is an integer
      let isInteger = Math.floor(calculatedValue) === calculatedValue;

      // Round and trim long decimal numbers
      if (!isInteger) {
        calculatedValue = Math.round(calculatedValue * 1000) / 1000;
        calculatedValue = calculatedValue.toString().replace(/(\.\d*?)0+$/, '$1');
      } else {
        calculatedValue = calculatedValue.toFixed(0);
      }

      let result = Object.entries(variableValues).map(function (entry) {
        let variable = entry[0];
        let value = entry[1];
        return [variable, `${value} ${formatUnit(UNITS[variable], value.toString())}`];
      });
      result.push([calculatedVariable, `${calculatedValue} ${formatUnit(UNITS[calculatedVariable], calculatedValue.toString())}`]);
      return {
        formula: formula.replace(/\{(\d+)\}/g, (_, index) => formulaValues[index]),
        value: calculatedValue,
        unit: formatUnit(UNITS[calculatedVariable], calculatedValue),
        result: result,
      };
    }
  }
}

// Main function to initialize the application and setup the main menu
(function () {
  let mainMenu = {
    '': { 'title': 'Ohm\'s Law Calc' },
    '< Back': () => Bangle.showClock()
  };

  Object.keys(UNITS).forEach(unit => {
    mainMenu[unit] = () => handleUnitSelection(unit);
  });

  // Function to present the menu for selecting the variable
  // Filters out the calculated variable and already set variables from the menu
  showVariableSelectionMenu = function () {
    clearScreen();
    let variableSelectionMenu = {
      '': { 'title': 'Select Variable' },
      '< Back': () => E.showMenu(mainMenu)
    };
    let variables = Object.keys(UNITS);
    let remainingVariables = variables.filter(v => v !== calculatedVariable && !variableValues[v]);
    remainingVariables.forEach(variable => {
      variableSelectionMenu[variable] = function () {
        showInputMenu(variable);
      };
    });
    E.showMenu(variableSelectionMenu);
  };

  // Function to handle the input of variable values
  // It sets the current selected variable and displays the calculator input screen
  showInputMenu = function (variable) {
    setValue("");
    selectedVariable = variable;
    let inputMenu = {
      '': { 'title': variable },
    };
    E.showMenu(inputMenu);
    showCalculatorInputScreen(variable);
  };

  // Function to handle the event of pressing 'Enter'
  // It checks if the input is valid, if so, it saves the value and 
  // either calculates the result (if enough variables are present) or opens variable selection menu
  handleEnter = function () {
    // Check if the input is valid
    if (inputStr === "" || isNaN(inputStr) || (inputStr.match(/\./g) || []).length > 1) {
      // Show error message
      setValue("Invalid Input");
      // Clear error message after 2 seconds
      setTimeout(() => setValue(''), 2000);
      return;
    }

    if (calculatedVariable === null) {
      return;
    }
    variableValues[selectedVariable] = parseFloat(inputStr);
    if (Object.keys(variableValues).length === 2) {
      let result = calculateValue(calculatedVariable, variableValues);
      showResultsScreen(result);
      calculatedVariable = null;
      variableValues = {};
    } else {
      setValue("");
      showVariableSelectionMenu();
      return;
    }
    return;
  };

  // Function to handle the selection of a unit of electical measurement
  function handleUnitSelection(unit) {
    calculatedVariable = unit;
    showVariableSelectionMenu();
  }

  // Function to display the results screen with the calculated value
  function drawValueScreen
  (result) {
    let drawPage = function () {
      clearScreen();
      let fontSize = g.getHeight() / 3;
      g.setFontVector(fontSize);

      // Reduce the font size until both the value and unit fit on the screen
      while (g.stringWidth(result.value) > g.getWidth() - 20 || g.getFontHeight() > g.getHeight() / 2) {
        fontSize--;
        g.setFontVector(fontSize);
      }

      let valueY = yCenter - g.getFontHeight() / 2;
      let unitY = yCenter + g.getFontHeight() / 2;
      let valueWidth = g.stringWidth(result.value);
      let unitWidth = g.stringWidth(result.unit);
      let valueX = (g.getWidth() - valueWidth) / 2;
      let unitX = (g.getWidth() - unitWidth) / 2;

      g.drawString(result.value, valueX, valueY);
      g.drawString(result.unit, unitX, unitY);
      g.flip();
    };

    // Shows the back button on the value screen
    return function () {
      clearScreen();
      let valueMenu = {
        '': { 'title': 'Results' },
        '< Back': function () {
          E.showMenu(resultsMenu);
        }
      };
      E.showMenu(valueMenu);
      drawPage();
    };
  }

  // Shows the results menu with the calculated results and options
  function showResultsScreen(result) {
    let backButton = function () {
      clearScreen();
      E.showMenu(resultsMenu);
    };
    g.clear();
    resultsMenu = {
      '': { 'title': 'Results' },
      'Main Menu': function () {
        E.showMenu(mainMenu);
      },
    };
    resultsMenu[result.value + ' ' + result.unit] = drawValueScreen(result);
    resultsMenu[result.formula + " = " + calculatedVariable] = {};
    resultsMenu['Exit'] = function () {
      Bangle.showClock();
    };
    E.showMenu(resultsMenu);
  }

  clearTextArea();
  E.showMenu(mainMenu);

})();
