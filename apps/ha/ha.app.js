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
  g.setColor(g.theme.fg).drawImage(icon, 12, H/5-2);
  g.drawString("Home", icon.width + 20, H/5);
  g.drawString("Assistant", icon.width + 18, H/5+24);

  g.setFontAlign(0,0);
  var ypos = H/5*3+20;
  g.drawRect(W/2-w/2-8, ypos-h/2-8, W/2+w/2+5, ypos+h/2+5);
  g.fillRect(W/2-w/2-6, ypos-h/2-6, W/2+w/2+3, ypos+h/2+3);
  g.setColor(g.theme.bg).drawString(trigger.display, W/2, ypos);
}


Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isRight){
    Bangle.buzz(40, 0.6);
    position += 1;
    position = position >= triggers.length ? 0 : position;
    draw();
  }

  if(isLeft){
    Bangle.buzz(40, 0.6);
    position -= 1;
    position = position < 0 ? triggers.length-1 : position;
    draw();
  }

  if(!isRight && !isLeft){
    ha.sendTrigger("TRIGGER");

    // Now send the selected trigger
    Bangle.buzz(80, 0.6).then(()=>{
      ha.sendTrigger(triggers[position].trigger);
      setTimeout(()=>{
        Bangle.buzz(80, 0.6);
      }, 250);
    });
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
