// adapted from https://github.com/hallettj/Fuzzy-Text-International/
{
  const SETTINGS_FILE = "fuzzyw.settings.json";

  let fuzzy_string = {
  "hours":[
    /*LANG*/"twelve",
    /*LANG*/"one",
    /*LANG*/"two",
    /*LANG*/"three",
    /*LANG*/"four",
    /*LANG*/"five",
    /*LANG*/"six",
    /*LANG*/"seven",
    /*LANG*/"eight",
    /*LANG*/"nine",
    /*LANG*/"ten",
    /*LANG*/"eleven"
  ],
  "minutes":[
    /*LANG*/"*$1 o'clock",
    /*LANG*/"five past *$1",
    /*LANG*/"ten past *$1",
    /*LANG*/"quarter past *$1",
    /*LANG*/"twenty past *$1",
    /*LANG*/"twenty five past *$1",
    /*LANG*/"half past *$1",
    /*LANG*/"twenty five to *$2",
    /*LANG*/"twenty to *$2",
    /*LANG*/"quarter to *$2",
    /*LANG*/"ten to *$2",
    /*LANG*/"five to *$2"
  ]
  };

  let text_scale = 4;
  let timeout = 2.5*60;
  let drawTimeout;
  let animInterval;
  let time_string = "";
  let time_string_old = "";
  let time_string_old_wrapped = "";
  let settings = {};

  let loadSettings = function() {
    settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'showWidgets': false, 'animate': true};
  };

  let queueDraw = function(seconds) {
    let millisecs = seconds * 1000;
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, millisecs - (Date.now() % millisecs));
  };

  let getTimeString = function(date) {
    let segment = Math.round((date.getMinutes()*60 + date.getSeconds() + 1)/300);
    let hour = date.getHours() + Math.floor(segment/12);
    // add "" to load into RAM due to 2v21 firmware .replace on flashstring issue
    let f_string = ""+fuzzy_string.minutes[segment % 12]; 
    if (f_string.includes('$1')) {
      f_string = f_string.replace('$1', fuzzy_string.hours[(hour) % 12]);
    } else {
      f_string = f_string.replace('$2', fuzzy_string.hours[(hour + 1) % 12]);
    }
    return f_string;
  };

  let draw = function() {
    time_string = getTimeString(new Date()).replace('*', '');
    //print(time_string);
    if (time_string != time_string_old) {
      g.setFont('Vector', R.h/text_scale).setFontAlign(0, 0);
      if (settings.animate) {
        animate(3);
      } else {
        quickDraw();
      }
    }
    queueDraw(timeout);
  };

  let animate = function(step) {
    if (animInterval) clearInterval(animInterval);
    let time_string_new_wrapped = g.wrapString(time_string, R.w).join("\n");
    let slideX = 0;
    //don't let pulling the drawer change y
    let text_y = R.y + R.h/2;
    animInterval = setInterval(function() {
      //blank old time
      g.setColor(g.theme.bg);
      g.drawString(time_string_old_wrapped, R.x + R.w/2 + slideX, text_y);
      g.drawString(time_string_new_wrapped, R.x - R.w/2 + slideX, text_y);
      g.setColor(g.theme.fg);
      slideX += step;
      let stop = false;
      if (slideX>=R.w) {
        slideX=R.w;
        stop = true;
      }
      //draw shifted new time
      g.drawString(time_string_old_wrapped, R.x + R.w/2 + slideX, text_y);
      g.drawString(time_string_new_wrapped, R.x - R.w/2 + slideX, text_y);
      if (stop) {
        time_string_old = time_string;
        clearInterval(animInterval);
        animInterval=undefined;
        time_string_old_wrapped = time_string_new_wrapped;
      }
      //print(Math.round((getTime() - time_start)*1000));
    }, 30);
  };

  let quickDraw = function() {
    let time_string_new_wrapped = g.wrapString(time_string, R.w).join("\n");
    g.setColor(g.theme.bg);
    g.drawString(time_string_old_wrapped, R.x + R.w/2, R.y + R.h/2);
    g.setColor(g.theme.fg);
    g.drawString(time_string_new_wrapped, R.x + R.w/2, R.y + R.h/2);
    time_string_old_wrapped = time_string_new_wrapped;
  };

  g.clear();
  loadSettings();

  // Stop updates when LCD is off, restart when on
  Bangle.on('lcdPower',on=>{
    if (on) {
      draw(); // draw immediately, queue redraw
    } else { // stop draw timer
      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = undefined;
    }
  });

  Bangle.setUI({
    mode : 'clock',
    remove : function() {
      // Called to unload all of the clock app
      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = undefined;
      if (animInterval) clearInterval(animInterval);
      animInterval = undefined;
      require('widget_utils').show(); // re-show widgets
    }
  });

  Bangle.loadWidgets();
  if (settings.showWidgets) {
    Bangle.drawWidgets();
  } else {
    require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
  }

  let R = Bangle.appRect;
  draw();
}
