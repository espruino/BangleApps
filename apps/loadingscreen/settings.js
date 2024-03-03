(function(back) {
  function goBack() {
    var im = require("Storage").read(".loading");
    if (im && im.length>3) {
      var i = g.imageMetrics(im);
      g.reset().drawImage(im, (g.getWidth()-i.width)/2, (g.getHeight()-i.height)/2);
    }
    setTimeout(back, 500);
  }

  function savePattern(pattern) {
    E.showMessage("Please wait...");
    var im = Graphics.createImage(pattern,"string");
    var w = g.getWidth(), h = g.getHeight();
    var b = Graphics.createArrayBuffer(w,h,1,{msb:true});
    for (var y=0;y<h;y+=im.height)
      for (var x=0;x<w;x+=im.width)
        b.drawImage(im,x,y);
    b.transparent = 0;
    require("Storage").write(".loading",b.asImage("string"));
    goBack();
  }

  function iconHourglass() {
    // To get FG+BG+transparent, convert a monochrome image as a 2 bit greyscale using the image converter
    return require("heatshrink").decompress(atob("mE4wUBqAOJgtABZMBGjH/ABALlBhA8LBIJrBBZCDCBZEFqoLJqoLO4BBDgYLcn/wBYcP/gLFCYIbBBY38BYYFBBYVACIILE+EBBYY1BLgX/BYgVBEAQECBYSQCJAQcCRwNVqg8CBYIDCioLDCYQbDBYRUBFYPwBwJ8BBQQ8BCgQaCHQQLNEZQ7LKZZrLQYbKDQYabDAASbFYoQACWYg2DAQrjPNIRtCBYjKCBYLMCBaIKBAAILGAAwLNRwQLHgrJCBY8BRIQLHSoYLJBQ4MDBcYAWNYIAIgKDBABEFA="));
  }

  function iconRetro() {
    // A mac-style loading window
      return require("heatshrink").decompress(atob("rk1gP/ABP4DBMDwALJnAWK39/+4tH3EEgIWJoEXC34WZORSghZ1oW/CzkB8AQC4AWFhgEBgOMFowSCjAtGhkPx8HzncuwWE4OMjHY41sDgQWCjHPzOMs3MCwuNzOYCw9Y7IWI5oWE5uwCwUf5+O53es187aJJFogAFFooAEg4HCcv4Wbn//ACnwA"))
  }

  E.showMenu({
    "": {title:/*LANG*/"Loading Screen"},
    "Default" : () => {require("Storage").erase(".loading");goBack()},
    "No Screen" : () => {require("Storage").write(".loading","NO");goBack()}, // less than 3 chars and nothing is rendered
    "Hourglass" : () => {require("Storage").write(".loading",iconHourglass());goBack()},
    "Retro" : () => {require("Storage").write(".loading",iconRetro());goBack()},
    "Stripes" : () => savePattern(`
XX..XX..
.XX..XX.
..XX..XX
X..XX..X
XX..XX..
.XX..XX.
..XX..XX
X..XX..X
`),
    "Lines" : () => savePattern(`
XXXXXXXX
........
XXXXXXXX
........
XXXXXXXX
........
XXXXXXXX
........
`),
    "Dots" : () => savePattern(`
......
..XX..
.XXXX.
.XXXX.
..XX..
......
`)
  });

  /* For testing, this generates an image with a different colour surrounding on it
require("FontSinclair").add(Graphics);
var b = Graphics.createArrayBuffer(84,12,2);
b.setBgColor(1).clear();
b.transparent = 1;
b.setFont("Sinclair").setColor(0);
for (var y=-2;y<=2;y++) for (var x=-2;x<=2;x++) b.drawString("LOADING...",2+x,2+y);
b.setColor(3).drawString("LOADING...",2,2);
g.drawImage(b.asImage("string"));
  */

})