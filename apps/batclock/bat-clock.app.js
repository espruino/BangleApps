// Initailize Variables

var is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];
var locale = require("locale");
var CHARW = 9; // how tall are digits?
var CHARP = 1; // how chunky are digits?
var Y = 105; // start height

// Offscreen buffer
var buf = Graphics.createArrayBuffer(CHARW + CHARP * 2, CHARW * 2 + CHARP * 2, 1, {
    msb: true
});
var bufimg = {
    width: buf.getWidth(),
    height: buf.getHeight(),
    buffer: buf.buffer
};

// The last time that we displayed
var lastTime = "-----";

// If animating, this is the interval's id
var animInterval;
var timeInterval;

// Background Image
const bg_crack = require("heatshrink").decompress(atob("+HwgJC/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/gEIDrkYDrkwDrlgDrnADvMBwAdcLDkCBhcQDp8EfdMMDrkGDrkHDrkDCB8wDpj8PuD8M4AdO8ANaFp/wgEIDrV4gEEQ5gtBDprhN/wOMngCBLRcEj7EMj5qBBxcMgamMFYWEBAgzFjEA/AdMUgMGDpUQgEeDA0gAgd/DoNCDpUwS4J4GhgED/ZnBkIdKsACBaYxRDgPxBgMRDpVAYogADgJUBfoPgQoQYEwECAoYSCKQgACuD9CwE4d4ISCEQ0BdpRDCh4ECghOCDoUEAgUDZpQaBgEcYIUCRQQdGLogAGgZHBK4MfCQLaEKYj6FAAzNBPQMPwEBiAdEhDkHAA84WwUfGgOYDopCCEIYAIjxbCj4gBCYhZEjAdLg/GAYMfLwNMDogZDmAdLgP8AYM/+EAkgdEPoafEABF8AQP/DoMWDpDbEPBJcB//4bIJ3IQYJPBDpMPOwPPLoMLDo8BAgQqEAAqzBv8H/wUEDpEGSxXB/kD/4ZFAYY3Dgh4KOoIdBC4JuCDog3Dhg7K//gAQIbBVQYdDhwDChA7Kv/AEAUMDo8ejgDBvBZLwBZB+0cmAdGn+eFYL+BAAj9DAAscBQYdDnw3KDpMYDo1uDqiJDDofGDqceYo0BwwdTh0EHYsBd4YdRgQHFgQlDDqIHGggdUh4HGhB/GDqK2DgAdUg4dESwMQDqqvCHYcgIAgdXoEQDqcDDoQAD4EYDq47DwEwDqcCDoTqCgMA+AdTKQICBg04IQMD8AdXAAUGg4dXLAUAh0PDijKBgMeAoUeAgYASsEBx4EBkEengdViEAw4dCn14DqsMgHHDoUzuAdVgOAsYEBmF3WSoABvExDoeADq0P/ADBjH8DiwABDIUPeoIA/AH4A/AAUgDvVgC60DAonwDq0MAgcBDq84OYn4DisB8EAg4CBgF+DqsHwADB/+DwE8DqseEIf/8AdWvAEDn/wDqsfOYR8C//+Oqn/OwQACh//DqcPGY8DDqZwBRqodG4AdcDjcAcywAGsAdcAH4A/AH4A/AH4AnmBA/AEUBw//+Adaj///AOLFRsD//vCBk8DpkH85ZBg/ABxGAjwdMBoP/8JbJgeAg4dMsEAv49COxHAgfQQpeAAQOD//gBo4dBgCjLggED/53HgcAE4N8ap5tBBA0PDoSWNW4eAGgKiGDoIMBDp0GKQQAEjkAuAKBbxIdHAIIAE/gdDUQ4AHjEAhiyFV4M4DoLeIAAwSBDosAvAKCgU8Dp1gHoQADiEwDoS0JoBQFQ4IUCIYkAj/+WgL8IaA0AGgJYFDoJ6BWg8IAwsPDoJbBDo0PDQMBWgwTFgE/BI4dDAwpvDGYIAEvYCBGIMQBAV8NQMOAwS0Fgh+GEoInCMod8KgIdDH4bACDpbxDvkA/gGDg6WELAwICXgQWCiFmQQIdDgPwDA4ACjACBgQCBKQQdCj/8CIbVBABLrCg0AoEHBAViKgIdEnwdKZoQdCUQUQscAgYdEh5zIZoZ0CoClDsIDBvymE8AdJFAUcDovhKg94LRQdDcIngFAMeBIk8Dpi2CDofADoK6CAAQFFDp6fDAAcHSxQdICYUDBIkBE4QAJiAjFDoUBCAq0KDpAQJnAdQggdKYgodIhAdNg4dNhgdNga0LC4IsDDpUAWhaEBcIYdLuALKmDnEDpYpRVBaHCABD8EiAdLgSDMaIUYchgAJgKSBJIUYNZYAKSQQdDH4QATgwdFDisAggCBG4R2WHA0fTYIAUDQQ7CDq8wdgQdZkAdFa4IAUoAFEDoqhCABxSFjIdVgJSFd4odRXJAACgz1WDosCDv4dYgYdWhiiLDv4dSgGADv4dYoAdzgitWDpkgLLgddACwd/Dv4d/Dv4drADsIDv6z/LOQA/AH4A/AH4A/AGw"));
const batman = require("heatshrink").decompress(atob("+HwwJC/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4Ash//AA/gCQ8BCRH8DrsHDrf4BRIdSCQN/BQ/wDqOAgEfDqEDCI/+BYJ4IDqP4BZQdRCIYdMgYdPSw5HCgFwDpnABgSWHDoqmBRJJMDDpcwDocPWRIqJ/gLCvA7LCAZmIBgZZEHY6mEgI7Lg4dK8AdLMwd5DoaIHDojSHDoYFBDpQKCAAU/YBLjEB5TSKFYQdLaAiFJDo5pGaAjfJQoQdDUo/4DorwHb4QdDBxQdLNAQdDQw4dGJQ54CDoZ2GDo4TCB458CJI6GDDpn/DIXwdo69DAAhLHABrgCAAguIABgcGDrzDHABjfCDscPDqf8DssHDqf4DssDDuPwDssBHePgHbgdIgAdx4Ad/Dv4dywBZ/Dv6z/aP4d/Dv4drgIdT8Adm/gDBh4ZLB4YdIAAkfDhP+DBhePGxoAFn4dIDiUAg4cH/AdTepDpIABlfSbAADagzOCACcDDovwDqp4GOyodHoAdWeIocWSwqUWAAMHDof4Dq8BDofgDq6WEWS4ABv4dCwAd2j4cB/wcYaQbQYaQjQYAAMDDoPwDrjuZgEBDrkADoPADvF/Dr2ADrU//4caDoP+DrcfDrkPDrv8DvMH/Ad5gfwDv4AXgIdd8Ad/ADHADv4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AHY"));


