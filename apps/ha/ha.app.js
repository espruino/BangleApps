/**
 * This app uses the ha library to send trigger to HomeAssistant.
 */
var ha = require("ha.lib.js");
var W = g.getWidth(), H = g.getHeight();
var position=0;
var triggers = ha.getTriggers();
var slider;

function draw() {
  g.reset().clearRect(Bangle.appRect);

  var h = 22;
  g.setFont("Vector", h);
  var trigger = triggers[position];
  var w = g.stringWidth(trigger.display);

  g.setFontAlign(-1,-1);
  var icon = trigger.getIcon();
  var iconY = H / 5 - 2 - 5;
  g.setColor(g.theme.fg).drawImage(icon, 12, iconY);

  if (trigger.value) {
    if (!slider) {
      const R = Bangle.appRect;
      console.log("R", R);
      const w = 50;

      slider = require("Slider").create(onSlide, {
        initLevel: 0, // TODO: fetch this?

        mode: "map",
        steps: 100,
        timeout: false,

        width: w,
        xStart: R.w / 2 - w / 2,
        yStart: R.y,
        height: R.h - 24,

        dragRect: {
          x: R.w * 0.3,
          x2: R.w * 0.6,
          y: R.y,
          y2: R.h,
        },
      });
      Bangle.prependListener('drag', slider.f.dragSlider);
    }

    const r = slider.c.borderRect;
    g.setColor(g.theme.fg)
      .setFontAlign(0, 0)
      .drawString("HA", (r.x + r.w + W) / 2, iconY + g.imageMetrics(icon).height / 2)
      .setFontAlign(0, 1)
      .drawString(trigger.display, W / 2, H);

    slider.f.draw(slider.v.level);
  }else{
    if (slider) {
      slider.f.remove();
      slider = undefined;
    }

    g.drawString("Home", icon.width + 20, H/5-5);
    g.drawString("Assistant", icon.width + 18, H/5+24-5);

    g.setFontAlign(0,0);
    var ypos = H/5*3+23;
    g.drawRect(W/2-w/2-8, ypos-h/2-8, W/2+w/2+5, ypos+h/2+5);
    g.fillRect(W/2-w/2-6, ypos-h/2-6, W/2+w/2+3, ypos+h/2+3);
    g.setColor(g.theme.bg).drawString(trigger.display, W/2, ypos);
  }

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

var lastLevel;
var lastTouch;

function onSlide(mode, level, e) {
  lastTouch = Date.now();

  if (!e) return;

  if (e.b !== 0) {
    if (lastLevel == null)
      lastLevel = level;
  } else {
    if (lastLevel != null && lastLevel !== level) {
      // we've had a drag and level has changed
      ha.sendValue(triggers[position].trigger, level);
      lastLevel = null;
      Bangle.buzz(80, 0.6);
    }
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

Bangle.on('touch', (btn, e) => {
  if (Date.now() - lastTouch < 250) return;
  lastTouch = Date.now();

  var left = g.getWidth() * 0.3;
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isLeft){
    toLeft();
  }else if (isRight){
    toRight();
  }else{
    sendTrigger();
  }
});

Bangle.on("swipe", (lr,ud) => {
  if (slider) return; // "disable" swiping on sliders
  if (Date.now() - lastTouch < 250) return;
  lastTouch = Date.now();

  if (lr == -1) {
    toLeft();
  } else if (lr == 1) {
    toRight();
  }
  E.stopEventPropagation && E.stopEventPropagation();
});


// Send intent that the we started the app.
ha.sendTrigger("APP_STARTED");

// Next load the widgets and draw the app
Bangle.loadWidgets();
Bangle.drawWidgets();

// Draw app
draw();
setWatch(_=>load(), BTN1);
