var font = atob("f3/gMB/7+AAAACA///AAAAAAQcHhsZ+LhAAAgUhsPh38eAAADAoJCI///BAA8XhkMhn8eAAAPz/0Mhn4eAAAgEAh8f+HgAAAb3/kMh/7eAAAeH5hML/z8AAAAAADYbAAAAAA");

function draw() {
  g.reset();
  g.setFontCustom(font, 48, 8, 1801);
  g.setFontAlign(0, -1, 0);
  let line1, line2;
  if (showDate) {
    if (g.theme.dark) {
      g.setColor("#00ffff"); // cyan date numbers for dark mode
    }
    else {
      g.setColor("#0000ff"); // blue date numbers for light mode
    }
    line1 = ("0"+(new Date()).getDate()).substr(-2);
    line2 = ("0"+((new Date()).getMonth()+1)).substr(-2);
  }
  else {
    if (g.theme.dark) {
      g.setColor(1,1,1);    // white time numbers for dark mode
    }
    else {
      g.setColor(0);        // black time numbers for light mode
    }
    var d = new Date();
    var da = d.toString().split(" ");
    line1 = da[4].substr(0,2);
    line2 = da[4].substr(3,2);
  }
  g.drawString(line1, 95, 30, true);
  g.drawString(line2, 95, 106, true);
  }

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function(on) {
  if (on) draw();
});

Bangle.on('touch', function(on) {
  if (on) {
    showDate = !showDate;     // toggle date mode on and off
    draw();
  }
});

g.clear();
var showDate = 0;
setInterval(draw, 15000);     // refresh display every 15s
draw();

// Show launcher when button pressed
Bangle.setUI("clock");

Bangle.loadWidgets();
Bangle.drawWidgets();
