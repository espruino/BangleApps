//notify your phone

const fontSize = g.getWidth() / 8;
var finding = false;

function draw() {
  // show message
  g.clear(g.theme.bg);
  g.setColor(g.theme.fg);
  g.setFont("Vector", fontSize);
  g.setFontAlign(0,0);

  if (finding) {
    g.drawString("Finding...", g.getWidth()/2, (g.getHeight()/2)-20);
    g.drawString("Click to stop", g.getWidth()/2, (g.getHeight()/2)+20);
  } else {
    g.drawString("Click to find", g.getWidth()/2, g.getHeight()/2);
  }
  g.flip();
}

function findPhone(v) {
  Bluetooth.println("");
  Bluetooth.println(JSON.stringify({t:"findPhone", n:v}));
}

function find(){
  finding = !finding;
  draw();
  findPhone(finding);
}

draw();

//register all buttons and screen to find phone
setWatch(find, BTN1, {repeat:true});

if (process.env.HWVERSION == 1) {
  setWatch(find, BTN2, {repeat:true});
  setWatch(find, BTN3, {repeat:true});
  setWatch(find, BTN4, {repeat:true});
  setWatch(find, BTN5, {repeat:true});
}

if (process.env.HWVERSION == 2) {
  Bangle.on('touch', function(button, xy) {

    // click top part of the screen to stop start
    if (xy.y < g.getHeight() / 2) {
      find();
    } else {
      findPhone(false);
      setTimeout(load, 100); // exit in 100ms
    }
  });
}
