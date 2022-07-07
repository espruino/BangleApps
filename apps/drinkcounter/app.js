
setting = require("Storage").readJSON("setting.json",1);
E.setTimeZone(setting.timezone); // timezone = 1 for MEZ, = 2 for MESZ
var _12hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"]||false;
var ampm = "AM";
let drag;

var icoBeer = require("heatshrink").decompress(atob("lEoxH+AG2BAAoecEpAoWC4fXAAIGGAAowTDxAmJE4YGGE5QeJE5QHHE7owJE0pQKE7pQJE86fnE5QJSE5YUHBAIJQYxIpFAAvGBBAJIExYoGDgIACBBApFExonCDYoAOFSAnbFJYnE6vVDYYFHAwakQE4YaFAoQGJEIYoME7QoEE7ogFE/4neTBgntY84n/E+7HUE64mDE8IAFEw4nDTBifIE9gmId7gALE5IGCAooGDE6gASE8yaME7gmOFIgAREqIAhA=="));
var icoCocktail = require("heatshrink").decompress(atob("lEoxH+AH4AJtgABEkgmiEiXGAAIllAAiXeEAPXAQQDCFBYmTEgYqDFBZNWAIZRME6IfBEAYuEE5J2UwIAaJ5QncFBB3DB4YGCACQnKTQgoXE5bIEE6qfKPAZRFA4MUABgmNPAonBCgQnPExgpFPIgoNEyBSF4wGBFBgmSABCjJTZwoXEzwoHE0AoFE0QnCFAQmhKAonjFAInCE0Qn/E/4n/E/4n/wInDFEAhBEwQoDFLYdCEwooEFTAjHAAwoYIYgAMPDglT"));
var icoShot = require("heatshrink").decompress(atob("lEoxH+AH4A/AH4A/AH4AqwIAgE+HXADRPME8ZQM5AnSZBQkGAAYngEYonfJA5QQE8zGJFAYfKFBwmKE4iYIE7rpIeYgAJE5woEEpQKHTxhQIIpJaHJxgn/E8zGQZBAnQYxxQRFQYnlFgon5FCYmDE6LjHZRQmPE5AAOE/4njFCTGQKCwmRKAgATE54oWEyAqTDZY"));
var drawTimeout;
var activeDrink = 0;
var drinks = [0,0,0];

function updateTime(){
	var d = new Date();
	var da = d.toString().split(" ");
	var time = da[4].split(":");
	var hours = time[0];
	var minutes = time[1];
	if (_12hour){
		//do 12 hour stuff
		if (hours > 12) {
			ampm = "PM";
			hours = hours - 12;	
			if (hours < 10) hours = doublenum(hours);	
		} else {
			ampm = "AM";	 
		} 		
	} else {
		ampm = ""
	}	 
	g.setBgColor(g.theme.bg).setColor(g.theme.bg).fillRect(0,24,176,44); //Clear
	g.setFontAlign(0,0); // center font
	g.setBgColor(g.theme.bg).setColor(g.theme.fg);
	g.setFont("Vector",14).drawString("Time: " + hours + ":" + minutes + " " + ampm,100,34);
	queueDrawTime();
}

function queueDrawTime() {
	if (drawTimeout) clearTimeout(drawTimeout);
		drawTimeout = setTimeout(function() {
			drawTimeout = undefined;
			updateTime();
		}, 20000 - (Date.now() % 20000));
}

function updateDrinks(){
	g.setBgColor(g.theme.bg).clearRect(0,145,176,176); //Clear
	g.setFont("Vector",20).setColor(g.theme.fg).drawString(drinks[activeDrink], (40 * (activeDrink + 1)) - 20, 155);
	console.log(drinks[activeDrink] + " drinks of drink #" + activeDrink);

}

function addDrink(){
	drinks[activeDrink] = drinks[activeDrink] + 1;
	updateDrinks();
}

function removeDrink(){
	if (drinks[activeDrink] > 0) drinks[activeDrink] = drinks[activeDrink] - 1;
	updateDrinks();
}



function initDragEvents() {
  Bangle.on("drag", e => {
    if (!drag) { // start dragging
      drag = {x: e.x, y: e.y};
    } else if (!e.b) { // released
      const dx = e.x-drag.x, dy = e.y-drag.y;
      drag = null;
      if (Math.abs(dx)>Math.abs(dy)+10) {
        // horizontal
		if (dx < dy) {
			console.log("left " + dx + " " + dy);
		} else {
			console.log("right " + dx + " " + dy);
		}
      } else if (Math.abs(dy)>Math.abs(dx)+10) {
        // vertical
		if (dx < dy) {
			console.log("down " + dx + " " + dy);
			removeDrink();
		} else {
			console.log("up " + dx + " " + dy);
			addDrink();
		}
    }
  }
});
}



// Todo
// Add first drink time




g.reset();
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();



g.setBgColor(g.theme.bg);
g.drawImage(icoBeer,0,100);
g.drawImage(icoCocktail,40,100);
g.drawImage(icoShot,80,100);
	
	



if (drawTimeout) clearTimeout(drawTimeout);
drawTimeout = undefined;
updateTime();
queueDrawTime();
initDragEvents();
//updateDrinks();
 
 
