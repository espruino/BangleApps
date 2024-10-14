Graphics.prototype.setFontBebasNeue = function() {
  // Actual height 31 (32 - 2)
  // 1 BPP
  return this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAAAPgAAAAAD4AAAAAA+AAAAAAPgAAAAAD4AAAAAAAAAAAAAAgAAAAAA4AAAAAB+AAAAAD/gAAAAD/4AAAAH/4AAAAH/4AAAAP/wAAAAP/wAAAAf/gAAAAf/gAAAA//AAAAA/+AAAAAP+AAAAAD8AAAAAA8AAAAAAIAAAAAAAAAAAAAAAAAAAAAAf//8AAAf///wAAP///+AAH////wAD////+AA/////gAPgAAD4AD4AAA+AA+AAAPgAPgAAD4AD////+AAf////AAH////wAA////4AAH///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAADwAAAAAA8AAAAAAfAAAAAAHwAAAAAD////4AB////+AA/////gAP////4AD////+AA/////gAAAAAAAAAAAAAAAAAcAAHgAB/gA/4AA/4A/+AAf+Af/gAP/gP/4AD/wH/+AA+AD+PgAPgD+D4AD4B/A+AA+B/gPgAP//wD4AD//4A+AAf/8APgAD/8AD4AAf8AAeAAAAAAAAAAAAAAAAADgAfAAAH4AH8AAD+AB/wAB/gAf8AA/4AH/gAPwPgH4AD4D4A+AA+A+APgAPgPwD4AD8H+B+AA/////gAH////wAB//f/8AAP/j/+AAA/gf+AAAAAAAAAAAAAHgAAAAAP8AAAAAP/AAAAAP/wAAAAf/8AAAAf//AAAA//HwAAA/+B8AAA/+AfAAA/+AHwAAP////4AD////+AA/////gAP////4AD////+AAAAAHwAAAAAB8AAAAAAAAAAAAAAAAAAAAh4AAD//4fwAA//+H+AAP//h/wAD//4f+AA//+B/gAPgeAD4AD4PAA+AA+DwAPgAPh+AD4AD4f//+AA+D///gAPg///wAD4H//4AA8A//8AAAAAAAAAAAAAAAAAA///gAAB////AAA////4AAf////AAP////4AD////+AA+A8APgAPgfAD4AD4HwA+AA+B8APgAP8f//4AD/H//+AAfx///AAD8P//gAAfB//wAAAAB/AAAAAAAAAAAAAAAAAA8AAAAAAPgAAAAAD4AAACAA+AAAHgAPgAAf4AD4AA/+AA+AD//gAPgH//4AD4P//wAA+///gAAP//+AAAD//8AAAA//wAAAAP/AAAAAD+AAAAAAAAAAAAAAAAAAAAAH4D/gAAH/j/+AAD/9//wAB////8AA/////gAP9/4H4AD4D8A+AA+A+APgAPgPgD4AD4D8A+AA/////gAP////4AB////8AAP/3/+AAB/4f/AAAAAA+AAAAAAAAAAAAAAAAAAH/wHAAAH//B8AAH//4fwAB///H8AA///x/gAPwH8H4AD4AfA+AA+AHwPgAPgB4D4AD4A+B+AA/////gAH////wAB////8AAP///+AAA///+AAAAAAAAAAAAAAAAAAAAAAAAAAPgA+AAAD4APgAAA+AD4AAAPgA+AAAD4APgAAAAAAAAA'),
    46,
    atob("CBIRDxEREhESERIRCA=="),
    44|65536
  );
};

{
  // the font we're using
  const factFont = "6x15";
  // swap every 10 minutes
  const minsPerFact = 5;
  // timeout used to update every minute
  let drawTimeout;
  // the fact we're going to display (pre-rendered with a border)
  let factGfx;
  // how long until the next fact?
  let factCounter = minsPerFact;
  // the gfx we use for the time so we can gat a shadow on it
  let timeGfx = Graphics.createArrayBuffer(g.getWidth()>>1, 48, 2, {msb:true});
  timeGfx.transparent = 0;
  timeGfx.palette = new Uint16Array([
      0, g.toColor(g.theme.bg), 0, g.toColor(g.theme.fg)
     ]);


  let getNewFact = () => {
    let fact = require("textsource").getRandomText();
    // wrap to fit the screen
    let lines = g.setFont(factFont).wrapString(fact.txt, g.getWidth()-10);
    let txt = lines.join("\n");
    // allocate a gfx for this
    factGfx = Graphics.createArrayBuffer(g.getWidth(), g.stringMetrics(txt).height+4, 2, {msb:true});
    factGfx.transparent = 0;
    factGfx.setFont(factFont).setFontAlign(0,-1).setColor(3).drawString(txt, factGfx.getWidth()/2, 2);
    if (factGfx.filter) factGfx.filter([ // add shadow behind text
      0,1,1,1,0,
      1,1,1,1,1,
      1,1,1,1,1,
      1,1,1,1,1,
      0,1,1,1,0,
    ], { w:5, h:5, div:1, max:1, filter:"max" });
    factGfx.palette = new Uint16Array([
      0, g.toColor(g.theme.bg), 0, g.toColor(g.theme.fg)
     ]);
  };
  getNewFact();

  // schedule a draw for the next minute
  let queueDraw = function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
  };

  let draw = function() {
    // queue next draw in one minute
    queueDraw();
    // new fact?
    if (--factCounter < 0) {
      factCounter = minsPerFact;
      getNewFact();
    }
    // Work out where to draw...
    g.reset();
    require("clockbg").fillRect(Bangle.appRect);
    // work out locale-friendly date/time
    var date = new Date();
    var timeStr = require("locale").time(date,1);
    var dateStr = require("locale").date(date,1);
    // draw time to buffer
    timeGfx.clear(1);
    timeGfx.setFontAlign(0,-1).setFont("BebasNeue");
    timeGfx.drawString(timeStr,timeGfx.getWidth()/2,2);
    timeGfx.setFontAlign(0,1).setFont("6x8");
    timeGfx.drawString(dateStr,timeGfx.getWidth()/2,timeGfx.getHeight()-2);
    // add shadow to buffer and render
    if (timeGfx.filter) timeGfx.filter([ // add shadow behind text
      0,1,1,1,0,
      1,1,1,1,1,
      1,1,1,1,1,
      1,1,1,1,1,
      0,1,1,1,0,
    ], { w:5, h:5, div:1, max:1, filter:"max" });
    var y = (Bangle.appRect.y+g.getHeight()-(factGfx.getHeight()+timeGfx.getHeight()*2))>>1;
    g.drawImage(timeGfx,0, y, {scale:2});
    // draw the fact
    g.drawImage(factGfx,0, g.getHeight()-factGfx.getHeight());
  };

  // Show launcher when middle button pressed
  Bangle.setUI({mode:"clock", remove:function() {
    // free any memory we allocated to allow fast loading
    delete Graphics.prototype.setFontBebasNeue;
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    require('widget_utils').show(); // re-show widgets
  }});
  // Load widgets
  Bangle.loadWidgets();
 require("widget_utils").swipeOn();
  // draw immediately at first, queue update
  draw();
}