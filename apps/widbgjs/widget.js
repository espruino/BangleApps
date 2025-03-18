//WIDGETS = {}; // <-- for development only

(() => {
    // persistant vals
    let storedData;
    let settings;

    function loadSettings() { // stolen from https://github.com/espruino/BangleApps/blob/master/apps/widpedom/widget.js
      try {
          const d = require('Storage').readJSON("widbgjs.settings.json", 1) || {};
          settings = Object.assign({
              'unitIsMmol': true,
              'expireThreshold': 600000,
              //'reloadInterval': 300000, // 2add in the future
              'hide': false
          }, d || {});
          return d;
      } catch(e){
        //console.log(e.toString());
        return;
      }
    }

    function loadVals() {
      try {
        const d = require('Storage').readJSON("widbgjs.json", 1) || {};
        storedData = Object.assign({
            'bg': null,
            'bgTimeStamp': null,
            'bgDirection': null
        }, d || {});
        return d;
      } catch(e) {
        Bangle.removeFile("widbgjs.json");
      }
      return;
    }

    function calculateRotation(bgDirection) {
        var a = 90;
        // get the arrow right (https://github.com/StephenBlackWasAlreadyTaken/NightWatch/blob/6de1d3775c6e447177c12f387f647628cc8e24ce/mobile/src/main/java/com/dexdrip/stephenblack/nightwatch/Bg.java)
        switch (bgDirection) {
            case ("DoubleDown"):
                g.setColor("#f00");
                a = 180;
                break;
            case ("SingleDown"):
                a = 180;
                break;
            case ("DoubleUp"):
                g.setColor("#f00");
                a = 0;
                break;
            case ("SingleUp"):
                a = 0;
                break;
            case ("FortyFiveUp"):
                a = 45;
                break;
            case ("FortyFiveDown"):
                a = 135;
                break;
            case ("Flat"):
                a = 90;
                break;
        }
        // turn the arrow thanks to (https://forum.espruino.com/conversations/344607/)
        const p180 = Math.PI / 180;
        /*
        // a is defined above
        var r = 21;
        var x = r * Math.sin(a * p180);
        var y = r * Math.cos(a * p180);
        */

        return a * p180;
    }

    function getBG(bg) {
        var tmp = null;

        try {
            if (storedData.bg !== null) {
                tmp = bg;

                if (settings.unitIsMmol) {
                    tmp /= 18;
                    tmp = tmp.toFixed(1);
                }
            }

        } catch (e) { }
        return tmp;
    }

    function isBgTooOld(bgTimeStamp) {
        var currTimeInMilli = new Date().valueOf();

        try {
            if (bgTimeStamp === null) {
                return true;
            }

            if (currTimeInMilli - settings.expireThreshold <= bgTimeStamp) {
                return false;
            }
        } catch (e) { }
        return true;
    }

    function draw() {
        loadSettings();
        if(settings.hide) {
          return;
        }
        console.log(settings.unitIsMmol.toString());
        loadVals();

        let outpt = getBG(storedData.bg);

        if (outpt === null) { // this means no value has been received yet
            outpt = "BG";
            bgTimeStamp = "0";
        }

        // prepare to write on the screen
        g.reset().clearRect(this.x, this.y, this.x + this.width, this.y + 23); // erase background
        g.setFont('Vector', 22);
        g.setColor(g.theme.fg);

        // if the value is too old strikethrough it
        if (isBgTooOld(storedData.bgTimeStamp)) {
          g.fillRect(this.x + 5, this.y + 9, g.stringWidth(outpt),this.y + 10);
        }

       g.drawImage(atob("FBQBAGAADwAB+AA/wAduAGZgAGAABgAAYAAGAABgAAYAAGAABgAAYAAGAABgAAYAAGAABgA="), this.x + 60, this.y + 9, { rotate: calculateRotation(storedData.bgDirection)});
        g.setColor(g.theme.fg).drawString(outpt, this.x + 5, this.y);

    }

    setInterval(function () {
        WIDGETS["widbgjs"].draw(WIDGETS["widbgjs"]);
    }, 5 * 60000); //  update every 5 minutes (5 * 60000)


    // add your widget
    WIDGETS["widbgjs"] = {
        area: "tl",
        width: 72,
        draw: draw
    };
})();

//Bangle.drawWidgets(); // <-- for development only
