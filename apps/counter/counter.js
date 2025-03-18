var counter = 0;
const BANGLEJS2 = process.env.HWVERSION == 2;

if (BANGLEJS2) {  
 var drag;
 var y = 45;
 var x = 5;
} else {
 var y = 100;
 var x = 25;
}

function updateScreen() {
  if (BANGLEJS2) { 	
    g.clearRect(0, 50, 250, 130);
  } else {
    g.clearRect(0, 50, 250, 150);
  }  
  g.setBgColor(g.theme.bg).setColor(g.theme.fg);
  g.setFont("Vector",40).setFontAlign(0,0);
  g.drawString(Math.floor(counter), g.getWidth()/2, 100);
  if (!BANGLEJS2) { 
   g.drawString('-', 45, 100);
   g.drawString('+', 185, 100);
  }
}


if (BANGLEJS2) {  
 setWatch(() => {
   counter = 0;
   updateScreen();
 }, BTN1, {repeat:true});
 Bangle.on("drag", e => {
  if (!drag) { // start dragging
   drag = {x: e.x, y: e.y};
  } else if (!e.b) { // released
   const dx = e.x-drag.x, dy = e.y-drag.y;
   drag = null;
   if (Math.abs(dx)>Math.abs(dy)+10) {
    // horizontal
    if (dx < dy) {
     //console.log("left " + dx + " " + dy);
    } else {
     //console.log("right " + dx + " " + dy);
    }
   } else if (Math.abs(dy)>Math.abs(dx)+10) {
    // vertical
    if (dx < dy) {
     //console.log("down " + dx + " " + dy);
     if (counter > 0) counter -= 1;
     updateScreen();
    } else {
     //console.log("up " + dx + " " + dy);
     counter += 1;
     updateScreen();
    }
   } else {
    //console.log("tap " + e.x + " " + e.y);
   }
  }
 });
 } else {

 // add a count by using BTN1 or BTN5
 setWatch(() => {
   counter += 1;
   updateScreen();
 }, BTN1, {repeat:true});
 
 setWatch(() => {
   counter += 1;
   updateScreen();
 }, BTN5, {repeat:true});
 
 // subtract a count by using BTN3 or BTN4
 setWatch(() => {
   if (counter > 0) counter -= 1;
   updateScreen();
 }, BTN4, {repeat:true});
 
 setWatch(() => {
   if (counter > 0) counter -= 1;
   updateScreen();
 }, BTN3, {repeat:true});
 
 // reset by using BTN2
 setWatch(() => {
   counter = 0;
   updateScreen();
 }, BTN2, {repeat:true});
}


g.clear(1).setFont("6x8");
g.setBgColor(g.theme.bg).setColor(g.theme.fg);
if (BANGLEJS2) { 
 g.drawString([/*LANG*/"Swipe up to increase", /*LANG*/"Swipe down to decrease", /*LANG*/"Press button to reset"].join("\n"), x, 100 + y);
} else {
 g.drawString([/*LANG*/"Tap right or BTN1 to increase", /*LANG*/"Tap left or BTN3 to decrease", /*LANG*/"Press BTN2 to reset"].join("\n"), x, 100 + y);
}

Bangle.loadWidgets();
Bangle.drawWidgets();
updateScreen();

// TODO: Enable saving counts to file
// Add small watch
