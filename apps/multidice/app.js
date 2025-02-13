var settings = Object.assign({
  vibrate: true,
  shake: true,
  screen: false,
  shake_timeout: 200,
  shake_duration: 100,
}, require('Storage').readJSON("multidice.json", true) || {});

var menu = true; // defaults to having the menu open
const DICE_ARRAY = [0, 4, 6, 8, 10, 12, 20, 100]; // 0 means nothing selected
const SELECTION_ARRAY = [6, 0, 0, 0, 0, 0, 0, 0]; // default to selecting a single d20

// function to draw the selection menu
function drawMenu() {
  
  var stringArr = new Array ("", "", "", "", "", "", "", "");
  for (var i = 0; i < 8; i++) {
    
    if (SELECTION_ARRAY [i] != 0) {
      
      stringArr [i] = "" + DICE_ARRAY [SELECTION_ARRAY [i]];
    } else {
      
      stringArr [i] = " . "; // more clearly defines where the user can tap
    }
  }
  
  g.clear();
  g.setFont ("Vector", 40);
  
  // "   ".slice(-3) left-pads all numbers with spaces
  g.drawString (("   " + stringArr [0]).slice (-3), 5, 10);
  g.drawString (("   " + stringArr [1]).slice (-3), 5, 50);
  g.drawString (("   " + stringArr [2]).slice (-3), 5, 90);
  g.drawString (("   " + stringArr [3]).slice (-3), 5, 130);
  g.drawString (("   " + stringArr [4]).slice (-3), 96, 10);
  g.drawString (("   " + stringArr [5]).slice (-3), 96, 50);
  g.drawString (("   " + stringArr [6]).slice (-3), 96, 90);
  g.drawString (("   " + stringArr [7]).slice (-3), 96, 130);
}

// function to change what dice is selected in the menu
function touchHandler (button, xy) {
  
  if (! menu) { // if menu isn't open, open it & return
    
    menu = true;
    drawMenu();
    return;
  }
  
  var selection;
  if (xy.x <= 87) { // left
    
    if (xy.y <= 43) { // first
      
      selection = 0;
    } else if (xy.y <= 87) { // second
      
      selection = 1;
    } else if (xy.y <= 131) { // third
      
      selection = 2;
    } else { // fourth
      
      selection = 3;
    }
  } else { // right
    
    if (xy.y <= 43) { // first
      
      selection = 4;
    } else if (xy.y <= 87) { // second
      
      selection = 5;
    } else if (xy.y <= 131) { // third
      
      selection = 6;
    } else { // fourth
      
      selection = 7;
    }
  }
  
  if (SELECTION_ARRAY [selection] == SELECTION_ARRAY.length - 1) { // if last dice is selected, go back to first
    
    SELECTION_ARRAY [selection] = 0;
  } else {
    
    SELECTION_ARRAY [selection] += 1;
  }
  
  drawMenu();
}

var shaken = false;
var last_shaken = null;
function accelHandler (xyz) {
  
  // if the screen should be on *and* it isn't, return
  if (settings.screen && ! Bangle.isBacklightOn()) {
    
    return;
  }
  
  if (xyz.diff >= 0.3) {
    
    shaken = true;
    last_shaken = Date.now();
  } else if (shaken && last_shaken !== null) {
    
    if (Date.now() - last_shaken > settings.shake_timeout) {
      
      last_shaken = null;
      shaken = false;
      menu = false;
      
      mutex (rollDice).catch (() => { return; });
    }
  }
}

// returns a resolved promise if no other mutex call is active, all further ones return a rejected one
let lock = false;
function mutex (functionRef) {
  
  if (lock) {
    
    return Promise.reject (new Error ("mutex is busy"));
  }
  
  lock = true;
  return new Promise ((resolve, reject) => {
    
    functionRef().then ((result) => {
      
      lock = false;
      resolve (result);
    }).catch ((error) => {
      
      lock = false;
      reject (error);
    });
  });
}

// function to roll all selected dice, and display them
function rollDice() {
  
  var resultsArr = new Uint8Array (8);
  for (var i = 0; i < 8; i++) {
    
    if (SELECTION_ARRAY [i] != 0) {
      
      resultsArr [i] = random (DICE_ARRAY [SELECTION_ARRAY [i]]);
    }
  }
  
  g.clear();
  g.setFont ("Vector", 40);
  
  for (var i = 0; i < 4; i++) {
    
    if (SELECTION_ARRAY [i] != 0) {
      
      g.drawString (("   " + resultsArr [i]).slice (-3), 5, 10 + 40 * i);
    }
  }
  
  for (var i = 4; i < 8; i++) {
    
    if (SELECTION_ARRAY [i] != 0) {
      
      g.drawString (("   " + resultsArr [i]).slice (-3), 96, 10 + 40 * (i - 4));
    }
  }
  
  return vibrate();
}

// triggers the vibration, then pauses before returning
function vibrate() {
  
  if (! settings.vibrate) {
    
    return (Promise.resolve (0));
  }
  
  return new Promise ((resolve, reject) => {
    
    return Bangle.buzz (settings.shake_duration, 1).then ((value) => {
      
      setTimeout (() => {
        
        resolve (value);
      }, 2 * settings.shake_duration + settings.shake_timeout);
    });
  });
}

// returns a integer [1, max]
function random (max) {
  
  return Math.round (Math.random() * (max - 1) + 1);
}

drawMenu();
Bangle.on ('touch', touchHandler);
if (settings.shake) { Bangle.on ('accel', accelHandler); }
setWatch (function() {
  
  menu = false;
  mutex (rollDice);
}, BTN, {repeat: true, edge: "falling", debounce: 10});
