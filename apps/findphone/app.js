//notify your phone

var finding = false;

function draw() {
  // show message
  g.clear(1);
  require("Font8x12").add(Graphics);
  g.setFont("8x12",3);
  g.setFontAlign(0,0);
  if (finding) {
    g.drawString("Finding...", g.getWidth()/2, (g.getHeight()/2)-20);
    g.drawString("Click to stop", g.getWidth()/2, (g.getHeight()/2)+20);
  } else {
    g.drawString("Click to find", g.getWidth()/2, g.getHeight()/2);
  }
  g.flip();
}

function find(){
  finding = !finding;
  draw();
  Bluetooth.println("\n"+JSON.stringify({t:"findPhone", n:finding}));
}

draw();

//register all buttons and screen to find phone
setWatch(find, BTN1, {repeat:true});
setWatch(find, BTN2, {repeat:true});
setWatch(find, BTN3, {repeat:true});
setWatch(find, BTN4, {repeat:true});
setWatch(find, BTN5, {repeat:true});