/* Get array of lines from digit d to d+1.
 n is the amount (0..1)
 maxFive is true is this digit only counts 0..5 */
const DIGITS = {
    " ": n => [],
    "0": n => [
        [n, 0, 1, 0],
        [1, 0, 1, 1],
        [1, 1, 1, 2],
        [n, 2, 1, 2],
        [n, 1, n, 2],
        [n, 0, n, 1]
    ],
    "1": n => [
        [1 - n, 0, 1, 0],
        [1, 0, 1, 1],
        [1 - n, 1, 1, 1],
        [1 - n, 1, 1 - n, 2],
        [1 - n, 2, 1, 2]
    ],
    "2": n => [
        [0, 0, 1, 0],
        [1, 0, 1, 1],
        [0, 1, 1, 1],
        [0, 1 + n, 0, 2],
        [1, 2 - n, 1, 2],
        [0, 2, 1, 2]
    ],
    "3": n => [
        [0, 0, 1 - n, 0],
        [0, 0, 0, n],
        [1, 0, 1, 1],
        [0, 1, 1, 1],
        [1, 1, 1, 2],
        [n, 2, 1, 2]
    ],
    "4": n => [
        [0, 0, 0, 1],
        [1, 0, 1 - n, 0],
        [1, 0, 1, 1 - n],
        [0, 1, 1, 1],
        [1, 1, 1, 2],
        [1 - n, 2, 1, 2]
    ],
    "5to0": n => [ // 5 -> 0
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [n, 1, 1, 1],
        [1, 1, 1, 2],
        [0, 2, 1, 2],
        [0, 2, 0, 2],
        [1, 1 - n, 1, 1],
        [0, 1, 0, 1 + n]
    ],
    "5to6": n => [ // 5 -> 6
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [0, 1, 1, 1],
        [1, 1, 1, 2],
        [0, 2, 1, 2],
        [0, 2 - n, 0, 2]
    ],
    "6": n => [
        [0, 0, 0, 1 - n],
        [0, 0, 1, 0],
        [n, 1, 1, 1],
        [1, 1 - n, 1, 1],
        [1, 1, 1, 2],
        [n, 2, 1, 2],
        [0, 1 - n, 0, 2 - 2 * n]
    ],
    "7": n => [
        [0, 0, 0, n],
        [0, 0, 1, 0],
        [1, 0, 1, 1],
        [1 - n, 1, 1, 1],
        [1, 1, 1, 2],
        [1 - n, 2, 1, 2],
        [1 - n, 1, 1 - n, 2]
    ],
    "8": n => [
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [1, 0, 1, 1],
        [0, 1, 1, 1],
        [1, 1, 1, 2],
        [0, 2, 1, 2],
        [0, 1, 0, 2 - n]
    ],
    "9": n => [
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [1, 0, 1, 1],
        [0, 1, 1 - n, 1],
        [0, 1, 0, 1 + n],
        [1, 1, 1, 2],
        [0, 2, 1, 2]
    ],
    ":": n => [
        [0.4, 0.4, 0.6, 0.4],
        [0.6, 0.4, 0.6, 0.6],
        [0.6, 0.6, 0.4, 0.6],
        [0.4, 0.4, 0.4, 0.6],
        [0.4, 1.4, 0.6, 1.4],
        [0.6, 1.4, 0.6, 1.6],
        [0.6, 1.6, 0.4, 1.6],
        [0.4, 1.4, 0.4, 1.6]
    ]
};

