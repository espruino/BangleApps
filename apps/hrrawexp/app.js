var counter = 1;
var logging_started;
var interval;
var value;

var file = require("Storage").open("hrm_log.csv", "w");
file.write("");

file = require("Storage").open("hrm_log.csv", "a");

function update_timer() {
    g.clear();
    g.setColor("#00ff7f");
    g.setFont("6x8", 4);
    g.setFontAlign(0, 0); // center font

    g.drawString(counter, 120, 120);
    g.setFont("6x8", 2);
    g.setFontAlign(-1, -1);
    g.drawString("-", 220, 200);
    g.drawString("+", 220, 40);
    g.drawString("GO", 210, 120);

    g.setColor("#ffffff");
    g.setFontAlign(0, 0); // center font
    g.drawString("Timer (minutes)", 120, 90);

    g.setFont("6x8", 4); // bitmap font, 8x magnified

    if (!logging_started)
        g.flip();
}

function btn1Pressed() {
    if (!logging_started) {
        if (counter < 60)
            counter += 1;
        else
            counter = 1;
        update_timer();
    }
}

function btn3Pressed() {
    if (!logging_started) {
        if (counter > 1)
            counter -= 1;
        else
            counter = 60;
        update_timer();
    }
}

function btn2Pressed() {
    launchtime = 0 | getTime();
    file.write(launchtime + "," + "\n");
    logging_started = true;
    counter = counter * 60;
    interval = setInterval(countDown, 1000);
    Bangle.setHRMPower(1);
}

function fmtMSS(e) {
    var m = Math.floor(e % 3600 / 60).toString().padStart(2, '0'),
        s = Math.floor(e % 60).toString().padStart(2, '0');
    return m + ':' + s;
}

function countDown() {
    g.clear();
    counter--;
    if (counter == 0) {
        Bangle.setHRMPower(0);
        clearInterval(interval);
        g.drawString("Finished", g.getWidth() / 2, g.getHeight() / 2);
        Bangle.buzz(500, 1);
    }
    else
        g.drawString(fmtMSS(counter), g.getWidth() / 2, g.getHeight() / 2);
}

update_timer();

setWatch(btn1Pressed, BTN1, { repeat: true });
setWatch(btn2Pressed, BTN2, { repeat: true });
setWatch(btn3Pressed, BTN3, { repeat: true });

Bangle.on('HRM', function (hrm) {
    for (let i = 0; i < hrm.raw.length; i++) {
        value = hrm.raw[i];
        if (value < -2)
            value = -2;
        if (value > 6)
            value = 6;
        file.write(value + "," + "\n");
    }
});
