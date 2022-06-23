var _GB = global.GB;


var W = g.getWidth(), H = g.getHeight();
var position=0;
var response="...";


function GB(msg) {
  if (msg.t == "http" || msg.t == "intent") {
    response = JSON.stringify(msg);
    draw();
  }

  if (_GB) {
    _GB(msg);
  }
}


function draw() {
  g.reset().clearRect(Bangle.appRect);

  // Header
  g.setFont("Vector", 32).setFontAlign(0,0);
  var text = "";
  if(position == 0){
    text = "Door";
  } else if(position == 1){
    text = "Light";
  }

  g.drawString(text, W/2, H/3);
  g.setFont("Vector", 24);
  g.drawString(response, W/2, H/3+34);
}


draw();
setWatch(_=>load(), BTN1);

Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isRight){
    position += 1;
    position = position > 1 ? 0 : position;
  }

  if(isLeft){
    position -= 1;
    position = position < 0 ? 1 : position;
  }

  if(!isRight && !isLeft){
    Bangle.buzz(40, 0.6);

    // Trigger HA bridge
    response = "sending...";
    Bluetooth.println(JSON.stringify({t:"int­ent",action:"com.espruino.gadgetbridge.banglejs.TOGGLE_LIGHT",extra:{}}));
  }

  draw();
});

Bangle.loadWidgets();
Bangle.drawWidgets();