
/************************************************
 * Includes
 */
 const clock_info = require("clock_info");
 const storage = require('Storage');
 const locale = require('locale');

/*
 * Some vars
 */
var W = g.getWidth();
var H = g.getHeight();

 /************************************************
  * Settings
  */
 const SETTINGS_FILE = "linuxclock.setting.json";
 let settings = {
   menuPosX: 0,
   menuPosY: 0,
 };

 let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
 for (const key in saved_settings) {
   settings[key] = saved_settings[key]
 }


 /************************************************
  * Assets
  */
  Graphics.prototype.setFontUbuntuMono = function(scale) {
   // Actual height 24 (27 - 4)
   this.setFontCustom(
     atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+A4AP/ngA/+eAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAA/gAAD+AAAAAAAAAAAAD+AAAP4AAA8AAAAAAAAAAAAAAAAAAAAAAAMGAAAwfgAD/+AB//gAP/YAA/BgAAMH4AA3/gAP/8AD/+AAPwYAADBgAAAAAAAAAAAAAEAAfA4AD+DgAf4GABxwYA+HB8D4OHwBg4YAGDzgAcH8AAgPwAAAcAAAAAAA8AAAH8BgA9wOADBjwAOccAA/3gAA94AAAPeAAD3+AAcc4AHhhgA4H+ADAfwAAAeAAAAAAAAPgADx/AAf/eAD/wYAMHBgAw+GADneYAP4/AAfB8AAA/4AADzgAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gAAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAB//AAP//AD4A+AeAA8DwAB4OAADwQAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAYOAABw8AAeB4ADwD4A+AD//wAH/8AAD/AAAAAAAAAAAAAAAAAAAAAAAAAA4AAABiAAAHcAAAPwAAP8AAA/wAAAPwAAB3AAAGIAAAYAAAAAAAAAAAAAAAAAABgAAAGAAAAYAAABgAAAGAAAP/wAA//AAAGAAAAYAAABgAAAGAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAABOAAAewAAB/AAAH4AAAPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAAYAAABgAAAGAAAAYAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAB4AAAHgAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAB8AAA/wAAf4AAP8AAH+AAD/AAB/gAAPwAAA4AAAAAAAAAAAAAAAAAAB/AAA//gAH//AA8AeADhg4AMPBgAw8GADhg4APAHgAf/8AA//gAAfwAAAAAAAAAAAAAAAAGAAAAYAYADgBgAcAGAB//4AP//gA//+AAAAYAAABgAAAGAAAAIAAAAAAAAAAAAAAAGADgA4A+ADgH4AMA9gAwHGADA4YAOHBgA/4GAB/AYAD4BgAAAGAAAAAAAAAAAAAAABgA4AOADgA4AGADBgYAMGBgAw4GADjw4AP/ngAfv8AA8fgAAAYAAAAAAAAAAAAA4AAAPgAAD+AAAeYAADhgAA8GAAHgYAA8BgAD//4AP//gAABgAAAGAAAAAAAAAAAAAAAAAADgA/4OAD/gYAP+BgAw4GADDgYAMGDgAweeADA/wAMB+AAABgAAAAAAAAAAAAPAAAH/gAB//AAP4eABzA4AGMBgA4wGADjgYAMOHgAwf8ADA/gAAB4AAAAAAAAAAAAAAAAwAAADAAAAMADgAwB+ADA/4AMP8AAz8AADfAAAPwAAA8AAADgAAAAAAAAAAAAAAHAAD5/AAf38AD344AMHBgAwYGADBwYAOHBgA9+OAB/fwAD5/AAABwAAAAAAAAAAAHgAAA/gYAH+BgA4cGADAw4AMDDgAwMcADgzwAPD+AAf/wAA/+AAAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADweAAPB4AA8HgADweAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAADgA8HMADwfwAPB+AA8HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAA8AAADwAAAPgAAB+AAAGYAAA5wAADDAAAcOAABw4AAGBgAAYGAAAAAAAAAAAAMYAAAxgAADGAAAMYAAAxgAADGAAAMYAAAxgAADGAAAMYAAAxgAADGAAAAAAAAAAAAGBgAAYHAABwYAAHDgAAMMAAA5wAABmAAAH4AAAfgAAA8AAADwAAAGAAAAAAAAAAAAAAAAAAAAAOAAAAwAMADAZ4AMHngAw8eADngAAP8AAAfgAAAYAAAAAAAAAAAAAAAAAAP+AAH/+AA//+AHgB8A4PhwDD/jgMP/GAxwcYDmAxgPYDGAf/8YA//wAAAAAAAAGAAAD4AAD/gAB/wAA/+AAP4YAA8BgADwGAAP8YAAP/gAAH/gAAD/gAAA+AAAAYAAAAAA//+AD//4AP//gAwYGADBgYAMGBgAwYGADjw4AP/DgAfv8AA8fgAAA8AAAAAAAAAAAAfwAAH/wAA//gAHgPAA8AOADgA4AMABgAwAGADAAYAOABgA4AOABAAwAAAAAAAAAAD//4AP//gA//+ADAAYAMABgAwAGADgA4AOADgAcAcAA//gAB/8AAB/AAAAAAAAAAAAAAAAD//4AP//gA//+ADBgYAMGBgAwYGADBgYAMGBgAwYGADBgYAIABgAAAAAAAAAAAAAAA//+AD//4AP//gAwYAADBgAAMGAAAwYAADBgAAMGAAAwYAADAAAAAAAAAAAAAAH8AAB/8AAP/4AB4DwAPADgA4AOADAAYAMABgAwAGADgf4AOD/gAQP+AAAAAAAAAAA//+AD//4AP//gAAYAAABgAAAGAAAAYAAABgAAAGAAA//+AD//4AP//gAAAAAAAAAAAAAAAwAGADAAYAMABgAwAGAD//4AP//gAwAGADAAYAMABgAwAGAAAAAAAAAAAAAAAAAAQAAADAAwAOADAAYAMABgAwAGADAAYAMADgA//8AD//wAP/8AAAAAAAAAAAAAAAAAAAAD//4AP//gAAcAAADwAAAfgAAHvAAA8eAAHg+AA8A8ADgB4AIADgAAACAAAAAAAAAAA//+AD//4AP//gAAAGAAAAYAAABgAAAGAAAAYAAABgAAAGAAAAYAAAAAAAAAAAP/4AP//gA/+AAD+AAAB/AAAA+AAAD4AAB/AAA/gAAD/4AAP//gAH/+AAAAAAAAAAA//+AD//4AP//gAfAAAA+AAAA+AAAA/AAAA/AAAA/AA//+AD//4AP//gAAAAAAAAAAB/8AAP/4AB+PwAOADgA4AOADAAYAMABgA4AOADgA4AH4/AAP/4AAf/AAAAAAAAAAAAAAAAP//gA//+AD//4AMBgAAwGAADAYAAODgAA4OAAB/wAAD+AAAHwAAAAAAAAAAAAD/wAA//wAH4fgA4APADgAcAMAA8AwAD4DgAfgPAD3Afh+MA//wwA/8CAAAAAAAAAAP//gA//+AD//4AMDAAAwMAADAwAAMDgAA4fgAD/vgAH+PgAPwOAAAAYAAAAAAAAAAAAAQAD4DAAfwOAD/AYAOOBgAwYGADBwYAMDDgA4OOADgfwAEB/AAABwAAAAAAAAAAAwAAADAAAAMAAAAwAAADAAAAP//gA//+ADAAAAMAAAAwAAADAAAAMAAAAAAAAAAAAAP/8AA//4AD//wAAADgAAAGAAAAYAAABgAAAGAAAA4AP//AA//4AD//AAAAAAAwAAAD4AAAP8AAAP/AAAD/gAAB/gAAAeAAAB4AAA/gAA/4AA/8AAP+AAA+AAADAAAAAAAAA//wAD//4AAf/gAAD+AAB/AAAPgAAA+AAAB/AAAA/gAB/+AD//4AP/4AAAAAAAAAAAIABgA4AeAD4H4AH5+AAH/gAAH4AAAfgAAH/gAB+fgAPgfgA4AeACAAYAAAAAAgAAADgAAAPgAAAfgAAAfgAAAfgAAAf+AAB/4AAfgAAH4AAB+AAAPgAAA4AAACAAAAAAAAAAAGADAB4AMAfgAwD+ADA+YAMHhgAx8GADPAYAP4BgA+AGADwAYAMABgAAAAAAAAAAAAAAAAAAAAAAAA////D///8MAAAwwAADDAAAMMAAAwwAADAAAAAAAAAAAAAAAAAAAAAAAA4AAAD8AAAH+AAAH/AAAD/gAAB/wAAAf4AAAP8AAAHwAAADAAAAAAAAAAAAAAAAAAAAAAAAwAADDAAAMMAAAwwAADDAAAMP///w////AAAAAAAAAAAAAAAAAAAAAAAAAGAAAA4AAAPgAAD4AAA+AAADwAAAPAAAA+AAAA+AAAA+AAAA4AAABgAAAAAAAAAAMAAAAwAAADAAAAMAAAAwAAADAAAAMAAAAwAAADAAAAMAAAAwAAADAAAAMAAAAwAAAAAAAAAAAAAAAAAAAAAAAOAAAA8AAAB4AAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAD8AAMPwAAxzgADGGAAMYYAAxhgADmGAAPYYAAf/gAA/+AAAAAAAAAAAAAAAAAAAA///gD//+AP//4AA4BgADAGAAMAYAA4DgADgeAAH/wAAP+AAAfwAAAAAAAAAAAAPgAAD/gAAf/AABwcAAOA4AA4DgADAGAAMAYAAwBgADAGAAOA4AAABgAAAAAAAAAAAH8AAA/4AAH/wAA4HgADgOAAMAYAAwBgADgGAH//4A///gD//+AAAAAAAAAAAAAAAAA/AAAP+AAB/8AAOZ4AA5jgADGGAAMYYAAxhgADmGAAH44AAfjgAAeAAAAAAAAAAAAAAAAAMAAAAwAAAf/+AH//4A///gDjAAAMMAAAwwAADDAAAMMAAA4AAABAAAAAAAAAAH8AAA/4cAH/xwA8DjADgOMAMAYwAwBjADAOcAP//wA//+AD//wAAAAAAAAAAAAAAAAAAA///gD//+AP//4AAwAAADAAAAMAAAA4AAAD4AAAH/4AAP/gAAAAAAAAAAAAAAADAAAAMAAAAwAADjAAAPP/gA8//ABj/+AAAA4AAABgAAAGAAAA4AAABAAAAAAAAAAAAAAAAAAAcAMABwAwADADAAMAMAAw8wAHDz//8PP//gY//8AAAAAAAAAAAAAAAAAAAAAAAA///gD//+AP//4AADwAAAfgAADvAAAeeAADw8AAOB4AAwDgACAGAAAAAAAAAADAAAAMAAAAwAAADAAAAP//gA///AD//+AAAA4AAABgAAAGAAAA4AAABAAAAAAAAAAAA//gAD/+AAOAAAAwAAADgAAAP8AAA/wAADAAAAMAAAA4AAAD/+AAH/4AAAAAAAAAAAAAAAA//gAD/+AAP/4AAwAAADAAAAMAAAA4AAAD4AAAH/4AAP/gAAAAAAAAAAAAAAAAfwAAD/gAAf/AADweAAOA4AAwBgADAGAAOA4AA8HgAB/8AAD/gAAH8AAAAAAAAAAAAAAAAD//8AP//wA///ADAOAAMAYAAwBgADgOAAPB4AAf/AAA/4AAB/AAAAAAAAAAAAB/AAAP+AAB/8AAPB4AA4DgADAGAAMAYAAwDgAD//8AP//wA///AAAAAAAAAAAAAAAAAAAAAAAAAf/gAD/+AAP/4AAwAAADAAAAMAAAAwAAADAAAAMAAAAAAAAAAAAAAAAAAAAAAA4OAAHw4AA/hgADOGAAMcYAAxxgADDGAAMO4AA4fAABB8AAAAAAAAAAAAAAAAAAAAAwAAADAAAD//AAP//AA//+AAMA4AAwBgADAGAAMAYAAwDgADAEAAAAAAAAAAAAAAAAP/gAA//AAAA+AAAA4AAABgAAAGAAAAYAA//gAD/+AAP/4AAAAAAAAAAAAAAAA4AAAD8AAAP8AAAH+AAAD+AAAB4AAAHgAAD8AAB/AAA/wAAD8AAAOAAAAAAAADAAAAP+AAA//gAAH+AAAD4AAB+AAAfAAAB8AAAD+AAAB+AAAP4AA//gAD/AAAMAAAAAAAACAGAAMA4AA8HgAB54AAD/AAAH4AAAPgAAD/AAAeeAADw+AAMA4AAgBgAAAAAAAAAAAgADAD4AMAP4AwAf8DAAH8cAAD/gAAD8AAB/AAB/wAA/4AAD8AAAMAAAAAAAAAAAAAAAAAAwDgADAeAAMH4AAw9gADPmAAN4YAA/BgAD4GAAPAYAAwBgAAAAAAAAAAAAAAAAAAAAAYAAABgAAAPAAD///Af/f+D/wf8MAAAwwAADDAAAMMAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///w////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAADDAAAMMAAAwwAADD/w/8H/3/gP//8AAPAAAAYAAABgAAAAAAAAAAAAAAAAADAAAA8AAADgAAAMAAAA4AAADgAAAHAAAAcAAAAwAAAHAAAA8AAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='),
     32,
     atob("Dg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4c"),
     28+(scale<<8)+(1<<16)
   );
   return this;
 }



 /************************************************
  * Menu
  */
 var dateMenu = {
   name: "date",
   img: null,
   items: [
     { name: "time",
     get: () => ({ text: getTime(), img: null}),
     show: function() {},
     hide: function () {}
   },
   { name: "day",
    get: () => ({ text: getDay(), img: null}),
    show: function() {},
    hide: function () {}
   },
   { name: "date",
     get: () => ({ text: getDate(), img: null}),
     show: function() {},
     hide: function () {}
   },
   { name: "week",
     get: () => ({ text: weekOfYear(), img: null}),
     show: function() {},
     hide: function () {}
   },
   ]
 };

 var menu = clock_info.load();
 menu = menu.concat(dateMenu);

 // Ensure that our settings are still in range (e.g. app uninstall). Otherwise reset the position it.
 if(settings.menuPosX >= menu.length || settings.menuPosY > menu[settings.menuPosX].items.length ){
   settings.menuPosX = 0;
   settings.menuPosY = 0;
 }

