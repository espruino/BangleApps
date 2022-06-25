var storage = require("Storage");
var W = g.getWidth(), H = g.getHeight();
var position=0;


// Note: All icons should have 48x48 pixels
function getIcon(icon){
  if(icon == "light"){
    return {
      width : 48, height : 48, bpp : 1,
      transparent : 0,
      buffer : require("heatshrink").decompress(atob("AAMBwAFE4AFDgYFJjgFBnAFBjwXBvAFBh4jBuAFCAQPwAQMHAQPgEQQCBEgcf/AvDn/8Aof//5GDAoJOBh+BAoOB+EP8YFB4fwgfnAoPnGANHAoPjHYQFBHYQFd44pDg47C4/gh/DIIZNFLIplGgF//wFIgZ9BRIUHRII7Ch4FBUIUOAoKzCjwFEhgCBmDpIVooFFh4oCAA4LFC5b7BAob1BAYI="))
    };
  } else if(icon == "door"){
    return {
      width : 48, height : 48, bpp : 1,
      transparent : 0,
      buffer : require("heatshrink").decompress(atob("AAM4Aok/4AED///Aov4Aon8DgQGBAv4FpnIFKJv4FweAQFFAgQFB8AFDnADC"))
    };
  } else if (icon == "fire"){
    return {
      width : 48, height : 48, bpp : 1,
      transparent : 0,
      buffer : require("heatshrink").decompress(atob("ABsDAokBwAFE4AFE8AFE+AFE/AFJgf8Aon+AocHAokP/8QAokYAoUfAok//88ApF//4kDAo//AgMQAgIFCjgFEjwFCOYIFFHQIFDn/+AoJ/BAoIqBAoN//xCBAoI5BDIPAgP//gFB8AFChYFBgf//EJAogOBAoSgBAoMHAQIFEFgXAAoJEBv4FCNoQFGVYd/wAFEYYIFIvwCBDoV8UwQCBcgUPwDwDfQMBaIYADA"))
    };
  }

  // Default is always the HA icon
  return {
    width : 48, height : 48, bpp : 1,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("AD8BwAFDg/gAocP+AFDj4FEn/8Aod//wFD/1+FAf4j+8AoMD+EPDAUH+OPAoUP+fPAoUfBYk/C4l/EYIwC//8n//FwIFEgYFD4EH+E8nkP8BdBAonjjk44/wj/nzk58/4gAFDF4PgCIMHAoPwhkwh4FB/EEkEfIIWAHwIFC4A+BAoXgg4FDL4IFDL4IFDLIYFkAEQA=="))
  };
}

// Try to read custom actions, otherwise use default
var triggers = [
  {display: "Not found.", trigger: "NOP", icon: "ha"},
];

try{
  triggers = storage.read("ha.trigger.json");
  triggers = JSON.parse(triggers);
} catch(e) {
  // In case there are no user triggers yet, we show the default...
}


function sendIntent(trigger){
  var retries=3;

  while(retries > 0){
    try{
      // Send a startup trigger such that we could also execute
      // an action when the app is started :)
      Bluetooth.println(JSON.stringify({
        t:"intent",
        action:"com.espruino.gadgetbridge.banglejs.HA",
        extra:{
          trigger: trigger
        }})
      );
      retries = -1;

    } catch(e){
      retries--;
    }
  }
}


function draw() {
  g.reset().clearRect(Bangle.appRect);

  var h = 22;
  g.setFont("Vector", h);
  var trigger = triggers[position];
  var w = g.stringWidth(trigger.display);

  g.setFontAlign(-1,-1);
  var icon = getIcon(trigger.icon);
  g.setColor(g.theme.fg).drawImage(icon, 12, H/5-2);
  g.drawString("Home", icon.width + 20, H/5);
  g.drawString("Assistant", icon.width + 18, H/5+24);

  g.setFontAlign(0,0);
  var ypos = H/5*3+20;
  g.drawRect(W/2-w/2-8, ypos-h/2-8, W/2+w/2+5, ypos+h/2+5);
  g.fillRect(W/2-w/2-6, ypos-h/2-6, W/2+w/2+3, ypos+h/2+3);
  g.setColor(g.theme.bg).drawString(trigger.display, W/2, ypos);
}


Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.3);
  var right = g.getWidth() - left;
  var isLeft = e.x < left;
  var isRight = e.x > right;

  if(isRight){
    Bangle.buzz(40, 0.6);
    position += 1;
    position = position >= triggers.length ? 0 : position;
    draw();
  }

  if(isLeft){
    Bangle.buzz(40, 0.6);
    position -= 1;
    position = position < 0 ? triggers.length-1 : position;
    draw();
  }

  if(!isRight && !isLeft){

    // Send a default intent that we triggered something.
    sendIntent("TRIGGER");

    // Now send the selected trigger
    Bangle.buzz(80, 0.6).then(()=>{
      sendIntent(triggers[position].trigger);
      setTimeout(()=>{
        Bangle.buzz(80, 0.6);
      }, 250);
    });
  }
});

// Send intent that the we started the app.
sendIntent("APP_STARTED");

// Next load the widgets and draw the app
Bangle.loadWidgets();
Bangle.drawWidgets();

draw();
setWatch(_=>load(), BTN1);
