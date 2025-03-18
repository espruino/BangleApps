var imgBg = {
  width : 176, height : 176, bpp : 2,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("qoASv/8//1C6YASrorD6opjuorHBAIriQYwriV9FXFZldFjrSEFY6FjQcorPSYqtZFZaxaVoiDkZRArLv4rV/orT/5rGABtf/4rSq//+79UFaptIK5puHFZQUBFda5IABZuBCw4rKTAPVq4rUNw4rK/4rBroqRQAIrVQSd1N4QrQNZIAOFdbzBQ4IrOCQIIDWKQYFFZhqBHwaeBACBwBFazZQThQrJ/7CHABaSEFaTaWOIYrONJArTToorIdpDdRDQLJOCBDhRIxBoPABdXAwwrRVKQ+GZR7aZDYRHNM4IraOZyTQZbQrKaIwAKr7LOHRNdFaJzOr56RuppZACBgRAEtW1Wl1WqzWm1Nqy2qC5hyTrWq1IrFzWqyoXLv7mFQRlqqtp0tVy2V0uptNVA4JWK/72Fr4yFFY9VLINWyqJBFZtfFYwGGQZIrS////peF/6xM1KDDQQIrMKwJQFA4SEKQYLbGAoIrKv5PGGY4rGEYIAHyrZKQQoIDQhoARKwR6GBJIAXJpKECMIoAXUpaELBYQAICZR4CPYo3Kq4IBr7RITIzZFq7mOGwXXBYIjB//3/9drt/+5AGZ4RKHuoNEFZVdupQBuorBupjCJIyNIrqELr4mBr99vorEK476PBxAYC79//orCr4QBu5XIXAwiIcwxXCKYJlBFYSvIQRI7HTiLjBFYzZHAAzdBDA4AKDY6CMQgYQOABT8CEQjdJFTAAKuo8MADokkAH4A/AH4A/ABn1FldXFlfVTX4A/AH4A/AH4APr//ABVVrorcv4rL6tXFbgqL//1Qbv/1QAE1AED14re/wrK1Yr/Ff4rEcY3VFf4r/Ff4r/EaoAH/4rK14r/FZYALFb1/FZbTWAA9fFZYNBFjoA/AH4A/AH4A/vots+pu/AH4A/AH4A/ADdX6ousr4GFrohgABP/FbN/+o7O/6NZv5HOB4IrZ///LBlXB5wrO/qCNB5pzOOhgNBK7RICDhQNCX5P96td/91u4FBvpJLAoQPDrplEQRNdFYPVu93qvVO5JYJurZDSJV1FYP9FYP16oXBfJRKIbJpQB7vVv/3AwJvCbpTZVVIP9/9d6/9AALdTbJgAVEJDZMACoiCLAjZNAAqSKbpjZNSoo7PQg4zCIx9/FaBQBJ4rZRHqJQBFYzZRLCN/HooYRCQIRQYQ1dDCFVQR4A/ADFXCSK5RDJ40Iq6nPW6LcIq//fh39SrNf/6EN/47OFZp0NFbd/K5wPPI5obNM5F1FaYPNdYLcGfpA3IDQIrXABZ6FDSLcZTxAIBW4zcBFa4ZBFaLsNFZYZGFZBpIACCdBFZ7BFq7dSZJArOfQwAHHQYYBFaA+JABwhBIggrObirIJFZLuBbioXJFZI/JWJorBEJIJJS4KFRrqbKFZLvDupYSeZIrJbiwrBNwIrnTQYrReBIrNCpArKBRQAKIJQrLNhCvNJidXQSZYCPCiCTIQS6KEI4pVAAddFaF1FbAZHfioAVFYyUJWbRXHLrqxFFYhVeLI4rq6orCMAoAhFa4"))
};

/* Set hour hand image */

var imgHour = {
  width : 14, height : 114, bpp : 2,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AH4A/AB8P/4DB//wAz8D//8BIIKBn4DB54CBACPzAQP8EoImBD4PAJkQG/A34GIgbUBA"))
};

/* Set minute hand image */

var imgMin = {
  width : 4, height : 168, bpp : 2,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AH4AE/4A/AEI"))
};

/* Set second hand image */

var imgSec = {
  width : 6, height : 176, bpp : 2,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("qoA/ADFf6v9AU1c6vNFlICWvtXAXlVA="))
};

/* Sets the font for the date at an appropriate size of 14 */

Graphics.prototype.setFontWorkSans = function(scale) {
  // Actual height 12 (12 - 1)
  this.setFontCustom(atob("AAAAAAADwAAAPAAAAAAAAAvAAC/0AH/gAL/QAD9AAAIAAAAACQAAL/9AC/r9APAA8A8ADwDwAfAH//wAH/8AAAAAADwAAAtAAAH//8Af//wAAAAAAAAAABwAUAfgHwDwA/APAP8A8DzwD/9PAD/Q8AAABQAAA0AHwDwA9AHwDw4PAPDw8A///gA/f8AAAAAAAAQAAAvAAAP8AALzwAD8PAAv//wB///AAAPAAAAUAAAAAAC/88AP/y8A8NDwDywPAPD18A8L/AAAGgAAAAAAC/8AA//9ALTx8A8ODwDw4PALz/8ALD/AAAAAAPAAAA8AAADwB/APC/8A9/gAD/AAAPgAAAAAAAAAAAAB8fwAf//wDw8PAPDw8A8PDwB///AC8vwAAAAAAAAAAD/DgAv/PQDwsPAPC08A8PDwB//8AB//QAAAAAAAAAAA8DwADwPAABAE"), 46, atob("BAYJBggICQgJCAkJBA=="), 14+(scale<<8)+(2<<16));
  return this;
};