function canRunMenuItem(){
  var menuEntry = menu[settings.menuPosX];
  var item = menuEntry.items[settings.menuPosY];
  return item.run !== undefined;
}


function runMenuItem(){
  var menuEntry = menu[settings.menuPosX];
  var item = menuEntry.items[settings.menuPosY];
  try{
    var ret = item.run();
    if(ret){
      Bangle.buzz(300, 0.6);
    }
  } catch (ex) {
    // Simply ignore it...
  }
}

/************************************************
* Helper
*/
function getTime(){
  var date = new Date();
  return twoD(date.getHours())+ ":" + twoD(date.getMinutes());
}

function getDate(){
  var date = new Date();
  return twoD(date.getDate()) + "." + twoD(date.getMonth() + 1);
}

function getDay(){
  var date = new Date();
  return locale.dow(date, true);
}

function weekOfYear() {
  var date = new Date();
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}



/************************************************
* Draw
*/
function draw() {
  queueDraw();

  g.setFontUbuntuMono();
  g.setFontAlign(-1, -1);

  g.clearRect(0,24,W,H);

  drawMainScreen();
}



function drawMainScreen(){
  // Get menu item based on x
  var menuItem = menu[settings.menuPosX];
  var cmd = menuItem.name.slice(0,5).toLowerCase();
  drawCmd(cmd);

  // Draw menu items depending on our y value
  drawMenuItems(menuItem);

  // And draw the cursor
  drawCursor();
}

