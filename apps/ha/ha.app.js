var storage = require("Storage");
var W = g.getWidth(), H = g.getHeight();
var position=0;


// Try to read custom actions, otherwise use default
var actions = [
  "No Actions",
];

try{
  actions = storage.read("ha.trigger.txt").split(",");
} catch(e) {
  // In case there are no user actions yet, we show the default...
}


function draw() {
  g.reset().clearRect(Bangle.appRect);

  var h = 22;
  g.setFont("Vector", h).setFontAlign(0,0);
  var action = actions[position];
  var w = g.stringWidth(action);


  g.fillRect(W/2-w/2-8, H/2-h/2-8, W/2+w/2+2, H/2+h/2+2);
  g.setColor(g.theme.bg).drawString(action, W/2, H/2);
}


draw();
setWatch(_=>load(), BTN1);

Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isRight){
    Bangle.buzz(40, 0.6);
    position += 1;
    position = position >= actions.length ? 0 : position;
  }

  if(isLeft){
    Bangle.buzz(40, 0.6);
    position -= 1;
    position = position < 0 ? actions.length-1 : position;
  }

  if(!isRight && !isLeft){
    Bangle.buzz(80, 0.6).then(()=>{
      Bluetooth.println(JSON.stringify({
        t:"intent",
        action:"com.espruino.gadgetbridge.banglejs.HA",
        extra:{
          trigger: actions[position]
        }})
      );
      setTimeout(()=>{
        Bangle.buzz(80, 0.6);
      }, 250);
    });
  }

  draw();
});

Bangle.loadWidgets();
Bangle.drawWidgets();