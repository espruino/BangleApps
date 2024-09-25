{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let removeHasNotRun = true;
let drawTimeout;

const supaClockImg = {
  width : 95, height : 13, bpp : 1,
  buffer : atob("wL7B+Dhf4/C+4P//f328z0+/OZ9zPv/+/vt9fr99/X7e3f/8Bfb6/X77+vw9e///6+wMAv339fu+4DD/25v79Pv32/e4HNvAePf37BAweC+3+7f////////////P4B////////////////////////////7UEYf///////////2qrW////////////tdxh////////////iLtaA="),
  palette: new Uint16Array(g.theme.dark ? [g.toColor("#fff"), 0] : [0, g.toColor("#fff")]),
}
// todo
// const is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];

const interpolatePos = function(pos1, pos2, factor, easing) {
  if (easing !== undefined) {
    factor = Math.pow(factor, easing);
  }
  return {x: (pos1.x*(1-factor) + pos2.x*factor)/2, y: (pos1.y*(1-factor) + pos2.y*factor)/2}
}

let drawSplashScreen = function (frame, total) {
  const R = Bangle.appRect;
  g.reset().setColor(g.theme.fg).setBgColor(g.theme.bg);
  const startPos = {x: -200, y: R.h/2};
  const endPos = {x: R.x2 - supaClockImg.width*2 + 30, y: R.h/2};
  const pos = interpolatePos(startPos, endPos, frame/total, 0.1)
  g.setFontAlign(0, 1).setColor('#888').setFont("4x6:3").drawString('ULTRA', 100, frame*18);
  g.setFontAlign(0, 1).setColor('#888').setFont("4x6:3").drawString('PRO', 40, R.x2 - frame*18);
  g.clearRect(0, pos.y-5, R.x2, pos.y + supaClockImg.height+25);
  var date = new Date();
  let minutes = date.getMinutes();
  minutes = (minutes < 10 ? '0' : '') + minutes;
  let hours = date.getHours()+'';
  g.drawImage(supaClockImg, pos.x, pos.y, {scale: 2});
  g.setColor(0).setFont('6x8:2').setFontAlign(0, 1).drawString(hours + ':' + minutes, R.x2/2, pos.y + supaClockImg.height + 25)
}

// for fast startup-feeling, draw the splash screen once directly once
g.clear()
drawSplashScreen(0, 15);

let splashScreen = function () {
  g.clearRect(R.x,R.y, R.x2, R.y2);
  return new Promise((resolve, reject) => {
    let frame = 0;
    function tick() {
      if (removeHasNotRun) drawSplashScreen(frame, 15);
      frame += 1;
      if (!removeHasNotRun) {
        reject();
      } else if (frame < 15) {
        setTimeout(tick, 30);
      } else {
        resolve();
      }
    }
    tick();
  })
}


Graphics.prototype.setFontPlayfairDisplay = function() {
  // https://www.espruino.com/Font+Converter
  // <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet">
  // Actual height 58 (61 - 4)
  // 1 BPP
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    46,
    atob("EBYpGCEfIh4lHyQjEQ=="),
    65|65536
  );
}

