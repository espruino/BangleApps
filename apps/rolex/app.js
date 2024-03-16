var imgBg = {
  width : 176, height : 176, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("ABMBwAVpmfMCqdxxwVpmOMCiUDmOIoAVRg8xzHwCqUZCqcDCoPAYBwDDzOZYx0DB4QVGF5UPComRAoZbKn4hD7uzGof4CpN/8AVI/wVO5+3T4YVKn5NDt/2Cqd/CAcP/gVJj5jDCogJECpc/EwYVLG4gVEJYgAGMYgVVLgqjDAA0D/5GDRAgVPg4VD/77DAA0B/+ABBwAEEQ4VVJQgAIMg4VVUQgAIn4VUj5kGgbfDABEeBA7fDABEMBA84CpYAIiAVUAHVAh4USgf4j+HVgPg4AVOxlw44DBuLMGcgQVFg1gs0DgE7JowVCGognB4AVB0DiFgPgAYMPAYRXD8AVB+EOHooVDfQkDjBBDj4VEh/wAYMf/wVEhkw40Tg0zNok/Cof/BQcDxyZB+f8sJjE/49Cn//Uh0B//8FYYwCwEgAYMQVQ4VDh4ECgfSufOvF548c8+CuQmGgf//4eBv3BxFMtuN23DmVzCAN//6rDCoPAg1suEMsAVBmgVBrYPDPwZuCCoMZhhBBx84CoPyNgSqETQUDpnZhFIsODmGDiX7KIRsCOYeAgOAuDsBgKhB8UMwPAFYJsCT4avNX41/Cpz2EgEeAYU+jl8vwHBnl8BQV+DgpSBAAMjmkQoEDsVmnAKCvA2JkcmCocweocwCpMhm0QvECsccCoYAKkd+FYNCscGCp0ysQVBs0iAgIVNn1DPYM8AAIVOhACBnkYhEYChoA/AH4A/AH4A/AC1///+CtH/AAIVVAAIuQCqkBCv4V/CozERCqrxZCtF/QCAA/AH4A/AH4A/AH4ArhgONkAGFnwVNuAGFvwVN/gFEgP/CpoOFg4VNEgOAAwcfAwoVJ8AGDn//4AVLgf//BHEFZoVB/wFIIJZnDh//RQMYhGICxN/KIZWB+EAmEfzsN4Ew8PMw3JnYMBPoIDBNgk6u8XjmA8OT2XJ/8zvg8ECoRsBh1/jscwdhj/ztO7iV4NAQVCj5sCh1Tzseydhy/jnO3icwSgSaCh4DCnOBwviwcw+Msm0BidINwRXCh4DCABsfCIUHbJgADg7yCg4IDhlmjEgAgPssOGsDHDCoQAEiXMs9yt8R5VrzmwBoY9HCoNjuVGiHOpOcyBKLiWMsd6s0R51LjgVMjkIjEPukM5UIjiQMhkAjEDmEMMoMGNoYA0jAVUjgIHuAVLn4IH/AVLv7OGgf8Cpj6Gg4VM/4rGg/+CsEB/+AK43/CpQMIDwIVVGgxONMA4VIj/wCp0PUwYVEXA4VZj7+DCok/AgYAGn4VID4gVHCAgVPJogVEMIgVRXJClGCojPJFYQVIgYVKj79DCoptKh4VIgKvKgYwECohLDABYVEACAV/Cv4V7"))
};

/* Set hour hand image */

var imgHour = {
  width : 19, height : 62, bpp : 2,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAP/wAAA///wAA////AA////8A/////A/////8P/////D/////w/////8P/////D/////w/////8D////8AP////AA////AAD///AAAP//AAAA//AAAAPXwAAAD18AAAA9fAAAAPXwAAAD18AAAA9fAAAAPXwAAAD18AAAA9fAAAAPXwAAAD18AAAA//AAAA//wAAA///wAD/X1/AD/V9X8A/VfVfw/VX1V8PVV9VXD1VfVV89VX1VfPVf/1Xz1f//V89/9f/fP/1Vf/A/VVVfwP1VVXwA/VVX8AD/VfwAAP//wAAA//wAAAD18AAAA9fAAAAPXAAAAD1wAAAAN8AAAAD8AAAAA/AAAAAPwAAAAA8AAAAAMAAAAADAAAAAAwAAAAAAAAAA=="))
};

/* Set minute hand image */

var imgMin = {
  width : 10, height : 80, bpp : 2,
  transparent : 0,
  buffer : E.toArrayBuffer(atob("AAAADwAP/wP//D//z/////////8//8P//A//AD/AA/wAP8AD/AA/8A/8AP/wD/8A//AP/wD/8A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A9fAPXwD18A//AP/wA/wAP8AD/AA/wAP8AA/AAPAADwAA8AAPAADwAAMAAAAAAAA="))
};

