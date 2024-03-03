(() => {
    let widget_utils = require('widget_utils');

    var saved = false;


    function hide() {
        if (!Bangle.isLCDOn() || saved) return;
        saved = true;
        widget_utils.hide();
        g.setColor(0, 0, 0);
        g.fillRect(0, 0, g.getWidth(), 23);
    }

    function reveal() {
        if (!Bangle.isLCDOn() || !saved) return;
        widget_utils.show();
        saved = false;
    }

    function draw() {
        g.setColor(0x07ff);
        g.drawImage(atob("GBgBAAAAAAAAAAAAAAAAAH4AAf+AB4HgDgBwHDw4OH4cMOcMYMMGYMMGMOcMOH4cHDw4DgBwB4HgAf+AAH4AAAAAAAAAAAAAAAAA"), this.x, this.y);
    }

    WIDGETS.viz = {
        area: "tl",
        width: 24,
        draw: draw
    };



    Bangle.on('lock', (locked) => {
        if (!locked) {
          reveal();
            setTimeout(function() {
                hide();
            }, 4000);
        }
    });
})();
