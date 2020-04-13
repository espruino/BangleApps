//BTN1 : 'Up/Previous' in menus, and turn on if watch is off
//BTN2 : 'Select' in menus, or bring up menu when in Clock
//BTN3 : Down/Next in menus, long-press in any app to return to the Clock
//BTN4 : left-hand side of touchscreen. Used for some games, but not in menus
//BTN5 : right-hand side of touchscreen. Used for some games, but not in menus

// Resetting
// =========
// Long-press BTN1 + BTN2 for about 6 seconds until the screen goes blank
// More Information here - https://www.espruino.com/Bangle.js+Getting+Started
// Long-press BTN3 entfernt mein TestScript

// https://www.espruino.com/Code+Style
  // No tabs, 2 spaces for each indent
  // Open braces are on the same line as the reason for their opening
  // Single lines don't need braces around them
  // Constants are ALL_CAPS
  // variables/functions start lowercase, with capitalised letters: myLongVarName
  // Classes or Functions with prototypes start uppercase: MyClass

// GitHub repository
  // https://github.com/espruino/BangleApps/tree/master/apps/compass

// Start meiner Test App
// =====================
function testAusgabe(){
  E.showMessage("Hello","My Test Script"); // Textausgabe
  Terminal.println(debugValue); // Debug Ausgabe
}
function testClearScreen() {
    g.clear(); // Clear Watch Screen
    Bangle.drawWidgets() – Load Widgets // Load Widgets
}

var debugValue = "1" ;
g.setFont("Vector",12);
AppStartScreen();

// g.setFontAlign(0,0); // center font
// g.setFont("6x8",8); // bitmap font, 8x magnified


// built-in menu library that can be accessed with the E.showMenu() command.
// Two variables to do something in menu example
var boolean = false;
var number = 50;
// First menu
var mainmenu = {
  "" : {
    "title" : "-- Main Menu --"
  },
  "Beep" : function() { Bangle.beep(); },
  "Buzz" : function() { Bangle.buzz(); },
  "Submenu" : function() { E.showMenu(submenu); },
  "A Boolean" : {
    value : boolean,
    format : v => v?"On":"Off",
    onchange : v => { boolean=v; }
  },
  "A Number" : {
    value : number,
    min:0,max:100,step:10,
    onchange : v => { number=v; }
  },
  "Exit" : function() { E.showMenu(); },
};
// Submenu
var submenu = {
  "" : {
    "title" : "-- SubMenu --"
  },
  "One" : undefined, // do nothing
  "Two" : undefined, // do nothing
  "< Back" : function() { E.showMenu(mainmenu); },
};
// Actually display the menu
//// E.showMenu(mainmenu);

// Counter Example:
var counter = 30;
function countDown() {
  counter--;

  g.clear();
  // draw the current counter value
  g.drawString(counter, g.getWidth()/2, g.getHeight()/2);
  // optional - this keeps the watch LCD lit up
  g.flip();
}
// var interval = setInterval(countDown, 1000);
// Wie kann ich das stoppen?

// Draw a pattern with lines
function drawPatternWithLines() {
  g.clear();
  for (i=0;i<64;i+=7.9) g.drawLine(0,i,i,63);
  g.drawString("Hello World",30,30);
  }

// Hiermit kann ich auf der Uhr tippen:
// Bluetooth.on("data",d=>Terminal.inject(d));
// Terminal.setConsole();

// Status des Knopf 2 auslesen
BTN2.read();


// Bangle.beep(time, freq)

// Javascript
  // Random Math Function
  function random(){
    let randomNumber = Math.floor(Math.random() * 100) + 1; // Very Local Variable with a random Number
  }

// Mein App Body
setWatch(() => {
  debugvalue = "2";
  Bangle.buzz();
  E.showMessage("You\nTouched\nthe left\nScreen!");
  setTimeout(()=>AppStartScreen(), 1000);
}, BTN4, {repeat:true});




