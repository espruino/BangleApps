

var xxl = {
// private:
    msg: [],
    drawTimeout: undefined, // = undefined;
    xpos : 0,
    loopCount : 0,
//public:
    show: function(theMessage){
        xxl.msg = theMessage;
        xxl.xpos = 2 * g.getWidth();

        Bangle.loadWidgets();

        Bangle.on('touch', function (b, xy) {
            xxl.stop();
        });
        Bangle.buzz(500,1);
        xxl.draw();
    },
//private:
// schedule a draw for the next 30 FPS
    queueDraw: function() {
        if (xxl.drawTimeout) { return; } // clearTimeout(xxl.drawTimeout); }
            xxl.drawTimeout = setTimeout(function () {
            xxl.drawTimeout = undefined;
            xxl.draw();
        }, 17 - (Date.now() % 17));
    },

    
    stop:function() {
        if (xxl.drawTimeout) { clearTimeout(xxl.drawTimeout); }
        xxl.drawTimeout = undefined;
        g.reset();
        g.setBgColor('#ffff00');
        g.setColor('#ffffff');
        g.setFont('6x8:5x9');
        g.setFontAlign(0, 0);
        g.drawString('load...', 0, g.getHeight()/2);
        g.clear();
                   
        Bangle.setLCDPower(0); // light off
        Bangle.setLocked(true); // disable touch

        setTimeout(load, 1000);
    },

    draw: function() {
        Bangle.setLCDPower(1); // light on
        Bangle.setLocked(false); // keep the touch input active
        g.setBgColor(0, 0, 0);
        g.setColor(1, 1, 1);
        g.clear();

        // g.setFontLECO1976Regular42();
        g.setFont('6x8:5x9');
        g.setFontAlign(-1, -1);


        var gw = g.getWidth();
        var text = xxl.msg.title + ': ' + xxl.msg.body;
        var wtot = g.stringMetrics(text).width;

        g.setBgColor('#000000');

        g.setColor('#ffffff');
        wh = 24; // widgets height
        h = g.getHeight() - wh;
        g.drawString(text, xxl.xpos, wh);// widgets height
        g.drawString(text, xxl.xpos - gw - 32, h / 2 + wh);

        g.reset();
        xxl.xpos -= 6;
        if (xxl.xpos < -wtot - gw * 2) {
            ++xxl.loopCount;
            if (xxl.loopCount > 2) {
                xxl.stop();
            }
            xxl.xpos = 3 * gw;
        }

        // widget redraw
        Bangle.drawWidgets();
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
// var mymsg = {t:'add', new:true, handled:false, title:'SMS', body:'Hello World'};
// exports.listener('text', mymsg);





