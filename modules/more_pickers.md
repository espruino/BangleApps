# More pickers

This library provides a double picker and a triple picker, similar to the stock picker.

# How to use
**Important:** you need to define a `back` handler that will be called to go back to the previous screen when the user confirms the input or clicks on the back button.

It is possible to define an optionnal custom separator between the values. See examples below.

## Double picker

Example:

```javascript
// example of a formatting function
function pad2(number) {
  return (String(number).padStart(2, '0'));
}

var hours = 10;
var minutes = 32;

function showMainMenu() {
  E.showMenu({
    'Time': function () {
      require("more_pickers").doublePicker({
        back: showMainMenu,
        title: "Time",
        separator: ":",

        value_1: hours,
        min_1: 0, max_1: 23, step_1: 1, wrap_1: true,

        value_2: minutes,
        min_2: 0, max_2: 59, step_2: 1, wrap_2: true,

        format_1: function (v_1) { return (pad2(v_1)); },
        format_2: function (v_2) { return (pad2(v_2)); },
        onchange: function (v_1, v_2) { hours = v_1; minutes = v_2; }
      });
    }
  });
}

Bangle.loadWidgets();
Bangle.drawWidgets();
showMainMenu();
```


## Triple picker

Example:

```javascript
// example of a formatting function
function pad2(number) {
  return (String(number).padStart(2, '0'));
}

var day = 21;
var month = 5;
var year = 2021;

function showMainMenu() {
  E.showMenu({
    'Date': function () {
      require("more_pickers").triplePicker({
        back: showMainMenu,
        title: "Date",
        separator_1: "/",
        separator_2: "/",

        value_1: day,
        min_1: 1, max_1: 31, step_1: 1, wrap_1: true,

        value_2: month, 
        min_2: 1, max_2: 12, step_2: 1, wrap_2: true,

        value_3: year,
        min_3: 2000, max_3: 2050, step_3: 1, wrap_3: false,

        format_1: function (v_1) { return (pad2(v_1)); },
        format_2: function (v_2) { return (pad2(v_2)); },
        onchange: function (v_1, v_2, v_3) { day = v_1; month = v_2; year = v_3; }
      });
    }
  });
}

Bangle.loadWidgets();
Bangle.drawWidgets();
showMainMenu();