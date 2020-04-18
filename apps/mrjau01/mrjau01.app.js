// Version 0.06
// place your const, vars, functions or classes here
var counterInterval;
var timerCounter = 5;
var timerRunning = false;
var menueMode = false;
var myBTN1;
var myBTN2;
var myBTN3;

// GPS
function GPSstopped(title) {
  console.log("GPSstopped");
  Bangle.setGPSPower(0);
  E.showMessage(title);
}
function onGPS(fix) {
  console.log("onGPS");
  console.log(fix);
  if (isNaN(fix.lat)) GPSstopped('No GPS Signal');
}
function startMyGPXApp() {

  // Configure Button BTN2 with Menue
  E.showMessage("GPS Mode"); // avoid showing rubbish on screen
  myBTN2 = setWatch(function (e) { startAppMenue(); }, BTN2, { repeat: true, edge: "rising" });

  console.log("startMyGPSApp");
  Bangle.on('GPS', onGPS);
  Bangle.setGPSPower(1);
  E.showMessage("GPS Mode"); // avoid showing rubbish on screen
}

// Timer
function outOfTime() {
  E.showMessage("Out of Time", "My Timer");
  Bangle.buzz();
  //Bangle.beep(200, 4000)
  //    .then(() => new Promise(resolve => setTimeout(resolve, 200)))
  //    .then(() => Bangle.beep(200, 3000));
  // again, 10 secs later
  //setTimeout(outOfTime, 10000);
}
function countDown() {
  counter--;
  // Out of time
  if (counter <= 0) {
    clearInterval(counterInterval);
    counterInterval = undefined;
    outOfTime();
    return;
  }
  if ((timerRunning) && !(menueMode)) {
    g.clearRect(53, 58, 181, 186);
    g.setFontAlign(0, 0); // center font
    g.setFont("Vector", 40); // vector font, 80px  
    // draw the current counter value
    g.drawString(counter, 120, 120);
    // optional - this keeps the watch LCD lit up
    g.flip();
  }
}
function startTimer(e) {
  // console.log(e.time - e.lastTime); // e enthält die Dauer des Drucks auf den Knopf
  counter = timerCounter;
  timerRunning = true;
  countDown();
  if (!counterInterval)
    counterInterval = setInterval(countDown, 1000);
}
function stopTimer() {
  if (counterInterval != undefined) {
    clearInterval(counterInterval);
    counterInterval = undefined;
  }
}

//StartMyTimerApp
function startMyTimerApp() {

  //clear Screen and build simple rect frame
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  clearWatch();

  // Configure Button BTN2 with Menue
  myBTN2 = setWatch(function (e) { startAppMenue(); }, BTN2, { repeat: true, edge: "rising" });

  // Restart timer wenn top button pressed
  myBTN1 = setWatch(function (e) { startTimer(e); }, BTN1, { repeat: true, edge: "rising" });

  // Stop timer
  myBTN3 = setWatch(function (e) { stopTimer(e); }, BTN3, { repeat: true, edge: "rising" });

  // 240 x 240 x 16 bits
  // 48 Pixel for Widgets
  // 192 Pixel for the Rest
  // 96 Pixel seems to be the center

  g.drawRect(3, 29, 237, 215); // Outer Rect
  g.drawCircle(117, 122, 93);  // Inner Circle
  g.drawRect(52, 57, 182, 187); // Inner Rect

}

// Menue
var mainmenu = {
  "": {
    "title": "Test App 0.06"
  },
  "Timer App": function () { startMyTimerApp(); },
  "GPX App": function () { startMyGPXApp(); },
  "Settings": function () { E.showMenu(submenu); },
  'Turn Off': () => Bangle.off(),
  'Stop App': () => load()
};

// submenu - Settings
var submenu = {
  "": {
    "title": "-- SubMenu --"
  },
  "One": undefined, // do nothing
  "Two": undefined, // do nothing
  "< Back": function () { E.showMenu(mainmenu); },
};

// Start meneu
function startAppMenue() {

  stopTimer();
  console.log("startAppMenue");
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  E.showMenu(mainmenu);
}

// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
  if (on) { }
});

// Start App Menue
clearWatch();
startAppMenue();