function drawMenuItems(menuItem) {
  var start = parseInt(settings.menuPosY / 4) * 4;
  for (var i = start; i < start + 4; i++) {
    if (i >= menuItem.items.length) {
      continue;
    }

    var item = menuItem.items[i];
    drawText(item.name, item.get().text, (i%4)+1);
  }
}

function drawCursor(){
  g.setFontUbuntuMono();
  g.setFontAlign(-1, -1);
  g.setColor(g.theme.fg);

  g.clearRect(0, 27 + 28, 15, H);
  if(!Bangle.isLocked()){
    g.drawString(">", -2, ((settings.menuPosY % 4) + 1) * 27 + 28);
  }
}

function drawText(key, value, line){
  var x = 15;
  var y = line * 27 + 28;

  g.setFontUbuntuMono();
  g.setFontAlign(-1, -1);
  g.setColor(g.theme.fg);

  if(key){
    key = (key.toLowerCase() + "    ").slice(0, 4) + "|";
  } else {
    key = ""
  }

  value = String(value).replace("\n", " ");
  g.drawString(key + value, x, y);

}


function drawCmd(cmd){
  var c = 0;
  var x = 10;
  var y = 28;

  g.setColor("#0f0");
  g.drawString("bjs", x+c, y);
  c += g.stringWidth("bjs");

  g.setColor(g.theme.fg);
  g.drawString(":", x+c, y);
  c += g.stringWidth(":");

  g.setColor("#0ff");
  g.drawString("$ ", x+c, y);
  c += g.stringWidth("$ ");

  g.setColor(g.theme.fg);
  g.drawString(cmd, x+c, y);
}

