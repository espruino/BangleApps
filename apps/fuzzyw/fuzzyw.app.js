
// adapted from https://github.com/hallettj/Fuzzy-Text-International/
const fuzzy_strings = {
    en_GB:{
      hours:[
        // AM hours
        "midnight", "one", "two", "three", "four", "five",
        "six", "seven", "eight", "nine", "ten", "eleven",
        // PM hours
        "twelve", "one", "two", "three", "four", "five",
        "six", "seven", "eight", "nine", "ten", "eleven"
      ],
      minutes:[
        "*$1 o'clock",
        "five past *$1",
        "ten past *$1",
        "quarter past *$1",
        "twenty past *$1",
        "twenty five past *$1",
        "half past *$1",
        "twenty five to *$2",
        "twenty to *$2",
        "quarter to *$2",
        "ten to *$2",
        "five to *$2"
      ],
      text_scale:3.5,
    },
  };

  //const SETTINGS_FILE = "fuzzyw.settings.json";
  //let settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'language': 'en_GB'};

  //let fuzzy_string = fuzzy_strings[settings.language];
  let fuzzy_string = fuzzy_strings['en_GB'];

  const h = g.getHeight();
  const w = g.getWidth();

  function getTimeString(date) {
    let segment = Math.round((date.getMinutes()*60 + date.getSeconds())/300);
    let hour = date.getHours() + Math.floor(segment/12);
    f_string = fuzzy_string.minutes[segment % 12];
    if (f_string.includes('$1')) {
      f_string = f_string.replace('$1', fuzzy_string.hours[(hour) % 24]);
    } else {
      f_string = f_string.replace('$2', fuzzy_string.hours[(hour + 1) % 24]);
    }
    return f_string;
  }

  function draw() {
    let time_string = getTimeString(new Date()).replace('*', '');
    // print(time_string);
    g.setFont('Vector', (h-24*2)/fuzzy_string.text_scale);
    g.setFontAlign(0, 0);
    g.clearRect(0, 24, w, h-24);
    g.setColor(g.theme.fg);
    g.drawString(g.wrapString(time_string, w).join("\n"), w/2, h/2);
  }

  g.clear();
  draw();
  setInterval(draw, 10000); // refresh every 10s

  // Stop updates when LCD is off, restart when on
  Bangle.on('lcdPower',on=>{
    if (secondInterval) clearInterval(secondInterval);
    secondInterval = undefined;
    if (on) {
      secondInterval = setInterval(draw, 10000);
      draw(); // draw immediately
    }
  });

  Bangle.setUI('clock');
  Bangle.loadWidgets();
  Bangle.drawWidgets();