Graphics.prototype.setFontPlayfairDisplaySm = function() {
  // Actual height 18 (17 - 0)
  // <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,800;1,800&display=swap" rel="stylesheet">
  // 18pt, 1bpp, ASCII capitals
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('ABU/weP/3j/E4BAMIgEH4EB8EAkEAjwICgGADYcQgFEgEX4EeoEBBANHgE9gEEBAYABjl8h+Gg/woM+iFP4n///En1Bw/wvH4CgIXBgfggP4glDg0QoUH+cA/MAgO+gGf4HEiHBwlAn8Ah5NCgeAgPwh3+g/j4MQuFEzkc+cHmXA7+wg/8gO3g9hwP44Fv8ETEARbCPoMfPoIIDgf8gf/4P//nwh9gBgUEAQPwg8f//D//An6gBgEUJ4SoBgP+gF/wAqBgfwgFIZAqaBEwMBAwKjB/4IGCIStDJ4ISBEgIADmEAhhXBAwLcBBAYhCAAcBBoNwXgYWDfwPAQgIgBDI0AW4Mf8EPQwOHgGAoEgiEMhiPBOAUPEoZbCoEfSAKhCMoZEDCQPA4Eg+EMvkD+75B4EcKAtAhEQgUIoODmFA/1wn/8h8+WgIpDb4M4gEWgEJwEMuEH/+D/7EBJwLQCR4Mg8kInMGh1Dgef4Hn8F4/EAjB/Ej/Aj/4h//gfh4OQiFGhkh/8In7uB4EOYAOAGQPwnH+h1/gewgDWBZILiDgfPwP7+F/gkT8MEvlB//wvv8ghtBAAMPFwPwgf+kHBxEgkkMj6qBwF/4EPNYYAB8PAnFwhzyERgIIBjrgBQgLDDAQIeBlEAicAglAgUQgGCgFgwAFBAAkSCIOAgK3BpAILGA1AwEIkECVgNEGoUCSwUAGIYgBLQLqB8WAnGBh0xwZxBgKjBeIMAjzSBsEQgkIgGEn0in/Iz/yo0IyMOkl/5Mf+FHIAMCgZIBv5PFgfAgcQg2Ah0gg/ogP/gE//gECj6aBH4MMDYMEgDXCv/8j//gkQoICBdIIIBg/v4HzOAN4G4X+HwPAn/4CIUB4KABoAdBgIsBS4Mgvl8KYosBGoUH/4aIoPAuAsBh/+gI1BSYIABCIIaCLIZWDoM/EYUcg8HQwI6DDRsfKYNAGAMHcgLaBh/wHwMD/+B+HwsBQDhFBWYNA/kIn0H5/AgQ1LVQZNBQAdBI44LBAAYUBR4gRBDoQAChKHBv//z//4//8IdEdJdAg5wB8ETFgMP4JsBoEcHwbOLFIQRCoEAuEAdIQ1EvhZB4EH/kAv/gAgU8gEcgE4AIJrNHwsBgfggF+YoPAgP4gE/VoLFBNYYbBcAMfa4nB4FwFgLXCKAOAmF4ngRDEoOAgaaEPpMCTYOEiFgg/4gJoBnyjBeoQjCj/6FgOHw/hwE4WwI+B4kAvPAn1//eP/3h/84j6JBa5tBBYND8BHC9/A/PwjAcBYoUAuPwn0Mj/BKANBj0QofEiH/gYLB8akBkBWBg+AgOAcYIyBgbFEHwKYFeIb+D//gv/4KAUB4CACBwQCBwP/4FAgEYGoaYBv/Ai/+AgUD+EAnEAuEE8AkCDQJsBg72BCoXwJwKxB4MB8Fw4EfwEH/hHCp4vCDYMBhxZCHwLpEsEMj0Hg/DoP9iFffoP4DgMBk/wuF8jEPMQJrCsBHFRgKPBgZHDh/wrgRCDQIACvEcjEfgi8Bj/wr/kj/hg/goPgmFgVYcAE4IAEJAIlCHwMGAgNwCQLGBNQL7CgTHCAAiCBAAQA='))),
    32,
    atob("BAUHCwsNEQQGBgkKBQkFBwwHCgkKCQoJCgoFBQsLCwkQDAwNDgwLDQ8HBw0LEQ0PDA8NCwwMDBINCwsGBwY="),
    18|65536
  );
}

// Actually draw the watch face
let draw = function() {
  g.reset().setColor(g.theme.fg).setBgColor(g.theme.bg);
  g.clearRect(R.x,R.y, R.x2, R.y2 - 60);
  var date = new Date();
  let minutes = date.getMinutes();
  minutes = (minutes < 10 ? '0' : '') + minutes;

  g.setColor(g.theme.fg)
  // Time
  const yt =  R.y + 92 - 20 - 30 + 6 + 10;
  const xt = R.w/2;
  let hours = date.getHours()+'';

  g.setFontAlign(0, 0).setFontPlayfairDisplay().drawString(hours + ':' + minutes, xt, yt);
  // logo
  g.drawImage(supaClockImg, R.x2 - supaClockImg.width - 2, R.y + 2);
  // dow + date
  let dateStr = require("locale").dow(date).toUpperCase() + '\n' + require("locale").month(date, 2).toUpperCase() + ' ' + date.getDate();
  g.setFont('6x8').setFontAlign(-1, 0).drawString(dateStr, R.x2 - supaClockImg.width - 2, R.y + 42 - 30 + 8);

  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};

