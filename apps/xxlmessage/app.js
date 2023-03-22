
var drawTimeout; // = undefined;
var xpos = 2*g.getWidth();
var loopCount=0;

// schedule a draw for the next 30 FPS
function queueDraw() {
    if (drawTimeout) {clearTimeout(drawTimeout);}
    drawTimeout = setTimeout(function() {
        drawTimeout = undefined;
        draw();
    }, 32 - (Date.now() % 32));
}

function drawBackground() {
    g.setBgColor(0,0,0);
    g.setColor(1,1,1);
    g.clear();
}

function stop(){
    if (drawTimeout) {clearTimeout(drawTimeout);}
    load();
}

function draw(){
    Bangle.setLocked(false); // keep the touch input active
    drawBackground();

    // g.setFontLECO1976Regular42();
    g.setFont('6x8:5x10');
    g.setFontAlign(-1, -1);


    var gw = g.getWidth();
    var text = "This is a test with a longer message to try...";
    var wtot = g.stringMetrics(text).width;

    g.setBgColor('#000000');
    // shadow - just wastes battery
    // g.setColor('#ff0000');
    // g.drawString(text, 3+xpos, 3);
    // g.drawString(text, 3+xpos-gw-32, 3+g.getHeight()/2);

    g.setColor('#ffffff');
    g.drawString(text, xpos, 0);
    g.drawString(text, xpos-gw-32, g.getHeight()/2);

    g.reset();
    xpos -= 3;
    if(xpos < -wtot-gw*2 ) {
        ++loopCount;
        if(loopCount > 2){
            stop();
        }
        xpos=3*gw;
    }


    // widget redraw
    Bangle.drawWidgets();
    queueDraw();
}

Bangle.loadWidgets();
// draw();


Bangle.on("message", (type, msg) => {
    if (!msg) return;
    if(type === 'text' && msg.t !== 'remove'){
        msg.handled = true; // don't do anything else with the message
        draw();
    }
});


// 
// Bangle.on('lcdPower',on=>{
//   if (on) {
//     draw(); // draw immediately, queue redraw
//   } else { // stop draw timer
//     if (drawTimeout) clearTimeout(drawTimeout);
//     drawTimeout = undefined;
//   }
// });

Bangle.on('touch', function(b,xy){
    stop();
});


Bangle.setUI("clock");

Bangle.drawWidgets();