function twoD(str){
  return ("0" + str).slice(-2)
}


/************************************************
* Listener
*/
// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});


Bangle.on('lock', function(isLocked) {
  drawCursor();
});


Bangle.on('charging',function(charging) {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;

  settings.menuPosX=0;
  settings.menuPosY=0;

  draw();
});


Bangle.on('touch', function(btn, e){
  var left = parseInt(g.getWidth() * 0.22);
  var right = g.getWidth() - left;
  var upper = parseInt(g.getHeight() * 0.22) + 20;
  var lower = g.getHeight() - upper;

  var is_upper = e.y < upper;
  var is_lower = e.y > lower;
  var is_left = e.x < left && !is_upper && !is_lower;
  var is_right = e.x > right && !is_upper && !is_lower;
  var is_center = !is_upper && !is_lower && !is_left && !is_right;

  var oldYScreen = parseInt(settings.menuPosY/4);
  if(is_lower){
    if(settings.menuPosY >= menu[settings.menuPosX].items.length-1){
    return;
    }

    Bangle.buzz(40, 0.6);
    settings.menuPosY++;
    if(parseInt(settings.menuPosY/4) == oldYScreen){
    drawCursor();
    return;
    }
  }

  if(is_upper){
    if(e.y < 20){ // Reserved for widget clicks
      return;
    }

    if(settings.menuPosY <= 0){
    return;
    }
    Bangle.buzz(40, 0.6);
    settings.menuPosY--;
    settings.menuPosY = settings.menuPosY < 0 ? 0 : settings.menuPosY;

    if(parseInt(settings.menuPosY/4) == oldYScreen){
    drawCursor();
    return;
    }
  }

  if(is_right){
    Bangle.buzz(40, 0.6);
    settings.menuPosX = (settings.menuPosX+1) % menu.length;
    settings.menuPosY = 0;
  }

  if(is_left){
    Bangle.buzz(40, 0.6);
    settings.menuPosY = 0;
    settings.menuPosX  = settings.menuPosX-1;
    settings.menuPosX = settings.menuPosX < 0 ? menu.length-1 : settings.menuPosX;
  }

  if(is_center){
  if(!canRunMenuItem()){
    return;
  }
  runMenuItem();
  }

  draw();
});

E.on("kill", function(){
  try{
    storage.write(SETTINGS_FILE, settings);
  } catch(ex){
    // If this fails, we still kill the app...
  }
});


/************************************************
* Startup Clock
*/
// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load and draw widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// Draw first time
draw();
