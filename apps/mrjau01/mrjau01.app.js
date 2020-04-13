// Version 0.03
// place your const, vars, functions or classes here
var counterInterval;
var timerCounter = 120;
var timerRunning = false;
var menueMode = false;
var idBTN1;

// Timer
function outOfTime() {
    E.showMessage("Out of Time", "My Timer");
    Bangle.buzz();
    Bangle.beep(200, 4000)
        .then(() => new Promise(resolve => setTimeout(resolve, 200)))
        .then(() => Bangle.beep(200, 3000));
    // again, 10 secs later
    setTimeout(outOfTime, 10000);
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
        g.setFont("Vector", 80); // vector font, 80px  
        // draw the current counter value
        g.drawString(counter, 120, 120);
        // optional - this keeps the watch LCD lit up
        g.flip();
    }
}

function startTimer() {
    // 240 x 240 x 16 bits
    // 48 Pixel for Widgets
    // 192 Pixel for the Rest
    // 96 Pixel seems to be the center

    counter = timerCounter;
    g.drawRect(3, 29, 237, 215); // Outer Rect
    g.drawCircle(117, 122, 93);  // Inner Circle
    g.drawRect(52, 57, 182, 187); // Inner Rect

    g.clear();
    Bangle.loadWidgets();
    Bangle.drawWidgets();

    timerRunning = true;
    countDown();
    if (!counterInterval)
        counterInterval = setInterval(countDown, 1000);
}

// Menue
var mainmenu = {
    "": {
        "title": "-- Main Menu --"
    },
    "Beep": function () { Bangle.beep(); },
    "Buzz": function () { Bangle.buzz(); },
    "Submenu": function () { E.showMenu(submenu); },
    "ShowMessage": {},
    "Exit": function () { startMyApp(); },
};
// Submenu
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
    clearWatch(idBTN1);
    clearWatch(idBTN2);
    clearWatch(idBTN3);
    E.showMenu(mainmenu);
}

function startMyApp() {

    g.clear();
    Bangle.loadWidgets();
    Bangle.drawWidgets();

    // call your app function here
    startTimer();
    // Show launcher when middle button pressed
    idBTN1 = setWatch(startTimer, BTN1, { repeat: true, edge: "falling" });
    idBTN2 = setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
    // Show app menue when right Touchscreen pressed
    idBTN3 = setWatch(startAppMenue, BTN3, { repeat: false, edge: "falling" });
}

// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
    if (on) {
        // call your app function here
        startMyApp();
        // If you clear the screen, do Bangle.drawWidgets();
    }
});

startMyApp();
setInterval(drawWordClock, startMyApp);