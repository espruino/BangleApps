g.reset().clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

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
const maxDrinks = 2; // 3 drinks
var firstDrinkTime = null;



//static float get_ebac()
//{
//  float sum_drinks = getSumDrinks(drinks);
//
//  int day1 = current_time.tm_yday;
//  int hour1 = current_time.tm_hour;
//  int min1 = current_time.tm_min;
//  long int combine1 = min1+hour1*60+day1*24*60;
//
//  int day2 = settings.first_drink_time.tm_yday;
//  int hour2 = settings.first_drink_time.tm_hour;
//  int min2 = settings.first_drink_time.tm_min;
//  long int combine2 = min2+hour2*60+day2*24*60;
//
//  unsigned int time_diff = abs(combine1 - combine2);
//
//  if(settings.beer_size==1)
//  sum_drinks+=*(drinks[0].num_drinks)/0.33*0.25-*(drinks[0].num_drinks);
//  if(settings.beer_size==2)
//    sum_drinks+=*(drinks[0].num_drinks)/0.33*0.5-*(drinks[0].num_drinks);
//  if(settings.beer_size==3)
//    sum_drinks+=*(drinks[0].num_drinks)*3.0-*(drinks[0].num_drinks);
//
//  float bw = settings.sex==0 ? 0.58f:0.49f;
//  float scale_factor = settings.unit==0? 1.0f:0.453592f; // 0 = kg, 1 = pounds
//  float multiplication = settings.output==0? 10.f:1.f; //0 = %o, 1 = %
//  return( ((0.806f * sum_drinks * 1.2f)/(bw*(float)settings.weight*scale_factor) - (0.017f * (time_diff/60.f)))*multiplication);
//}

function drawEbac(){
	if (firstDrinkTime) {
		var sum_drinks = drinks[0] + drinks[1] + drinks[2];
		
		// TODO: Settings
		var bw = 0.58; //bw = settings.sex==0 ? 0.58f:0.49f;
		var weight = 80 * 0.453592; //* scale factor: 1.0f:0.453592f; // 0 = kg, 1 = pounds
		var multiplication = 10; //10.f:1.f; //0 = %o, 1 = % 
		
		var currentTime = new Date();
		var time_diff = Math.floor(((currentTime - firstDrinkTime) % 86400000) / 3600000); 
	
		console.log("timediff: " + time_diff);
	
		ebac = Math.round(((0.806 * sum_drinks * 1.2)/(bw*weight) - (0.017 * (time_diff/60)))*multiplication * 100) / 100
		console.log("BAC: " + ebac);
		g.clearRect(0,34 + 20 + 8,176,34 + 20 + 20 + 8); //Clear
		g.setFontAlign(0,0).setFont("Vector",15).setColor(g.theme.fg).drawString("BAC: " + ebac, 90, 74);
	}
}



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
	g.setBgColor(g.theme.bg).clearRect(0,24,176,44); //Clear
	g.setFontAlign(0,0); // center font
	g.setBgColor(g.theme.bg).setColor(g.theme.fg);
	g.setFont("Vector",14).drawString("Time: " + hours + ":" + minutes + " " + ampm,90,34);
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
	for (let i = 0; i <= maxDrinks; i++) {
		if (i == activeDrink) {
			g.setColor(g.theme.fg).fillRect((40 * (i + 1)) - 40 ,145,(40 * (i + 1)),176);
			g.setColor(g.theme.bg);
		} else {
			g.setColor(g.theme.fg);
		}
		g.setFont("Vector",20).drawString(drinks[i], (40 * (i + 1)) - 20, 160);
		console.log(drinks[i] + " drinks of drink #" + i + " - Active: " + activeDrink);
	} 
	drawEbac();
}

function addDrink(){
	if (!firstDrinkTime){
		firstDrinkTime = new Date();
		var dafirstDrinkTime = firstDrinkTime.toString().split(" ");
		var firstDrinkTimeTime = dafirstDrinkTime[4].split(":");
		var firstDrinkTimeHours = firstDrinkTimeTime[0];
		var firstDrinkTimeMinutes = firstDrinkTimeTime[1];
		console.log("FIRST drink @ " + firstDrinkTime + " = " + firstDrinkTime.toString());
		g.setFontAlign(0,0).setFont("Vector",15).drawString("1st drink @ " + firstDrinkTimeHours + ":" +  firstDrinkTimeMinutes, 90, 34 + 20 );
	}
	drinks[activeDrink] = drinks[activeDrink] + 1;
	updateDrinks();
}

function removeDrink(){
	if (drinks[activeDrink] > 0) drinks[activeDrink] = drinks[activeDrink] - 1;
	updateDrinks();
}

function previousDrink(){
	if (activeDrink > 0) activeDrink = activeDrink - 1;
	updateDrinks();
}

function nextDrink(){
	if (activeDrink < maxDrinks) activeDrink = activeDrink + 1;
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
			previousDrink();
		} else {
			console.log("right " + dx + " " + dy);
			nextDrink();
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


g.setBgColor(g.theme.bg);
g.drawImage(icoBeer,0,100);
g.drawImage(icoCocktail,40,100);
g.drawImage(icoShot,80,100);



if (drawTimeout) clearTimeout(drawTimeout);
drawTimeout = undefined;
updateTime();
queueDrawTime();
initDragEvents();
updateDrinks();
 

