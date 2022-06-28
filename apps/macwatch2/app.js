// 68k Mac Finder desktop themed clock
// by Giles Booth @blogmywiki
// improvements by Peer David

var img = require("heatshrink").decompress(atob("2GwgP4C6cf8AVTg/ACqcDwADBDCMBCoICCCqACEj8zAwXwmcYgEGswYHhxwBjEDGocwCoVgQxHwCoMzjwVBwPzngrCnlmDAsfNoIVBIQMBwZBEAAIVIjwVD8YVNIIc/FY9+CpcwCo9gCo0PQYUzmIVGo1is1ACokGNoaDC+PzhkAg+Gnl/aiIA/AD//AClVACmqACgr/Fd2vVqP+FYNUbKMNFYOsCqMOFa+t/f/35LC/AODK43uFYUCgGACAUB/IFDFZP6gArEsArTgFhz9w+ArRsOZzOYFaQVCFan4FaiFHFZuIFaeYQZbbVf5LbK1gVRhwrX15MGABX+K/4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Ff4r/Fe+v/4AQ/wrBq4VR/orBAClVACgr/Ff4r/AAmr6or/q/6Fae/A="));

var font = atob("f3/gMB/7+AAAACA///AAAAAAQcHhsZ+LhAAAgUhsPh38eAAADAoJCI///BAA8XhkMhn8eAAAPz/0Mhn4eAAAgEAh8f+HgAAAb3/kMh/7eAAAeH5hML/z8AAAAAADYbAAAAAA");

var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function draw() {
  queueDraw();
  
  // Fix theme to "light"
  g.setTheme({bg:"#fff", fg:"#000", dark:false}).clear();
  g.reset();
  g.drawImage(img,0,0);

  g.setFontCustom(font, 48, 8, 1033);
  g.setFontAlign(0, -1, 0);
  g.setColor(0,0,0);
  var d = new Date();
  var da = d.toString().split(" ");
  hh = da[4].substr(0,2);
  mi = da[4].substr(3,2);
  dd = ("0"+(new Date()).getDate()).substr(-2);
  mo = ("0"+((new Date()).getMonth()+1)).substr(-2);
  yy = ("0"+((new Date()).getFullYear())).substr(-2);
  g.drawString(hh, 52, 65, true);
  g.drawString(mi, 132, 65, true);
  g.drawString(':', 93,65);
  g.setFontCustom(font, 48, 8, 521);
  g.drawString(dd + ':' + mo + ':' + yy, 88, 120, true);
  
  // Hide widgets
  for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
}


// handle switch display on by pressing BTN1
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});


// Load widgets but hide them
Bangle.loadWidgets();
draw();
Bangle.setUI("clock");
