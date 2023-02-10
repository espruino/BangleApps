var menu = true;
var diceOpts = {amount: 2, selected: 5}; // TODO: grab values from settings
const DICE_ARRAY = [4, 6, 8, 10, 12, 20, 100]; // TODO: place in settings

function drawMenu() {
  
  g.clear();
  g.setFont ("6x8", 2);
  
  g.drawString ("# of dice:", 5, 5);
  g.drawString (diceOpts.amount, 137, 5); 
  
  g.drawString ("dice:", 5, 32);
  g.drawString (DICE_ARRAY [diceOpts.selected], 137, 32); 
}

function touchHandler (button, xy) {
  
  if (menu) {
    
    if (xy.y <= 26) { // selecting number of dice
      
      if (xy.x <= 87) { // left edge: decrease
        
        if (diceOpts.amount > 1)
          diceOpts.amount--;
      } else { // right edge: increase
        
        if (diceOpts.amount < 6)
          diceOpts.amount++;
      }
      
      drawMenu();
    } else if (xy.y <= 53) { // selecting dice type
      
      if (xy.x <= 87) { // left edge: decrease
        
        if (diceOpts.selected > 0)
          diceOpts.selected--;
      } else { // right edge: increase
        
        if (diceOpts.selected < DICE_ARRAY.length - 1)
          diceOpts.selected++;
      }
      
      drawMenu();
    } else {
      
      rollDice();
    }
  } else { // return to menu screen
    
    menu = true;
    drawMenu ();
  }
}

function rollDice() {
  
  menu = false;
  if (diceOpts.amount == 1) {
    
    let output = random (DICE_ARRAY [diceOpts.selected]);
    
    g.clear();
    g.setFont ("Vector", 90);
    
    g.drawString (("   " + output).slice (-3), 10, 0);
  } else {
    
    let output = new Int8Array ([-1, -1, -1, -1, -1, -1]);
    for (let i = 0; i < diceOpts.amount; i++) {
      
      output [i] = random (DICE_ARRAY [diceOpts.selected]);
    }
    
    g.clear();
    g.setFont ("Vector", 40);
    
    for (let i = 0; i < 3; i++) { // draws all the numbers in two rows
      
      if (output [i * 2 + 0] == -1) {
        
        break;
      } else if (output [i * 2 + 1] == -1) {
        
        
        g.drawString (("   " + output [i * 2]).slice (-3), 5, 5 + i * 40);
      } else {
        
        g.drawString (("   " + output [i * 2]).slice (-3) + " " + ("   " + output [i * 2 + 1]).slice (-3), 5, 5 + i * 40);
      }
    }
    
    g.setFont ("Vector", 20);
    g.drawString ("H: " + ("   " + max (output)).slice (-3), 5, 130);
    g.drawString ("L: " + ("   " + min (output)).slice (-3), 110, 130);
    g.drawString ("T: " + ("   " + total (output)).slice (-3), 5, 150);
    g.drawString ("A: " + ("   " + average (output)).slice (-3), 110, 150);
  }
}

function random (max) { // number is always between 1 and max
  
  return Math.round (Math.random() * (max - 1) + 1);
}

function max (array) {
  
  let max = 0;
  for (let i = 0; i < 6; i++) {
    
    if (array [i] == -1)
      break;
    
    if (array [i] > max)
      max = array [i];
  }
  
  return max;
}

function min (array) {
  
  let min = array [0];
  for (let i = 1; i < 6; i++) {
    
    if (array [i] == -1)
      break;
    
    if (array [i] < min)
      min = array [i];
  }
  
  return min;
}

function total (array) {
  
  let total = 0;
  for (let i = 0; i < 6; i++) {
    
    if (array [i] == -1)
      break;
    
    total += array [i];
  }
  
  return total;
}

function average (array) {
  
  let average = 0;
  let rounds = 0;
  for (let i = 0; i < 6; i++) {
    
    if (array [i] == -1)
      break;
    
    average += array [i];
    rounds++;
  }
  
  return Math.round (average / rounds);
}

drawMenu();
Bangle.on ('touch', touchHandler);