/* Draw a transition between lastText and thisText.
 'n' is the amount - 0..1 */
function drawDigits(lastText, thisText, n) {
    "ram"
    const p = CHARP; // padding around digits
    const s = CHARW; // character size
    var x = 80; // x offset
    g.reset();
    g.setColor(0, 0, 0);
    g.setBgColor(1, 1, 1);
    for (var i = 0; i < lastText.length; i++) {
        var lastCh = lastText[i];
        var thisCh = thisText[i];
        if (thisCh == ":") x -= 4;
        if (lastCh != thisCh) {
            var ch, chn = n;
            if ((thisCh - 1 == lastCh ||
                (thisCh == 0 && lastCh == 5) ||
                (thisCh == 0 && lastCh == 9)))
                ch = lastCh;
            else {
                ch = thisCh;
                chn = 0;
            }
            buf.clear();
            if (ch == "5") ch = (lastCh == 5 && thisCh == 0) ? "5to0" : "5to6";
            var l = DIGITS[ch](chn);
            l.forEach(c => {
                if (c[0] != c[2]) // horiz
                    buf.fillRect(p + c[0] * s, c[1] * s, p + c[2] * s, 2 * p + c[3] * s);
                else if (c[1] != c[3]) // vert
                    buf.fillRect(c[0] * s, p + c[1] * s, 2 * p + c[2] * s, p + c[3] * s);
            });
            g.drawImage(bufimg, x, Y);
        }
        if (thisCh == ":") x -= 4;
        x += s + p + 7;
    }
}

function drawEverythingElse() {
    var x = (CHARW + CHARP + 6) * 5 + 80;
    var y = Y + 2 * CHARW + CHARP;
    var d = new Date();
    g.reset();
    g.setBgColor(1, 1, 1);
    g.setColor(1, 0, 0);
    g.setFont("6x8");
    g.setFontAlign(-1, -1);
    g.drawString(("0" + d.getSeconds()).substr(-2), x, y - 8, true);
    // meridian
    if (is12Hour) g.drawString((d.getHours() < 12) ? "AM" : "PM", x,
        +4, true);
    // date
    g.setFontAlign(0, -1);
    var date = locale.date(d, false);
    g.drawString(date, g.getWidth() / 2, y + 8, true);
}

/* Show the current time, and animate if needed */
function showTime() {
    if (animInterval) return; // in animation - quit
    var d = new Date();
    var hours = d.getHours();
    if (is12Hour) hours = ((hours + 11) % 12) + 1;
    var t = (" " + hours).substr(-2) + ":" +
        ("0" + d.getMinutes()).substr(-2);
    var l = lastTime;
    // same - don't animate
    if (t == l || l == "-----") {
        drawDigits(l, t, 0);
        drawEverythingElse();
        lastTime = t;
        return;
    }
    var n = 0;
    animInterval = setInterval(function () {
        n += 1 / 10;
        if (n >= 1) {
            n = 1;
            clearInterval(animInterval);
            animInterval = undefined;
        }
        drawDigits(l, t, n);
    }, 20);
    lastTime = t;
}

Bangle.on('lcdPower', function (on) {
    if (animInterval) {
        clearInterval(animInterval);
        animInterval = undefined;
    }
    if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = undefined;
    }
    if (on) {
        showTime();
        timeInterval = setInterval(showTime, 1000);
    } else {
        lastTime = "-----";
    }
});

g.clear();

// Draw Backgound before displaying time
g.setColor(0, 0.5, 0).drawImage(bg_crack);
g.setColor(1, 1, 1).drawImage(batman);

// Show launcher when button pressed
Bangle.setUI("clock");

Bangle.loadWidgets();
Bangle.drawWidgets();

// Update time once a second
timeInterval = setInterval(showTime, 1000);
showTime();

