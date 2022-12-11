// adapted from https://github.com/hallettj/Fuzzy-Text-International/

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

let text_scale = 3.5;
let timeout = 2.5*60;
let drawTimeout;

function queueDraw(seconds) {
  let millisecs = seconds * 1000;
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, millisecs - (Date.now() % millisecs));
}

const h = g.getHeight();
const w = g.getWidth();

function getTimeString(date) {
  let segment = Math.round((date.getMinutes()*60 + date.getSeconds() + 1)/300);
  let hour = date.getHours() + Math.floor(segment/12);
  f_string = fuzzy_string.minutes[segment % 12];
  if (f_string.includes('$1')) {
    f_string = f_string.replace('$1', fuzzy_string.hours[(hour) % 12]);
  } else {
    f_string = f_string.replace('$2', fuzzy_string.hours[(hour + 1) % 12]);
  }
    return f_string;
}

function draw() {
  let time_string = getTimeString(new Date()).replace('*', '');
  // print(time_string);
  g.setFont('Vector', (h-24*2)/text_scale);
  g.setFontAlign(0, 0);
  g.clearRect(0, 24, w, h-24);
  g.setColor(g.theme.fg);
  g.drawString(g.wrapString(time_string, w).join("\n"), w/2, h/2);
  queueDraw(timeout);
}

g.clear();
draw();

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI('clock');
Bangle.loadWidgets();
Bangle.drawWidgets();
