Graphics.prototype.setFontAudiowide = function() {
  // Actual height 33 (36 - 4)
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AB/wAgcB/AFVgFgHbkYAok4AogvEgYFEg4FEj4FEn4FE//gKQf/4AcD/4QDh/8Djf+DhN/T4YcFgYcKh4cEh68Eh4cDAoOAAocORYkMf1JxBIYcf/6PDn//MIYEB/5KBOIIABKwIFFO4V/UQMHEIMfFQMHAQP3AQJ3BDIKABh/ggf7ApHAg/5AonxAocPAokf8IFE4IFDn4FEv+BAokBAof/AofB/wFE/gFD4YFE4/4AohgBAoXPAonvMAIFD4AFCVgIFBQYX3wCGCR4T+CTYqtLX4rLC/zXIcYoAQQYIFiJoR9CArgAlToIpDRQIFDSwI7C4CiBApN/Apb1D4F+Av4Fd8H+Aof/AoaTB/gFIgaBBAoSrB+AFCgF/8AFDAESP/Av3wv0HZYYABYoYAB+AFGZYIAB8DLCAAPAZYQFBZUhHC/gFE/wFaAAN+Av4Fqv53EboYFdAFIvB4EBGofwAon4Aon8ApX+AofAAot+Av4Fev8DAojFDAo0/S4IFGAAMf//gV4mAAoUD/zYgFwP8AoRGB/4FCAgI1CgIFC4A5BAoRHBg4FCKYMH/l+n5fC+F+g5rC8F+PoYFFZf7XVw7XNAALXNTYLXCVoYAQF4IFZjAFEnAFELIZCBAojRDAoMfAol/AohrCAoJfBNYIFBNYOAAoUf/xBDv/8AoXBRAcP4aCDh/PDgSNCDgQFCHIIFDUoafFAoJ3EGYQFCDgYFBXgZuBGYQAba4pDEhzvE/4ABKoMBAogbBAAJKBg4EBw4FEX4Z9BgIFC8AFE4F+Av5HFKYhfFAoRxCO4qDFgF/AokATYgfCZwcD/zTdAAV/Z4RBCHIZNBJYI5D/gFFOJEP+DF/a7N+ZYQFG+F+g7XFRYIFFbobLBboajCAoTRCcYTiEUQYAdgYCBsACBMwJlCAqUHJYLxDAAMgHSQ'))),
    46,
    atob("CiAsESQjJSQkHyQkDA=="),
    48|65536
  );
};

{

  let img = require("Storage").read("patriotclk.bg.img");
  let options = require("Storage").readJSON("patriotclk.opts",1)||{};

  // timeout used to update every minute
  let drawTimeout;

  // draw everything
  let draw = function() {
    var x = g.getWidth()/2;
    var y;
    if (options.bottomText)
      y = g.getHeight() - 24;
    else
      y = 4+(g.getHeight())/2; // middle
    g.reset();
    g.drawImage(img,0,0);
    // work out locale-friendly date/time
    var date = new Date();
    var timeStr = require("locale").time(date,1);
    var dateStr = require("locale").date(date);
    // draw time
    g.setFontAlign(0,0).setFont("Audiowide");
    // draw a shadow by shifting left/right/up/down
    g.drawString(timeStr,x-6,y);
    g.drawString(timeStr,x+6,y);
    g.drawString(timeStr,x,y-6);
    g.drawString(timeStr,x,y+6);
    g.drawString(timeStr,x-4,y+4);
    g.drawString(timeStr,x+4,y+4);
    g.drawString(timeStr,x-4,y-4);
    g.drawString(timeStr,x+4,y-4);
    // finally draw in the foreground color
    g.setColor(g.theme.bg).drawString(timeStr,x,y);
    // draw date
    //y += 35;
    //g.setFontAlign(0,0).setFont("6x8").g.setColor(g.theme.fg);
    //g.drawString(dateStr,x,y);
    // queue draw in one minute
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
  };

  // Clear the screen once, at startup
  g.clear();
  // draw immediately at first, queue update
  draw();
  // Show launcher when middle button pressed
  Bangle.setUI({mode:"clock", remove:function() { //f ree memory
    if (drawTimeout) clearTimeout(drawTimeout);
    delete Graphics.prototype.setFontAudiowide;
    require("widget_utils").cleanup();
  }});  
  // Load widgets (make them swipeable)
  Bangle.loadWidgets();
  require("widget_utils").swipeOn();
}