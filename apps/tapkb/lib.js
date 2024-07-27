exports.input = function(options) {
  options = options||{};
  var text = options.text;
  if ("string"!=typeof text) text="";

var layer = 0;
var caps = 0;

class keyPad {
  constructor(x1, y1, x2, y2, func) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.func = !func ? "" : func;
  }

  draw() {
    g.setColor(g.theme.fg).drawRect(this.x1, this.y1, this.x2, this.y2).clearRect(this.x1+1, this.y1+1, this.x2-1, this.y2-1).setFont("6x8",2).setFontAlign(0, 0, 0).drawString(this.func, (((this.x2-this.x1)/2)+this.x1), (((this.y2-this.y1)/2)+this.y1));
  }

  onTouch(xy) {
    if (this.func == "space") text += " ";
    else if (this.func == "<-") text = text.slice(0, -1);
    else if (this.func == "new\nline") text += String.fromCharCode(182);
    else if (this.func == "caps") {
      caps = 1;
      renderKeys();
    }
    else if (this.func == "Caps") {
      caps = 2;
      renderKeys();
    }
    else if (this.func == "CAPS") {
      caps = 0;
      renderKeys();
    }
    else {
      text += this.func;
      if (caps == 1) caps = 0;
    }
    g.clearRect(25, 0, g.getWidth(), 25).setFontAlign(-1, -1).drawString(text.substring(text.length-12, text.length)+"_", 25, 7);
  }
}

function renderKeys() {
  var a;
  var i;
  if (layer == 0) {
    if (caps == 0) {
      a = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "caps", "space", "<-"];
    }
    else a = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "Caps", "space", "<-"];
    if (caps == 2) a[9] = "CAPS";
    for (i = 0; i < a.length; i++) {
      pad[i].func = a[i];
    }
  }
  else if (layer == 1) {
    if (caps == 0) {
      a = ["j", "k", "l", "m", "n", "o", "p", "q", "r", "caps", "space", "<-"];
    }
    else a = ["J", "K", "L", "M", "N", "O", "P", "Q", "R", "Caps", "space", "<-"];
    if (caps == 2) a[9] = "CAPS";
    for (i = 0; i < a.length; i++) {
      pad[i].func = a[i];
    }
  }
  else if (layer == 2) {
    if (caps == 0) {
      a = ["s", "t", "u", "v", "w", "x", "y", "z", "0", "caps", "space", "<-"];
    }
    else a = ["S", "T", "U", "V", "W", "X", "Y", "Z", "0", "Caps", "space", "<-"];
    if (caps == 2) a[9] = "CAPS";
    for (i = 0; i < a.length; i++) {
      pad[i].func = a[i];
    }
  }
  else if (layer == 3) {
    if (caps == 0) {
      a = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "caps", "space", "<-"];
    }
    else a = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Caps", "space", "<-"];
    if (caps == 2) a[9] = "CAPS";
    for (i = 0; i < a.length; i++) {
      pad[i].func = a[i];
    }
  }
  else if (layer == 4) {
    if (caps == 0) {
      a = [".", ",", "?", "!", "(", ")", "-", "\'", "new\nline", "caps", "space", "<-"];
    }
    else a = ["-", "+", "/", "*", ":", "#", "$", "%", "new\nline", "Caps", "space", "<-"];
    if (caps == 2) a[9] = "CAPS";
    for (i = 0; i < a.length; i++) {
      pad[i].func = a[i];
    }
  }

  for (var j = 0; j < pad.length; j++) {
    pad[j].draw();
  }
}

var pad = [];
pad[0] = new keyPad(0, 29, 57, 64);
pad[1] = new keyPad(59, 29, 116, 64);
pad[2] = new keyPad(118, 29, 175, 64);
pad[3] = new keyPad(0, 66, 57, 101);
pad[4] = new keyPad(59, 66, 116, 101);
pad[5] = new keyPad(118, 66, 175, 101);
pad[6] = new keyPad(0, 103, 57, 138);
pad[7] = new keyPad(59, 103, 116, 138);
pad[8] = new keyPad(118, 103, 175, 138);
pad[9] = new keyPad(0, 140, 57, 175);
pad[10] = new keyPad(59, 140, 116, 175);
pad[11] = new keyPad(118, 140, 175, 175);
g.clear();
renderKeys();

var drag;

return new Promise((resolve,reject) => {

  Bangle.setUI({mode:"custom", drag:e=>{
  if (!drag) { // start dragging
    drag = {x: e.x, y: e.y};
  } 
  else if (!e.b) { // released
    const dx = e.x-drag.x, dy = e.y-drag.y;
    drag = null;
    //horizontal swipes
    if (Math.abs(dx)>Math.abs(dy)+10) {
      //swipe left
      if (dx<0) layer == 4 ? layer = 0 : layer++;
      //swipe right
      if (dx>0) layer == 0 ? layer = 4 : layer--;
    }
  }
  renderKeys();
  },touch:(button, xy)=>{
    for (var i = 0; i < pad.length; i++) {
      if ((xy.x >= pad[i].x1) && (xy.x <= pad[i].x2) && (xy.y >= pad[i].y1) && (xy.y <= pad[i].y2)) {
        pad[i].onTouch(xy);
        i = pad.length;
      }
    }
  },back:()=>{
    Bangle.setUI();
    g.clear();
    resolve(text.replace(new RegExp(String.fromCharCode(182), 'g'), '\n'));
  }});
  g.clearRect(25, 0, g.getWidth(), 25).setColor(g.theme.fg).setFont("6x8", 2);
  if (text == "") g.setFontAlign(0, -1).drawString("<-Swipe->", g.getWidth()/2, 7);
  else {
    text = text.replace(/\n/g, String.fromCharCode(182));
    g.setFontAlign(-1, -1).drawString(text.substring(text.length-12, text.length)+"_", 25, 7);
  }
});

};
