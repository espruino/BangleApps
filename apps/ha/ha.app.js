/**
 * This app uses the ha library to send trigger to HomeAssistant.
 */
var ha = require("ha.lib.js");
var W = g.getWidth(), H = g.getHeight();
var position=0;
var triggers = ha.getTriggers();


function draw() {
  g.reset().clearRect(Bangle.appRect);

  var h = 22;
  g.setFont("Vector", h);
  var trigger = triggers[position];
  var w = g.stringWidth(trigger.display);

  g.setFontAlign(-1,-1);
  var icon = trigger.getIcon();
  g.setColor(g.theme.fg).drawImage(icon, 12, H/5-2-5);
  g.drawString("Home", icon.width + 20, H/5-5);
  g.drawString("Assistant", icon.width + 18, H/5+24-5);

  g.setFontAlign(0,0);
  var ypos = H/5*3+23;
  g.drawRect(W/2-w/2-8, ypos-h/2-8, W/2+w/2+5, ypos+h/2+5);
  g.fillRect(W/2-w/2-6, ypos-h/2-6, W/2+w/2+3, ypos+h/2+3);
  g.setColor(g.theme.bg).drawString(trigger.display, W/2, ypos);

  // draw arrows
  g.setColor(g.theme.fg);
  if (position > 0) {
    g.drawLine(10, H/2, 20, H/2 - 10);
    g.drawLine(10, H/2, 20, H/2 + 10);
  }
  if (position < triggers.length -1) {
    g.drawLine(W - 10, H/2, W - 20, H/2 - 10);
    g.drawLine(W - 10, H/2, W - 20, H/2 + 10);
  }
}

function toLeft() {
    Bangle.buzz(40, 0.6);
    position -= 1;
    position = position < 0 ? triggers.length-1 : position;
    draw();
}
function toRight() {
    Bangle.buzz(40, 0.6);
    position += 1;
    position = position >= triggers.length ? 0 : position;
    draw();
}
function sendTrigger() {
    ha.sendTrigger("TRIGGER");

    // Now send the selected trigger
    Bangle.buzz(80, 0.6).then(()=>{
      ha.sendTrigger(triggers[position].trigger);
      setTimeout(()=>{
        Bangle.buzz(80, 0.6);
      }, 250);
    });
}

Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isLeft){
    toLeft();
  }
  if(isRight){
    toRight();
  }
  if(!isRight && !isLeft){
    sendTrigger();
  }
});

Bangle.on("swipe", (lr,ud) => {
    if (lr == -1) {
      toLeft();
    }
    if (lr == 1) {
      toRight();
    }
  });


// Send intent that the we started the app.
ha.sendTrigger("APP_STARTED");

// Next load the widgets and draw the app
Bangle.loadWidgets();
Bangle.drawWidgets();

// Draw app
draw();
setWatch(_=>load(), BTN1);
