(function () {
    var intervalLow = 60000;
    var intervalHigh = 2000;
    var width = 30;
    var height = 24;
    var powerColour = function (pwr) {
        return pwr >= 23000
            ? "#f00"
            : pwr > 2000
                ? "#fc0"
                : "#0f0";
    };
    var drawBar = function (x, y, batt) {
        return g.fillRect(x + 1, y + height - 3, x + 1 + (width - 2) * batt / 100, y + height - 1);
    };
    var drawString = function (x, y, txt) {
        return g.drawString(txt, x + 14, y + 10);
    };
    function draw() {
        var x = this.x;
        var y = this.y;
        var batt = E.getBattery();
        var pwr = E.getPowerUsage();
        var usage = 0;
        for (var key in pwr.device) {
            if (!/^(LCD|LED)/.test(key))
                usage += pwr.device[key];
        }
        var pwrColour = powerColour(usage);
        g.reset()
            .setBgColor(g.theme.bg)
            .clearRect(x, y, x + width - 1, y + height - 1);
        g.setColor(g.theme.fg);
        drawBar(x, y, 100);
        g.setColor(pwrColour);
        drawBar(x, y, batt);
        g.setFontAlign(0, 0);
        g.setFont("Vector", 16);
        {
            var hrs = 200000 / usage;
            var days = hrs / 24;
            var txt = days >= 1 ? "".concat(Math.round(Math.min(days, 99)), "d") : "".concat(Math.round(hrs), "h");
            var txth = 14;
            g.setColor(g.theme.fg);
            g.setClipRect(x, y, x + width, y + txth);
            drawString(x, y, txt);
            g.setColor(pwrColour);
            g.setClipRect(x, y + txth * (1 - batt / 100), x + width, y + txth);
            drawString(x, y, txt);
        }
    }
    var id = setInterval(function () {
        var w = WIDGETS["battpwr"];
        w.draw(w);
    }, intervalLow);
    Bangle.on("charging", function (charging) {
        changeInterval(id, charging ? intervalHigh : intervalLow);
    });
    WIDGETS["battpwr"] = { area: "tr", width: width, draw: draw };
})();
