{
let loadingScreen = function(){
  g.reset();

  let x = g.getWidth()/2;
  let y = g.getHeight()/2;
  g.setColor(g.theme.bg);
  g.fillRect(x-49, y-19, x+49, y+19);
  g.setColor(g.theme.fg);
  g.drawRect(x-50, y-20, x+50, y+20);
  g.setFont("6x8");
  g.setFontAlign(0,0);
  g.drawString("Fastloading...", x, y);
  g.flip(true);
};

// only needed to show "Fastloading..." on starting the launcher
Bangle.load = (o => (name) => {
  if (Bangle.uiRemove) loadingScreen();
  setTimeout(o,0,name);
})(Bangle.load);
}
