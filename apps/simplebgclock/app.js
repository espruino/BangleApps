Graphics.prototype.setFontAudiowide = function() {
  // Actual height 33 (36 - 4)
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AB/wAgcB/AFVgFgHbkYAok4AogvEgYFEg4FEj4FEn4FE//gKQf/4AcD/4QDh/8Djf+DhN/T4YcFgYcKh4cEh68Eh4cDAoOAAocORYkMf1JxBIYcf/6PDn//MIYEB/5KBOIIABKwIFFO4V/UQMHEIMfFQMHAQP3AQJ3BDIKABh/ggf7ApHAg/5AonxAocPAokf8IFE4IFDn4FEv+BAokBAof/AofB/wFE/gFD4YFE4/4AohgBAoXPAonvMAIFD4AFCVgIFBQYX3wCGCR4T+CTYqtLX4rLC/zXIcYoAQQYIFiJoR9CArgAlToIpDRQIFDSwI7C4CiBApN/Apb1D4F+Av4Fd8H+Aof/AoaTB/gFIgaBBAoSrB+AFCgF/8AFDAESP/Av3wv0HZYYABYoYAB+AFGZYIAB8DLCAAPAZYQFBZUhHC/gFE/wFaAAN+Av4Fqv53EboYFdAFIvB4EBGofwAon4Aon8ApX+AofAAot+Av4Fev8DAojFDAo0/S4IFGAAMf//gV4mAAoUD/zYgFwP8AoRGB/4FCAgI1CgIFC4A5BAoRHBg4FCKYMH/l+n5fC+F+g5rC8F+PoYFFZf7XVw7XNAALXNTYLXCVoYAQF4IFZjAFEnAFELIZCBAojRDAoMfAol/AohrCAoJfBNYIFBNYOAAoUf/xBDv/8AoXBRAcP4aCDh/PDgSNCDgQFCHIIFDUoafFAoJ3EGYQFCDgYFBXgZuBGYQAba4pDEhzvE/4ABKoMBAogbBAAJKBg4EBw4FEX4Z9BgIFC8AFE4F+Av5HFKYhfFAoRxCO4qDFgF/AokATYgfCZwcD/zTdAAV/Z4RBCHIZNBJYI5D/gFFOJEP+DF/a7N+ZYQFG+F+g7XFRYIFFbobLBboajCAoTRCcYTiEUQYAdgYCBsACBMwJlCAqUHJYLxDAAMgHSQ'))),
    46,
    atob("CiAsESQjJSQkHyQkDA=="),
    48|65536
  );
};
Graphics.prototype.setFontAudiowide12 = function() {
  // Actual height 12 (11 - 0)
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AAtAg/4uAFBuEEAQIFBgUB3E/w/gj+D/F6gMggEB0E+DQN/wXghkBwE8gdInuB+Ecgf4k+AvEDwEgn+D7E5weYkOAnECHAQCBj+H/ng9gKCgHAt8On/B+BFBDAMH4AbBwBbCKoNgj4CBAoMEgPAiEIgGAAQopCKQMII4NwjwDCDYIMB8E/w04s+G7Ftw+YvOH/E/CANgO4QlBh+G/FtCgQCBvJrBGQQLFEYIgDvBfBhhtBAQV/BwMAg41BDQovBp4aBn47BFItvwCJBgxKBLIUH8F4BAIAB+AsBC4d9GQMHBgKhBzAmFv+DEwIABjKUCoOciKwBhyMBmcCiCSBkEafwICCiQWBkMDiEzCgJrBJQJEBt+G9Fsg+AvALBg0B/EfwP4jsB+DdCg+DSQMGmFjAQS2ER4IFBLIhoCn4OBR4Vhw0YAQpoCWAQOGO4MeBwQdBtK8GDoI4DwFsg3AAQVgFIgaFOgLjCLITyKDokBwEYAQoLBYQYRChkB4E+gdwseENAwgIHweD4EPegMDwHwnikEDoUwDAJNBsEDBwkegfwuakHn7sBRIjRF8E+JQIdJ40cn9BDotgs0GuFnTYN8wLvCzF5YQ34p+GKIMGLgYFCYQV4g/wg6DFCIJlCsAMBeQN4QYgLDCIN4h6wBnACBTAN4GQPAgEEhFhw84PoU/g84sOEhFwg/AvglDvEGBAcAPoM4NwV5w6DBwEIOIP+v/2gcAMQNwgfAhw7BL4MIoEmgd/+/+A=='))),
    32,
    atob("BAMFCQYKCAMFBQcGAwcCCAsECQkJCQkICQkDAwYHBggICgoJCgkJCgoDCQoJDAoKCgoKCQkKCQwJCQkECAQ="),
    12|65536
  );
};

{
  let settings = Object.assign({
    ypos : 88
  }, require('Storage').readJSON("simplebgclock.json", 1) || {});
  const background = require("clockbg"); // image backgrounds

  // timeout used to update every minute
  let drawTimeout, widgetTimeout;

  // draw everything
  let draw = function() {
    // queue draw in one minute
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
    // draw properly
    var x = g.getWidth()/2;
    var y = settings.ypos;
    var h = 27;
    // fill background
    g.reset();
    background.fillRect(0,y-h, g.getWidth(),y+h);
    // work out locale-friendly date/time
    var date = new Date();
    var timeStr = require("locale").time(date,1);
    // draw time
    g.setFontAlign(0,0).setFont("Audiowide");
    // draw a shadow by shifting left/right/up/down
    g.drawString(timeStr,x-6,y)
     .drawString(timeStr,x+6,y)
     .drawString(timeStr,x,y-6)
     .drawString(timeStr,x,y+6)
     .drawString(timeStr,x-4,y+4)
     .drawString(timeStr,x+4,y+4)
     .drawString(timeStr,x-4,y-4)
     .drawString(timeStr,x+4,y-4);
    // finally draw in the foreground color
    g.setColor(g.theme.bg).drawString(timeStr,x,y);
  };

  // Show launcher when middle button pressed
  Bangle.setUI({mode:"clock", remove:function() { // free memory
    if (drawTimeout) clearTimeout(drawTimeout);
    if (widgetTimeout) clearTimeout(widgetTimeout);
    var e = WIDGETS["simplebg"];
    g.reset().clearRect(e.x,e.y,e.x+63,e.y+23);
    delete WIDGETS["simplebg"];
    require("widget_utils").show();
    delete Graphics.prototype.setFontAudiowide;
    delete Graphics.prototype.setFontAudiowide12;
  }});
  // Load widgets (make them swipeable)
  Bangle.loadWidgets();
  WIDGETS["simplebg"] = {
    area:"tl",
    width: 52,
    draw : function(e) {
      g.reset().clearRect(e.x,e.y,e.x+e.width-1,e.y+23);
      var d = new Date();
      // day of week
      g.setFontAudiowide12().setFontAlign(-1,0).drawString(require("locale").dow(d,1).toUpperCase(), e.x+2, e.y+8);
      // date without year
      g.setFontAlign(-1,0).drawString(require("locale").date(d,0).replace(/\d\d\d\d/,"").trim().toUpperCase(), e.x+2, e.y+18);
      widgetTimeout = setTimeout(function() { // redraw every hour (it's just easier that working out timezones)
        widgetTimeout = undefined;
        WIDGETS["simplebg"].draw(WIDGETS["simplebg"]);
      }, 3600000 - (Date.now() % 3600000));
    }
  };
  require("widget_utils").swipeOn();
  // Clear the screen once, at startup
  background.fillRect(Bangle.appRect);
  // draw immediately at first, queue update
  draw();
}