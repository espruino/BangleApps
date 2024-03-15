// GB({"t":"notify","id":1575479849,"src":"Hangouts","title":"A Name","body":"message contents"})
var xxl = {
// private:
    msg: [],
    drawTimeout: undefined,
    xpos : 0,
    loopCount : 0,
    txt:'',
    wtot:0,
    img:undefined,
    imgcol:'#ffffff',

    setFont: function(){
        g.setFont('6x8:5x9'); // TODO this is a bottleneck. How to prepare the font once?
    },

//public:
    show: function(theMessage){
        console.log("theMessage is:");
        console.log(theMessage);
        xxl.msg = theMessage;
        // prepare string and metrics
        xxl.txt = xxl.msg.src + ": " + xxl.msg.body;
        xxl.setFont();
        xxl.wtot = g.stringMetrics(xxl.txt).width;
        xxl.xpos = 2 * g.getWidth();

        // get icon
        xxl.img = require("messageicons").getImage(xxl.msg);
        xxl.imgcol = require("messageicons").getColor(xxl.msg, '#ffffff');

        Bangle.loadWidgets();

        Bangle.on('touch', function (b, xy) {
            xxl.stop();
        });
        setWatch(xxl.stop, BTN1);
        Bangle.buzz(500,1);

        xxl.draw();
    },

//private:
    // schedule a draw for 30 FPS
    queueDraw: function() {
        if (xxl.drawTimeout) { return; } // clearTimeout(xxl.drawTimeout); }
            xxl.drawTimeout = setTimeout(function () {
            xxl.drawTimeout = undefined;
            xxl.draw();
        }, 33 - (Date.now() % 33));
    },


    stop:function() {
        console.log("stop");
        if (xxl.drawTimeout) { clearTimeout(xxl.drawTimeout); }
        xxl.drawTimeout = undefined;
        g.reset();
        g.setBgColor('#ffff00');
        g.clear();

        // Bangle.setLCDPower(0); // light off
        // Bangle.setLocked(true); // disable touch

        setTimeout(load, 100);
    },

    draw: function() {
        const wh = 24; // widgets height
        var gw = g.getWidth();
        var h = (g.getHeight() - wh)/2; // height of drawing area per stripe

        Bangle.setLCDPower(1); // light on
        Bangle.setLocked(false); // keep the touch input active
        g.setBgColor('#000000');
        g.clear();

        if (xxl.img) { // 24x24
            g.setColor(xxl.imgcol);
            g.drawImage(xxl.img
                        , gw/2, wh+h // center point
                        ,{rotate:0,scale:2}
                       );
        }

        xxl.setFont();
        g.setFontAlign(-1, -1);

        // draw both lines
        g.setBgColor('#000000');
        g.setColor('#ffffff');
        g.drawString(xxl.txt, xxl.xpos, wh);
        g.drawString(xxl.txt, xxl.xpos - gw - 32, h + wh);

        g.reset();
        // widget redraw
        Bangle.drawWidgets();

        // scroll
        xxl.xpos -= 25;
        if (xxl.xpos < -xxl.wtot - gw * 2) {
            ++xxl.loopCount;
            if (xxl.loopCount > 2) {
                xxl.stop();
                return;
            }
            xxl.xpos = 3 * gw;
        }
        // loop drawing
        xxl.queueDraw();
    }
};


// for IDE
// var exports={};

exports.listener = function (type, msg) {
    // msg = {t:"add",id:int, src,title,subject,body,sender,tel, important:bool, new:bool}
    if (!msg) return;
    if (type === 'text' && msg.t !== 'remove') {
        msg.handled = true; // don't do anything else with the message
        xxl.show(msg);
    }
};

// debug
// Bangle.on("message", (type, msg) => exports.listener(type, msg));





