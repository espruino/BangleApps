exports.input = function(options) {
  options = options || {};
  let text = options.text;
  if ("string"!= typeof text) text = "";
  let code = "",
    cur = text.length,  // cursor position
    uc = !text.length,  // uppercase
    spc = 0;  // consecutive spaces entered

  const codes = {
    // letters
    "a": ".-",
    "b": "-...",
    "c": "-.-.",
    "d": "-..",
    "e": ".",
    // no é
    "f": "..-.",
    "g": "--.",
    "h": "....",
    "i": "..",
    "j": ".---",
    "k": "-.-",
    "l": ".-..",
    "m": "--",
    "n": "-.",
    "o": "---",
    "p": ".--.",
    "q": "--.-",
    "r": ".-.",
    "s": "...",
    "t": "-",
    "u": "..-",
    "v": "...-",
    "w": ".--",
    "x": "-..-",
    "y": "-.--",
    "z": "--..",
    //digits
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    "0": "-----",
    // punctuation
    ".": ".-.-.-",
    ",": "--..--",
    ":": "---...",
    "?": "..--..",
    "!": "-.-.--",
    "'": ".----.",
    "-": "-....-",
    "_": "..--.-",
    "/": "-..-.",
    "(": "-.--.",
    ")": "-.--.-",
    "\"": ".-..-.",
    "=": "-...-",
    "+": ".-.-.",
    "*": "-..-",
    "@": ".--.-.",
    "$": "...-..-",
    "&": ".-...",
  }, chars = Object.keys(codes);

  function choices(start) {
    return chars.filter(char => codes[char].startsWith(start));
  }
  function char(code) {
    if (code==="") return " ";
    for(const char in codes) {
      if (codes[char]===code) return char;
    }
    const c = choices(code);
    if (c.length===1) return c[0]; // "-.-.-" is nothing, and only "-.-.--"(!) starts with it
    return null;
  }

  return new Promise((resolve, reject) => {
    const Layout = require("Layout");
    let layout = new Layout({
      type: "h", c: [
        {
          type: "v", width: Bangle.appRect.w-8, bgCol: g.theme.bg, c: [
            {id: "dots", type: "txt", font: "6x8:2", label: "", fillx: 1, bgCol: g.theme.bg},
            {filly: 1, bgCol: g.theme.bg},
            {
              type: "h", fillx: 1, c: [
                {id: "del", type: "txt", font: "6x8", label: "<X"},
                {width: 5, bgCol: g.theme.bg},
                {id: "text", type: "txt", font: "6x8:2", col: g.theme.fg2, bgCol: g.theme.bg2},
                {fillx: 1, bgCol: g.theme.bg},
                {id: "code", type: "txt", font: "6x8", label: "", bgCol: g.theme.bg},
                {width: 5, bgCol: g.theme.bg},
                {id: "pick", type: "txt", font: "6x8:3", label: "", col: g.theme.fgH, bgCol: g.theme.bgH},
              ],
            },
            {filly: 1, bgCol: g.theme.bg},
            {id: "dashes", type: "txt", font: "6x8:2", label: "", fillx: 1, bgCol: g.theme.bg},
          ]
        },
        // button labels (rotated 90 degrees)
        {
          type: "v", pad: 1, filly: 1, c: ["<.", "^", "|"].map(l =>
            ({type: "txt", font: "6x8", height: Math.floor(Bangle.appRect.h/3), r: 1, label: l})
          )
        }
      ]
    });

    function update() {
      let dots = [], dashes = [];
      layout.pick.label = (code==="" ? " " : "");
      choices(code).forEach(char => {
        const c = codes[char];
        if (c===code) {
          layout.pick.label = char;
        }
        const next = c.substring(code.length, code.length+1);
        if (next===".") dots.push(char);
        else if (next==="-") dashes.push(char);
      });
      if (!code && spc>1) layout.pick.label = atob("ABIYAQAAAAAAAAAABwABwABwABwABwABwOBwOBwOBxwBxwBxwB/////////xwABwABwAAOAAOAAOAA==");
      g.setFont("6x8:2");
      const wrap = t => g.wrapString(t, Bangle.appRect.w-60).join("\n");
      layout.del.label = cur ? atob("AAwIAQ/hAiKkEiKhAg/gAA==") : "  ";
      layout.code.label = code;
      layout.dots.label = wrap(dots.join(" "));
      layout.dashes.label = wrap(dashes.join(" "));
      if (uc) {
        layout.pick.label = layout.pick.label.toUpperCase();
        layout.dots.label = layout.dots.label.toUpperCase();
        layout.dashes.label = layout.dashes.label.toUpperCase();
      }
      let label = text.slice(0, cur)+"|"+text.slice(cur);
      layout.text.label = g.wrapString(label, Bangle.appRect.w-80).join("\n")
        .replace("|", atob("AAwQAfPPPAwAwAwAwAwAwAwAwAwAwAwAwPPPPA=="));
      layout.update();
      layout.render();
    }

    function add(d) {
      code += d;
      const l = choices(code).length;
      if (l===1) done();
      else if (l<1) {
        Bangle.buzz(20);
        code = code.slice(0, -1);
      } else update();
    }
    function del() {
      if (code.length) code = code.slice(0, -1); // delete last dot/dash
      else if (cur) { // delete char at cursor
        text = text.slice(0, cur-1)+text.slice(cur);
        cur--;
      } else Bangle.buzz(20); // (already) at start of text
      spc = 0;
      uc = false;
      update();
    }

    function done() {
      let c = char(code);
      if (c!==null) {
        if (uc) c = c.toUpperCase();
        uc = false;
        text = text.slice(0, cur)+c+text.slice(cur);
        cur++;
        code = "";
        if (c===" ") spc++;
        else spc = 0;
        if (spc>=3) {
          text = text.slice(0, cur-3)+"\n"+text.slice(cur);
          cur -= 2;
          uc = true;
          spc = 0;
        }
        update();
      } else {
        console.log(`No char for ${code}!`);
        Bangle.buzz(20);
      }
    }

    g.reset().clear();
    update();

    if (Bangle.btnWatches) Bangle.btnWatches.forEach(clearWatch);
    Bangle.btnWatches = [];

    // BTN1: press for dot, long-press to toggle uppercase
    let ucTimeout;
    const UC_TIME = 500;
    Bangle.btnWatches.push(setWatch(e => {
      if (ucTimeout) clearTimeout(ucTimeout);
      ucTimeout = null;
      if (e.state) {
        // pressed: start UpperCase toggle timer
        ucTimeout = setTimeout(() => {
          ucTimeout = null;
          uc = !uc;
          update();
        }, UC_TIME);
      } else if (e.time-e.lastTime<UC_TIME/1000) add(".");
    }, BTN1, {repeat: true, edge: "both"}));

    // BTN2: press to pick current character, long press to enter text
    let enterTimeout;
    const ENTER_TIME = 1000;
    Bangle.btnWatches.push(setWatch(e => {
      if (enterTimeout) clearTimeout(enterTimeout);
      enterTimeout = null;
      if (e.state) {
        // pressed: start UpperCase toggle timer
        enterTimeout = setTimeout(() => {
          enterTimeout = null;
          resolve(text);
        }, ENTER_TIME);
      } else if (e.time-e.lastTime<ENTER_TIME/1000) done();
    }, BTN2, {repeat: true, edge: "both"}));

    // BTN3: press for dash (long-press is hardcoded to device reboot)
    Bangle.btnWatches.push(setWatch(() => {
      add("-");
    }, BTN3, {repeat: true, edge: "falling"}));

    // Left-hand side: backspace
    if (Bangle.touchHandler) Bangle.removeListener("touch", Bangle.touchHandler);
    Bangle.touchHandler = side => {
      if (side===1) del();
    };
    Bangle.on("touch", Bangle.touchHandler);

    // swipe: move cursor
    if (Bangle.swipeHandler) Bangle.removeListener("swipe", Bangle.swipeHandler);
    Bangle.swipeHandler = dir => {
      cur = Math.max(0, Math.min(text.length, cur+dir));
      update();
    };
    Bangle.on("swipe", Bangle.swipeHandler);
  });
};