/* Sets the font for the day at an appropriate size of 12 */

Graphics.prototype.setFontWorkSansSmall = function(scale) {
  // Actual height 12 (11 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAABAP/zwGqjQAAAAP0AAEAAAP4AAGAAAAEoAAs/gL//QL88AAt/gL/+QK88AAYAAAUFAD+PAHPDgv//8fr70Hj7QCx+AAAAAC8AAL/AAPHBgL/PQB68AAPgAC9/APT7wEDjwAC/QAAAAAAuAC7/gL/DwPPywL9/gCwvAAD7wAABgAAAAP0AAEAAAACkAC//wP0C8sAAPYAAGPQA+D//0Af9ABQAADzAAB/AAv8AAB/AADyAABAAAACAAADgAADgAC//AAr5AADgAADQAAABAAAD9AAD0AAAAACwAACwAACwAACwAAAgAAABAAADwAADQAAAkAAv0Af9AL+AAvAAAAKgAD//ALgLgPADwPADwD//QA/9AAAAAAwAADwAAL//gL//gAAAAAgBQD4DwPAPwPA/wLnzwD/TwAUBQAAFADwPQLADwPDDwPvjwD+/AAQYAAAoAAD8AAv8AD08AP//gL//gAA8AAAAAL/PAPrDwPPDwPPDwPH/AAAoAAKgAC/+AHzrgPPDwPPDwH3/gBS+AKAAAPAAAPAbgPL/gP/QAPwAALAAAAAYAD+/ALvjwPLDwPLDwH//gBk+AAYAAD/PALTzwPDzwPDjwD//AAv8AAQBAA8DwA4DgAAAAAEBAAPD9AOD4AAAAABQAADwAAP4AANsAA8OAA4PABwHAAIUAAM8AAM8AAM8AAM8AAM8AAMoABgCAA4LAA8OAAdsAAP8AAHwAADgABgAADwAAPCzgPDzwLvBAD9AAAQAAABoAAv/wC0A8DD/OLPX3OMDjONHDHP/7Dfi5B4HQAP9AAACgAC/gB/8AP48AP48AB/8AAC/gAACgAAAAL//gP//wPDDwPDDwLv3gD+/AAAYAAGQAB/+AH0fQPADwPADwPADwDwPQBgNAAAAAL//gP//wPADwPADwHQDgD//AA/8AAAAAAAAAL//gP//wPDDwPDDwPDDwPADwAAAAAAAAL//gP//gPDAAPDAAPDAAPAAAAGQAB/+AD0fQPADwPCjwPDzwHz/QBy/gAAAAAAAAL//gL//gADAAADAAADAAL//gL//gAAAAAAAAL//gL//gAAAAAAeAAAvgAADwAADwL//gP//AAAAAAAAAL//gL//gAPAAA/0ADx/APAPwIABgAAAAL//gL//wAADwAADwAADwAACgAAAAL//gP6qQC/gAAH/QAAvwAv9AL9AAP//wGqqQAAAAL//gL6qQC+AAAP0AAB/AL//wL//gAAAAAGQAB/+AH0fQPADwPADwPADwD6vQB/9AAGQAAAAAL//gP//gPDwAPDwAH7gAD/AAAAAAAGQAB/+AH0fQPADwPAD9PAD/D6vbB/9PAGQAAAAAL//gP//gPDgAPD0ALr/AD/LwAUAgAUFAD+PALvDwPHDwPDjwLT7gDx/AAAAALAAAPAAAPAAAP//wPqqQPAAAPAAAAAAAP/+AGqvgAADwAADwAADwL//AL/4AAAAAKAAAL+AAAv9AAAvwAB/gAv8AL9AAKAAAKQAAL/QAAf/gAAPwAv/QL+AAL/gAAL/gAAvwC/+AP9AAEAAAEABgPgLwD9+AAfwAA/8AL0fgPADwOAAAL0AAB/AAAH/wA/qQL4AAPAAAFACgPAPwPA/wPHzwPvDwP4DwLQDwAAAAAAAAv///uqqvsAAPdAAAf4AAB/0AAC/wAAC4cAAKsAAPv///Kqqp"), 32, atob("BAMFCAgLCAMEBAcHAwYDBQgFBwcHBwcHBwcEBAcHBwcLCAgICQgHCQkEBwgHCgkJCAkICAcJCAwHBwgEBQQ="), 12+(scale<<8)+(2<<16));
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

  g.setFontWorkSans();
  g.setColor(g.theme.bg);
  g.setFontAlign(0,0,0);
  g.drawString(d.getDate(),162,90);
  g.setFontWorkSansSmall();
  let weekDay = d.toString().split(" ");
  if (weekDay[0] == "Sat"){g.setColor(0,0,1);}
  else if (weekDay[0] == "Sun"){g.setColor(1,0,0);}
  else {g.setColor(g.theme.bg);}
  g.drawString(weekDay[0].toUpperCase(), 137, 90);

  const handLayers = [
    {x:cx,
     y:cy,
     image:imgHour,
     rotate:hourAngle,
     center:true
    },
    {x:cx,
     y:cy,
     image:imgMin,
     rotate:minAngle,
     center:true
    },
    {x:cx,
     y:cy,
     image:imgSec,
     rotate:secAngle,
     center:true
    }];

  g.setColor(g.theme.fg);
  g.drawImages(handLayers);
}

function drawBackground() {
  g.clear(1);
  g.setBgColor(g.theme.bg);
  g.setColor(g.theme.fg);
  const bgLayer = [
    {x:cx,
     y:cy,
     image:imgBg,
     center:true
    }];
  g.drawImages(bgLayer);
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
