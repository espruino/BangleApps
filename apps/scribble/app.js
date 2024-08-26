const black = "#000000";
const white = "#ffffff";
//const gray1 = "#444444";
const gray2 = "#888888";
//const gray3 = "#bbbbbb";

const red = "#FF0000";
//const green = "#00FF00";
//const blue = "#0000FF";

const transp = -1;
const abc = "abcdefghijklmnopqrstuvwxyz1234567890";
// const abc_up = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
const uppercase = 1;
var last_layer = false;   // set to true at the last layer of the tree
let chunk_size = 6;

const font_height = 2;
const global_font = "Dennis8";
require("FontDennis8").add(Graphics);

const editable_buf = "Scribble";

const left = 3;
const _screen_mid = g.getWidth() / 2;
//const right = 176 - 4;

const box_size = {
  w: _screen_mid - 6,
  h: 46,
};

const spacing = 4;
//const border = 4;
const top_start = 25;

const pos_y = [
  top_start,
  top_start + (box_size.h + spacing),
  top_start + (box_size.h + spacing) * 2,
];

// list of points to render
const points = {
  "3x2": [{ x: left, y: pos_y[0] },
  { x: left, y: pos_y[1] },
  { x: left, y: pos_y[2] },
  { x: _screen_mid + 2, y: pos_y[0] },
  { x: _screen_mid + 2, y: pos_y[1] },
  { x: _screen_mid + 2, y: pos_y[2] },
  ]
};

g.theme = {
  fg: white,
  bg: black,
  fg2: white,
  bg2: black,
  fgH: black,
  bgH: red,
  dark: false,
};

const maxX = g.getWidth();
const maxY = g.getHeight();
//const fontSize = g.getWidth() > 200 ? 2 : 1;
const rowN = 7;
const colN = 7;
const headerH = maxY / 7;
//const rowH = (maxY - headerH) / rowN;
//const colW = maxX / colN;

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

class Window {
  constructor(label, bgCol) {
    this.label = "win_"
    this.label += (typeof label !== "undefined") ? label : "Unset";
    console.log(`Constructing Window ${this.label}, args: ${arguments}`)

    this.bgCol = bgCol;
    this.layers = [];
  }

  push(layer) {
    layer.label=`${this.layers.length}_${layer.label}`;
    this.layers.push(layer);
  }
  pop() {
    this.layers.pop();
  }

  top_layer() {
    return this.layers[this.layers.length - 1];
  }

  render() {

    if (this.bgCol !== transp) {
      console.log(`${this.label}: filling bg in ${this.bgCol}`);
      g.setColor(this.bgCol);
      g.fillRect(0, 0, g.getWidth(), g.getHeight());
    }


    //let i = 0;
    this.layers.forEach((lyr) => {
      // console.log(`Rendering Layer ${i} ${lyr.label}`)
      //i++;
      lyr.render();
    });
  }
}

class Layer {
  constructor(label) {

    this.label = "lyr_"

    this.label += (typeof label !== "undefined") ? label : "Unset";
    console.log(`Constructing Layer ${this.label}, args: ${arguments}`)
    this.items = [];
    // console.log(`bg is ${bg} type ${typeof bg}`)

  }

  push(button) {
    this.items.push(button);
  }

  setLabel(label) {
    this.label = label;
  }

  parseTaps(xy) {
    this.items.forEach(item => {
      // // print(item)
      if (item.was_tapped(xy)) {
        // pass parent layer to the tapped button
        item.callback(this);
      }
    });
  }

  render() {

    this.items.forEach((item) => {

      item.render();
    });
  }
}

class BTN_layer extends Layer {

  constructor(label, layout) {
    super();
    Layer.call(this, label)

    this.alphabet = (uppercase) ? abc.toUpperCase() : abc;
    console.log(`Constructing BTN_Layer ${this.label}, layout ${this.layout}`)

    if (layout in points) {

      this.create_layout(layout);

    }
    else {
      throw `Invalid layout passed ->[${layout}]`;
    }

    // // print(this);

  }

  render() {

    Layer.prototype.render.call(this);
  }

  create_layout(layout) {

    console.log(`Creating layout ${layout}`);

    let start_p = 0;

    this.items = this.push_buttons(points[layout], this.alphabet, start_p, chunk_size)

  }

  push_buttons(points, in_string, start_p) {

    items = [];
    spacer = "" // char interposed b/w the two halves of text per button

    for (let i = 0; i < points.length; i++) {
      substr = `${in_string.substring(
        start_p,
        start_p + chunk_size / 2
      )}${spacer}${in_string.substring(start_p + chunk_size / 2, start_p + chunk_size)}`;

      btn_label =
        uppercase === 1
          ? substr.toUpperCase()
          : substr;

      start_p += chunk_size;

      items.push(
        new Button(
          i,                      // ID of button
          points[i].x,  // left 
          points[i].y,  // top
          btn_label,            // text to render in the button
          box_size.w,   // width
          box_size.h,   // height
          g.theme.bg,   // box bg
          white,   // box fill
          black   // text col
        )
      );
    }

    return items;
  }

  update_labels(in_string, start_p, chk_size) {
    // print(`Updating labels | in_string ${in_string} start_p ${start_p} chk_size ${chk_size}`);
    in_string.replace('\n', ''); // remove newlines just in case

    spacer = "" // char interposed b/w the two halves of text per button

    for (let i = 0; i < this.items.length; i++) {

      item = this.items[i];
      substr = (chk_size < 3)
        ? in_string.substring(start_p + chk_size * i, start_p + (chk_size * (i + 1)))
        : `${in_string.substring(
          start_p + chk_size * i,
          start_p + chk_size * i + chk_size / 2
        )}${spacer}${in_string.substring(start_p + chk_size * i + chk_size / 2, start_p + chk_size * i + chk_size)}`;
      // // print(`(chk_size > 3): ${(chk_size > 3)}`)
      // print(`Label ${i} -> ${substr}`);
      item.setLabel(substr);
    }

  }

