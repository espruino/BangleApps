var W = g.getWidth(), H = g.getHeight();
var position=0;
var response="...";

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
    draw();
  }

  if(isLeft){
    position -= 1;
    position = position < 0 ? 1 : position;
    draw();
  }

  if(!isRight && !isLeft){
    Bangle.buzz(40, 0.6);

    // Trigger HA bridge
    response = "sending...";
    draw();

    var url = "https://www.google.com/";
    response = Bluetooth.println(JSON.stringify({t:"http", url:url}));
  }

  draw();
});

Bangle.loadWidgets();
Bangle.drawWidgets();