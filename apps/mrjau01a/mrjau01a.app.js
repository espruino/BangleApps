// place your const, vars, functions or classes here
var counter = 30;
var counterInterval;
var timerRunning = false;
var menueMode = false;

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
        g.clear();
        Bangle.loadWidgets();
        Bangle.drawWidgets();

        g.setFontAlign(0, 0); // center font
        g.setFont("Vector", 80); // vector font, 80px  
        // draw the current counter value
        g.drawString(counter, 120, 120);
        // optional - this keeps the watch LCD lit up
        g.flip();
    }
}

function startTimer() {
    counter = 30;
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
    "Exit": function () { E.showMenu(); },
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
    E.showMenu(mainmenu);
}

// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
    if (on) {
        // call your app function here
        // If you clear the screen, do Bangle.drawWidgets();
    }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
// call your app function here
startTimer();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
// Show app menue when right Touchscreen pressed
setWatch(startAppMenue, BTN1, { repeat: false, edge: "falling" });



