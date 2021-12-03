E.showMessage("Waiting for message");
Bangle.loadWidgets();
Bangle.drawWidgets();

var history = [];

GB = function(e) {
  if (history.length > 10)
    history = history.slice(history.length-10);
  history.push(e);

  var s = JSON.stringify(e,null,2);

  g.reset().clear(Bangle.appRect);
  g.setFont("6x8").setFontAlign(-1,0);
  g.drawString(s, 10, g.getHeight()/2);
};

function show() {
  print(JSON.stringify(history,null,2));
}