  zoom_in(id) {
    let start_p = id * chunk_size;
    // print(`Zooming in | start_p ${start_p}`)
    if (chunk_size % this.items.length !== 0) {
      throw `Chunk size [${chunk_size}] does not fit #btns [${this.items.length}]`
    }
    subchunk_size = chunk_size / this.items.length;

    substr = this.alphabet.substring(start_p, start_p + chunk_size);
    // print(`substr ${substr}`);
    // print(`subchunk_size ${subchunk_size}`);
    this.update_labels(substr, 0, subchunk_size);

  }

}

class Button {
  constructor(id, x, y, text, w, h, col, bgCol, txtCol, font) {
    this.id = id;
    this.label = `btn_${this.id}`;

    this.text = text;
    this.x1 = x;
    this.y1 = y;
    this.w = w;
    this.h = h;
    this.col = typeof col !== "undefined" ? col : black;
    this.bgCol = typeof bgCol !== "undefined" ? bgCol : gray2;
    this.txtCol = typeof txtCol !== "undefined" ? txtCol : black;
    // this.font = font;
    
    this.x2 = this.x1 + this.w;
    this.y2 = this.y1 + this.h;
    this.center = {
      x: (this.x1 + this.x2) / 2,
      y: (this.y1 + this.y2) / 2,
    };
    

    console.log(`Constructed button `)
    // // print(this);
  }

  render() {
    // console.log(
    //   `Button ${this.text} -> P1: (${this.x1}, ${this.y1}) | P2: (${this.x2}, ${this.y2})`
    //   );

    g.setColor(this.bgCol);
    g.fillRect(this.x1, this.y1, this.x2, this.y2);
    g.setColor(this.col);
    g.drawRect(this.x1, this.y1, this.x2, this.y2);
    g.setColor(this.txtCol);

    g.setFontAlign(0, 0).setFont(global_font, font_height);
    g.drawString(this.text, this.center.x, this.center.y);
  }
  
  // short tap callback func
  callback(parent_layer) {
    // print(`Tapped button ${this.id}`);

    // this.highlight();  // TODO set up highlighting
    if (last_layer) {
      l_text.items[0].text += this.text;
      // print(`Updated buffer to ${l_text.items[0].text}`)
      parent_layer.update_labels(parent_layer.alphabet, 0, chunk_size);
      last_layer = false;
    }
    else {
      parent_layer.zoom_in(this.id);
      last_layer = true;
    }
  }

  was_tapped(xy) {
    var x = xy.x;
    var y = xy.y;

    if ((x > this.x1 && x < this.x2) && (y > this.y1 && y < this.y2)) {
      return true;
    }
    else {
      return false;
    }
  }

  setLabel(lbl) {
    // // print(`Button ${this.id}, updating label ${this.text} with ${lbl}`);
    this.text = lbl;
  }

  getLabel(lbl) {

    return this.label;
  }

  highlight() {

    g.setColor(g.theme.bgH);
    g.fillRect(this.x1, this.y1, this.x2, this.y2);
    g.setColor(g.theme.fgH);
    g.drawRect(this.x1, this.y1, this.x2, this.y2);
    g.setColor(this.fg);

    g.setFontAlign(0, 0).setFont(global_font, font_height);
    g.drawString(this.text, this.center.x, this.center.y);

  }

}

class TextBox {

  constructor(x, y, text, col) {

    // x and y are the center points
    this.x = x;
    this.y = y;
    this.text = text || "Default";
    this.col = col || red;

    // console.log(`Constr TextBox ${this.text} -> Center: (${this.x}, ${this.y}) | Col ${this.col}`);
  }

  render() {
    // console.log(`Rendering TextBox`)

    var align_center = (0, 1);
    var align_right = (0, 0);
    alignment = (g.stringWidth(this.text) < g.getWidth()) ? align_center : align_right;
    // coords = (g.stringWidth(this.text) < g.getWidth()- 20) ? {x:this.x, y:this.y} : {x:g.getWidth()-border, y:this.y}
    coords = { x: this.x, y: this.y };
    g.setColor(this.col);
    g.setFontAlign(0, 0).setFont(global_font, font_height);
    g.drawString(this.text, coords.x, coords.y);

  }
}

/* Screen refresh *************************************/

function draw(obj) {
  console.log("draw()");
  obj.render();
}

let tickTimer;

function clearTickTimer() {
  if (tickTimer) {
    clearTimeout(tickTimer);
    tickTimer = undefined;
  }
}

function queueNextTick() {
  clearTickTimer();
  tickTimer = setTimeout(tick, 5000);
}

function tick() {
  console.log("tick");
  draw(window);
  // queueNextTick();
}

/* Init **********************************************/

var window = new Window("abc", red);

var l_btns = new BTN_layer("btns", "3x2");

var l_text = new Layer("text");   // black

var box = new TextBox(
  _screen_mid,
  12,
  editable_buf,
  white
);

l_text.push(box);

window.push(l_text);
window.push(l_btns);

// Set up callbacks for touches

Bangle.on('touch', function (button, xy) {

  window.top_layer().parseTaps(xy);
  window.render();

});

Bangle.on('swipe', function (direction) {

  console.log(`Swipe dir ${direction}`);

  if (direction === -1) {  // left

    l_text.items[0].text = l_text.items[0].text.slice(0, -1);

  } else if (direction == 1) { // right

    l_text.items[0].text += ' ';

  }
  window.render();

});

// Clear the screen once, at startup
g.clear();

// Start ticking
tick();
