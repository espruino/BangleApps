var W = g.getWidth(), H = g.getHeight();


function draw() {
  g.reset().clearRect(Bangle.appRect);

  // Header
  g.setFont("Vector", 22).setFontAlign(0,-1);
  g.drawString("", W/2, H/2);
}


draw();
setWatch(_=>load(), BTN1);

Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isRight){

  }

  if(isLeft){

  }

  draw();
});

Bangle.loadWidgets();
Bangle.drawWidgets();