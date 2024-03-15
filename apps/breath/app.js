var angle = -90;
var origin = angle * (Math.PI / 180);
var max_radius = 70;
var direction = 1;
var display_HR = "--";
var first_signal = true;
//var interval;
var timeout;
var settings;
var status = 0;

var colours = {
    green: ["#00ff7f", "green"],
    white: ["#ffffff", "white"],
    blue: ["#00abff", "blue"],
    red: ["#ff3329", "red"],
    yellow: ["#fdff00", "yellow"]
};

var settings_file = require("Storage").open("breath.settings.json", "r");

var test = settings_file.read(settings_file.getLength());

if(test!== undefined)
  settings = JSON.parse(test);

if (settings === undefined) {
    settings = {
        period: 2,
        exhale_pause: 1,
        inhale_pause: 1,
        colour: colours.green,
        vibrate: "forward",
        ex_in_ratio: "1:1"
    };
}

var selection = ["speed", "exhale pause", "inhale pause", "colour", "vibrate",
                 "ex_in_ratio", "in_progress", "paused"];

var colours = {
    green: ["#00ff7f", "green"],
    white: ["#ffffff", "white"],
    blue: ["#00abff", "blue"],
    red: ["#ff3329", "red"],
    yellow: ["#fdff00", "yellow"]
};

g.setFont("6x8", 2);

function circle() {

    g.clear();
    const adjusted_radius = max_radius * Math.abs(origin);
    g.drawCircle(120, 120, adjusted_radius);
    //const radius = Math.abs(Math.sin(origin));
    angle += 2;
    origin = angle * (Math.PI / 180);
    if (angle >= 0 && angle < 90) {
        if (angle == 2) {
            clearInterval();
            g.setFontAlign(-1, -1);
            g.drawString("<<", 220, 40);
            status = 7;
            timeout = setTimeout(function () {
                /*interval =*/ restart_interval();
            }, settings.exhale_pause * 1000);
        }
        direction = 0;
    }
    else {
        if (angle == 90)
            angle = -90;
        if (angle == -90) {
            clearInterval();
            g.setFontAlign(-1, -1);
            g.drawString("<<", 220, 40);
            status = 7;
            timeout = setTimeout(function () {
                /*interval =*/ restart_interval();
            }, settings.inhale_pause * 1000);
        }
        direction = 1;
    }
    g.drawString(display_HR, 20, 200);

    g.flip();

    if (settings.vibrate == "forward")
        Bangle.buzz(50, Math.abs(origin)/1.5);
    else if (settings.vibrate == "backward")
        Bangle.buzz(50, (1.6 - (Math.abs(origin))));
}

function restart_interval() {
    status = 6;
    var calc = 5 - settings.period;
    calc *= 15;
    calc += 120;
    if(direction == 1 && settings.ex_in_ratio == "5:6"){
      calc -= calc*0.2;
    }
    /*interval =*/ setInterval(circle, calc);
}

function update_menu() {
    g.clear();
    g.setColor(settings.colour[0]);
    g.setFontAlign(-1, -1);
    g.drawString("+/-", 200, 200);
    g.drawString("<>", 220, 40);
    g.drawString("GO", 210, 120);
    g.setFontAlign(-1, -1);
    var cursor = 60;

    while (cursor < 180) {
        var key = Object.keys(settings)[(cursor - 60) / 20];
        var value = settings[key];
      
        if (status == ((cursor - 60) / 20)) {
            g.setColor(colours.white[0]);
        }
        else
            g.setColor(settings.colour[0]);

        var display_txt = selection[(cursor - 60) / 20] + ": " + value;
      
        if(((cursor - 60) / 20) == 3)
          display_txt = selection[(cursor - 60) / 20] + ": " + value[1];
      
        g.drawString(display_txt, 10, cursor);
        cursor += 20;
    }
}

function btn1Pressed() {
    if (status < 6) {
        status += 1;
        if (status == 6)
            status = 0;

        update_menu();
    }
    else if (status == 7) {
        clearTimeout(timeout);
        clearInterval();
        status = 0;
        update_menu();
    }
}

function btn2Pressed() {
    if (status < 6) {
        settings_file = require("Storage").open("breath.settings.json", "w");
        settings_file.write(JSON.stringify(settings));
        Bangle.setHRMPower(1);
        g.setColor(settings.colour[0]);
        restart_interval();
    }
}

function btn3Pressed() {
    if (status < 6) {
        if (status == 0) {
            settings.period += 1;
            if (settings.period > 6)
                settings.period = 1;
        }
        else if (status == 1) {
            settings.exhale_pause += 1;
            if (settings.exhale_pause > 4)
                settings.exhale_pause = 1;
        }
        else if (status == 2) {
            settings.inhale_pause += 1;
            if (settings.inhale_pause > 4)
                settings.inhale_pause = 1;
        }
        else if (status == 3) {
            if (settings.colour[0] == colours.green[0]) {
                settings.colour = colours.blue;
            }
            else if (settings.colour[0] == colours.blue[0])
                settings.colour = colours.red;
            else if (settings.colour[0] == colours.red[0])
                settings.colour = colours.yellow;
            else if (settings.colour[0] == colours.yellow[0])
                settings.colour = colours.green;
        }
        else if (status == 4) {
            if (settings.vibrate == "forward")
                settings.vibrate = "backward";
            else if (settings.vibrate == "backward")
                settings.vibrate = "off";
            else if (settings.vibrate == "off")
                settings.vibrate = "forward";
        }
        else if(status == 5){
          if(settings.ex_in_ratio == "1:1")
            settings.ex_in_ratio = "5:6";
          else
            settings.ex_in_ratio = "1:1";
        }
        update_menu();
    }
}

update_menu();

setWatch(btn1Pressed, BTN1, { repeat: true });
setWatch(btn2Pressed, BTN2, { repeat: true });
setWatch(btn3Pressed, BTN3, { repeat: true });

Bangle.on('HRM', function (hrm) {
    if (first_signal)
        first_signal = false;
    else{
          var signal = hrm.bpm;
          if(signal > 50 && signal < 180)
            display_HR = signal;
        }
});
