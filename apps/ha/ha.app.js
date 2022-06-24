var storage = require("Storage");
var W = g.getWidth(), H = g.getHeight();
var position=0;


var icon = {
  width : 48, height : 48, bpp : 1,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("AD8BwAFDg/gAocP+AFDj4FEn/8Aod//wFD/1+FAf4j+8AoMD+EPDAUH+OPAoUP+fPAoUfBYk/C4l/EYIwC//8n//FwIFEgYFD4EH+E8nkP8BdBAonjjk44/wj/nzk58/4gAFDF4PgCIMHAoPwhkwh4FB/EEkEfIIWAHwIFC4A+BAoXgg4FDL4IFDL4IFDLIYFkAEQA=="))
};

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
  g.setFont("Vector", h);
  var action = actions[position];
  var w = g.stringWidth(action);

  g.setFontAlign(-1,-1);
  g.setColor(g.theme.fg).drawImage(icon, 12, H/5-2);
  g.drawString("Home", icon.width + 20, H/5);
  g.drawString("Assistant", icon.width + 18, H/5+24);

  g.setFontAlign(0,0);
  var ypos = H/5*3+20;
  g.drawRect(W/2-w/2-8, ypos-h/2-8, W/2+w/2+5, ypos+h/2+5);
  g.fillRect(W/2-w/2-6, ypos-h/2-6, W/2+w/2+3, ypos+h/2+3);
  g.setColor(g.theme.bg).drawString(action, W/2, ypos);
}


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

// Send a startup trigger such that we could also execute
// an action when the app is started :)
Bluetooth.println(JSON.stringify({
  t:"intent",
  action:"com.espruino.gadgetbridge.banglejs.HA",
  extra:{
    trigger: "APP_STARTED"
  }})
);

// Next load the widgets and draw the app
Bangle.loadWidgets();
Bangle.drawWidgets();

draw();
setWatch(_=>load(), BTN1);
