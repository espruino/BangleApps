(() => {
    let intervalRef = null;
    var width = 5 * 6*2
    var xpos = WIDGETPOS.tr - width;
    WIDGETPOS.tr -= (width + 2);
    
    function draw() {
        // Widget	(0,0,239,23)
        let date = new Date();
        var dateArray = date.toString().split(" ");
        g.setColor(1,1,1);
        g.setFont("6x8", 2);
        g.setFontAlign(-1, 0);
        g.drawString(dateArray[4].substr(0, 5), xpos, 11, true); // 5 * 6*2 = 60
        g.flip();
    }
    function clearTimers(){
        if(intervalRef) {
            clearInterval(intervalRef);
            intervalRef = null;
        }
    }
    function startTimers(){
        if(intervalRef) clearTimers();
        intervalRef = setInterval(draw, 60*1000);
        draw();
    }
    Bangle.on('lcdPower', (on) => {
        if (on) {
            // startTimers(); // comment out as it is called by app anyway
        } else {
            clearTimers();
        }
    });

    // add your widget
    WIDGETS["wdclk"]={draw:startTimers};

})()