let clockInfoDraw = (itm, info, options) => {
  g.reset().setFontPlayfairDisplaySm().setColor(g.theme.fg).setBgColor(g.theme.bg);
  if (options.focus) g.setBgColor("#FF0");
  g.clearRect({x:options.x,y:options.y,w:options.w,h:options.h});

  if (info.img) {
    g.drawImage(info.img, options.x+1,options.y+2);
  }
  var text = info.text.toString().toUpperCase();
  if (g.setFontPlayfairDisplaySm().stringWidth(text)+24-2>options.w) g.setFont("4x6:2");
  g.setFontAlign(-1,-1).drawString(text, options.x+24+3, options.y+6);
};

let clockInfoDrawR = (itm, info, options) => {
  g.reset().setFontPlayfairDisplaySm().setColor(g.theme.fg).setBgColor(g.theme.bg);
  if (options.focus) g.setBgColor("#FF0");
  g.clearRect({x:options.x,y:options.y,w:options.w,h:options.h});

  if (info.img) {
    g.drawImage(info.img, options.x + options.w-1-24,options.y+2);
  }
  var text = info.text.toString().toUpperCase();
  if (g.setFontPlayfairDisplaySm().stringWidth(text)+24-2>options.w) g.setFont("4x6:2");
  g.setFontAlign(1,-1).drawString(text, options.x+options.w-24-3, options.y+6);
};


let clockInfoItems;
let clockInfoMenu1;
let clockInfoMenu2;
let clockInfoMenu3;
let clockInfoMenu4;

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {  // for fastloading, clear the app memory
    removeHasNotRun = false;
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Graphics.prototype.setFontPlayfairDisplay
    delete Graphics.prototype.setFontPlayfairDisplaySm
    clockInfoMenu1&&clockInfoMenu1.remove();
    clockInfoMenu2&&clockInfoMenu2.remove();
    clockInfoMenu3&&clockInfoMenu3.remove();
    clockInfoMenu4&&clockInfoMenu4.remove();
  }});

Bangle.loadWidgets();

let R = Bangle.appRect;
let midX = R.x+R.w/2;
let upperCI = R.y2-28-28;
let lowerCI = R.y2-28;

g.clearRect(R.x, R.y, R.x2, R.y2);
splashScreen().then(() => {
  g.clearRect(R.x, 0, R.x2, R.y2);
  draw();
  Bangle.drawWidgets();
  // Allocate and draw clockinfos
  setTimeout(() => {
    // delay loading of clock info, so that the clock face appears quicker
    g.clearRect(R.x, upperCI, R.x2, upperCI+10);  // clear loading text
    try {
      clockInfoItems = require("clock_info").load();
      clockInfoMenu1 = require("clock_info").addInteractive(clockInfoItems,  { app:"supaclk", x:R.x+1,  y:upperCI,   w:midX-2, h:28, draw : clockInfoDraw});
      clockInfoMenu2 = require("clock_info").addInteractive(clockInfoItems, { app:"supaclk", x:midX+1, y:upperCI,   w:midX-2, h:28, draw : clockInfoDrawR});
      clockInfoMenu3 = require("clock_info").addInteractive(clockInfoItems, { app:"supaclk", x:R.x+1,  y:lowerCI,   w:midX-2, h:28, draw : clockInfoDraw});
      clockInfoMenu4 = require("clock_info").addInteractive(clockInfoItems, { app:"supaclk", x:midX+1, y:lowerCI,   w:midX-2, h:28, draw : clockInfoDrawR});
    } catch(err) {
      if ((err + '').includes('Module "clock_info" not found' )) {
        g.setFont('6x8').drawString('Please install\nclockinfo module!', R.x + 10, upperCI);
      }
    }
  }, 1);
},() => {});

}