/* Set second hand image */

var imgSec = {
  width : 8, height : 116, bpp : 2,
  transparent : 2,
  buffer : E.toArrayBuffer(atob("v/q//r/+v/qv+q/qq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qv+v/6/D/wD8PDw8PwD/w///6v+qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqr+r//v///X/1X/Vf9V/1X/1///+//q/qq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq+qr6qvqq6qrqg=="))
};

/* use font closer to Rolex */

Graphics.prototype.setFontRolexFont = function(scale) {
  // Actual height 12 (12 - 1)
  this.setFontCustom(atob("AAAABAACAAAAAYAHgA4AOABgAAAAA/gD/gMBgQBAwGA/4A/gAAAAAAIBAQCB/8D/4AAQAAAAAAAAAwEDAYEBQIEgYxA/CA4MAAAAAAAAgIBAhCBCEDOYHvgCOAAAAAAABgANAAyAHEAf/A/+AAgABAAAAAAADBAcCBsECYIEYgIeAAAAAAAHwAfwB5wGggZBAjGBH4CDgAAACAAYAAgABAMCDwE+APgAYAAAAAAABxwH3wJwgRhA3iB54AhgAAAAAAPhA/iBDMCCQGHgH+AHwAAAAAAAQIAgQAAAAAA="), 46, atob("BAUJCQkJCQkJCQkJBQ=="), 17+(scale<<8)+(1<<16));
  return this;
};

/* Set variables to get screen width, height and center points */

let W = g.getWidth();
let H = g.getHeight();
let cx = W/2;
let cy = H/2;
let Timeout;

Bangle.setUI("clock");
// load widgets after 'setUI' so they're aware there is a clock active
Bangle.loadWidgets(); 

/* Custom version of Bangle.drawWidgets (does not clear the widget areas) Thanks to rozek */

Bangle.drawWidgets = function () {
  var w = g.getWidth(), h = g.getHeight();

  var pos = {
    tl:{x:0,   y:0,    r:0, c:0}, // if r==1, we're right->left
    tr:{x:w-1, y:0,    r:1, c:0},
    bl:{x:0,   y:h-24, r:0, c:0},
    br:{x:w-1, y:h-24, r:1, c:0}
  };

  if (global.WIDGETS) {
    for (var wd of WIDGETS) {
      var p = pos[wd.area];
      if (!p) continue;

      wd.x = p.x - p.r*wd.width;
      wd.y = p.y;

      p.x += wd.width*(1-2*p.r);
      p.c++;
    }

    g.reset();                                 // also loads the current theme

    try {
      for (var wd of WIDGETS) {
        g.setClipRect(wd.x,wd.y, wd.x+wd.width-1,23);
        wd.draw(wd);
      }
    } catch (e) { print(e); }

    g.reset();                               // clears the clipping rectangle!
    }
  };

/* Draws the clock hands and date */

function drawHands() {
  let d = new Date();

  let hour = d.getHours() % 12;
  let min = d.getMinutes();
  let sec = d.getSeconds();

  let twoPi = 2*Math.PI;
  let Pi = Math.PI;

  let hourAngle = (hour+(min/60))/12 * twoPi - Pi;
  let minAngle = (min/60) * twoPi - Pi;
  let secAngle = (sec/60) * twoPi - Pi;

  let hourSin = Math.sin(hourAngle);
  let hourCos = Math.cos(hourAngle);
  let minSin = Math.sin(minAngle);
  let minCos = Math.cos(minAngle);
  let secSin = Math.sin(secAngle);
  let secCos = Math.cos(secAngle);

  g.drawImage(imgHour,cx-22*hourSin,cy+22*hourCos,{rotate:hourAngle});
  g.drawImage(imgMin,cx-34*minSin,cy+34*minCos,{rotate:minAngle});
  g.drawImage(imgSec,cx-25*secSin,cy+25*secCos,{rotate:secAngle});
  g.setFontRolexFont();
  g.setColor(g.theme.bg);
  g.setFontAlign(0,0,0);
  g.drawString(d.getDate(),165,89);
}

function drawBackground() {
  g.clear(1);
  g.setBgColor(g.theme.bg);
  g.setColor(g.theme.fg);
  g.drawImage(imgBg,0,0);
  g.reset();
}

/* Refresh the display every second */

function displayRefresh() {
  g.clear(true);
  drawBackground();
  drawHands();
  Bangle.drawWidgets();

  let Pause = 1000 - (Date.now() % 1000);
  Timeout = setTimeout(displayRefresh,Pause);
}

Bangle.on('lcdPower', (on) => {
  if (on) {
    if (Timeout != null) { clearTimeout(Timeout); Timeout = undefined;}
    displayRefresh();
  }
});
displayRefresh();
