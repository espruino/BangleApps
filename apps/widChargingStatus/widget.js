(function () {
    var icon = require('heatshrink').decompress(atob('ikggMAiEAgYIBmEAg4EB+EAh0AgPggEeCAIEBnwQBAgP+gEP//x///j//8f//k///H//4BYOP/4lBv4bDvwEB4EAvAEBwEAuA7DCAI7BgAQBhEAA'));
    var iconWidth = 18;
    function draw() {
        g.reset();
        if (Bangle.isCharging()) {
            g.setColor('#FD0');
            g.drawImage(icon, this.x + 1, this.y + 1, {
                scale: 0.6875,
            });
        }
    }
    WIDGETS.chargingStatus = {
        area: 'tr',
        width: Bangle.isCharging() ? iconWidth : 0,
        draw: draw,
    };
    Bangle.on('charging', function (charging) {
        var widget = WIDGETS.chargingStatus;
        if (widget) {
            if (charging) {
                Bangle.buzz();
                widget.width = iconWidth;
            }
            else {
                Promise.resolve().then(function () { return require("buzz").pattern("..;"); });
                widget.width = 0;
            }
            Bangle.drawWidgets();
            g.flip();
        }
    });
})();
