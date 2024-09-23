g.reset().clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
require("Font8x16").add(Graphics);

const BANGLEJS2 = process.env.HWVERSION == 2;
const SETTINGSFILE = "drinkcounter.json";
setting = require("Storage").readJSON("setting.json",1);
E.setTimeZone(setting.timezone); // timezone = 1 for MEZ, = 2 for MESZ
var _12hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"]||false;
var ampm = "AM";
let drag;

var icoBeer		 = require("heatshrink").decompress(atob("lEoxH+AG2BAAoecEpAoWC4fXAAIGGAAowTDxAmJE4YGGE5QeJE5QHHE7owJE0pQKE7pQJE86fnE5QJSE5YUHBAIJQYxIpFAAvGBBAJIExYoGDgIACBBApFExonCDYoAOFSAnbFJYnE6vVDYYFHAwakQE4YaFAoQGJEIYoME7QoEE7ogFE/4neTBgntY84n/E+7HUE64mDE8IAFEw4nDTBifIE9gmId7gALE5IGCAooGDE6gASE8yaME7gmOFIgAREqIAhA=="));
var icoCocktail	 = require("heatshrink").decompress(atob("lEoxH+AH4AJtgABEkgmiEiXGAAIllAAiXeEAPXAQQDCFBYmTEgYqDFBZNWAIZRME6IfBEAYuEE5J2UwIAaJ5QncFBB3DB4YGCACQnKTQgoXE5bIEE6qfKPAZRFA4MUABgmNPAonBCgQnPExgpFPIgoNEyBSF4wGBFBgmSABCjJTZwoXEzwoHE0AoFE0QnCFAQmhKAonjFAInCE0Qn/E/4n/E/4n/wInDFEAhBEwQoDFLYdCEwooEFTAjHAAwoYIYgAMPDglT"));
var icoShot		 = require("heatshrink").decompress(atob("lEoxH+AH4A/AH4A/AH4AqwIAgE+HXADRPME8ZQM5AnSZBQkGAAYngEYonfJA5QQE8zGJFAYfKFBwmKE4iYIE7rpIeYgAJE5woEEpQKHTxhQIIpJaHJxgn/E8zGQZBAnQYxxQRFQYnlFgon5FCYmDE6LjHZRQmPE5AAOE/4njFCTGQKCwmRKAgATE54oWEyAqTDZY"));
var icoReset	 = require("heatshrink").decompress(atob("j0egILI8ACBh4DC/4DBh4DCv8f4ED8EPwEPEQMAvEAnkB4EA+AKBCAM8DYOA8EB//HwED/wXBg/wnAOC+EAjkDDoMgg+AJoRFCEIIAB/kHgEB/l8FwP/DYIDBC4MD/ASBgYeCAAw"));
var drawTimeout;
var activeDrink = 0;
var drinks = [0,0,0];
const maxDrinks = 2; // 3 drinks
var firstDrinkTime = null;
var firstDrinkTimeTime = null;

//var confBeerSize;
var confSex;
var confWeight;
var confWeightUnit;


// Load Status ===============
var drinkStatus = require("Storage").open("drinkcounter.status.json", "r");
var test = drinkStatus.read(drinkStatus.getLength());
if(test!== undefined) {
	drinkStatus = JSON.parse(test); 
	//console.log("read status: " + test);
	for (let i = 0; i <= maxDrinks; i++) {
		drinks[i] = drinkStatus.drinks[i];
	}	
	firstDrinkTime = Date.parse(drinkStatus.firstDrinkTime);
	//console.log("read firstDrinkTime: " + firstDrinkTime);
	if (firstDrinkTime) firstDrinkTimeTime = require("locale").time(new Date(firstDrinkTime), 1);
	//console.log("read firstDrinkTimeTime: " + firstDrinkTimeTime);
} else { 
    drinkStatus = {
        drinks: [0,0,0]
    };
	//console.log("no status file - applying default");
}
// Load Status ===============


var drinksAlcohol = [12,16,5.6]; // in gramm
// Beer:		0.3L 12g 	- 0.5L 20g
// Radler:		0.3L  6g 	- 0.5L 10g
// Wine:		0.2L 16g
// Jäger Shot:	0.02L 5.6g 

// sex:			Women 60 - Men 70 (Percent)
// Formula:		Alcohol in g /(Body weight in kg x sex) – (0,15 x Hours) = bac per mille
// Example: 	5 	Beer (0.3L=12g), 80KG, 			Male (70%), 	5 hours
// 				(5		*		12) / (80 / 100 * 	70) - (0.15 * 	5)

function drawBac(){
	if (firstDrinkTime) {
		var sum_drinks = (drinks[0] * drinksAlcohol[0]) + (drinks[1] * drinksAlcohol[1]) + (drinks[2] * drinksAlcohol[2]);
		
		if (confSex == "male") {
			sex = 70;
		} else {
			sex = 60;
		}
		var weight = confWeight;
		
		if (confWeightUnit == "US Pounds") {
			weight = weight * 0.45359237;
		}
		var currentTime = new Date();
		var time_diff = Math.floor(((currentTime - firstDrinkTime) % 86400000) / 3600000);  // in hours!
		//console.log("currentTime:    " + currentTime)
		//console.log("firstDrinkTime: " + firstDrinkTime)

		//console.log("timediff: " + time_diff);
		ebac = Math.round( ((sum_drinks) / (weight / 100 * sex) - (0.15 * time_diff)   )   * 100) / 100;

		//console.log("BAC: " + ebac + " weight: " + confWeight + " weightInKilo: " + weight + " Unit: " + confWeightUnit);
		//console.log("sum_drinks: " + sum_drinks);
		g.clearRect(0,34 + 20 + 8,176,34 + 20 + 20 + 8); //Clear
		g.setFontAlign(0,0).setFont("8x16").setColor(g.theme.fg).drawString("BAC: " + ebac, 90, 74);
	}
}


// Load settings
function loadMySettings() {
	// Helper function default setting
	function def (value, def) {return value !== undefined ? value : def;}

	var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
	//confBeerSize = def(settings.beerSize, "0.3L");
	confSex = def(settings.sex, "male");
	confWeight = def(settings.weight, 80);
	confWeightUnit = def(settings.weightUnit, "Kilo");
	//console.log("Read config - weight: " + confWeight);	
}


function updateTime(){
	var d = require("locale").time(new Date(), 1);
	
	//console.log(d);
	var time = d.split(":");
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
		ampm = "";
	}	 
	g.setBgColor(g.theme.bg).clearRect(0,24,176,44); //Clear
	g.setFontAlign(0,0); // center font
	g.setBgColor(g.theme.bg).setColor(g.theme.fg);
	g.setFont("8x16").drawString("Time: " + hours + ":" + minutes + " " + ampm,90,34);
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
		g.setColor(g.theme.fg);
		drinkStatus.drinks[i] = drinks[i];
	} 

	g.setBgColor(g.theme.bg).setColor(g.theme.fg);
	if (BANGLEJS2) { 
		g.drawImage(icoReset,145,145);
	}	
	
	drinkStatus.firstDrinkTime = firstDrinkTime; 
	settings_file = require("Storage").open("drinkcounter.status.json", "w");
	settings_file.write(JSON.stringify(drinkStatus)); 
	
	drawBac();
}

function updateFirstDrinkTime(){
	if (firstDrinkTime){
		g.setFont("8x16");
		g.setFontAlign(0,0).drawString("1st drink @ " + firstDrinkTimeTime, 90, 34 + 20 );
	}	
}	

function addDrink(){
	if (!firstDrinkTime){
		firstDrinkTime = new Date(); 
		firstDrinkTimeTime = require("locale").time(new Date(), 1);
		//console.log("init drinking! " + firstDrinkTime);
	}	
	drinks[activeDrink] = drinks[activeDrink] + 1;
	updateFirstDrinkTime();
	updateDrinks();
}

function removeDrink(){
	if (drinks[activeDrink] > 0) drinks[activeDrink] = drinks[activeDrink] - 1;
	updateDrinks();
	
	if ((!BANGLEJS2) && (drinks[0] == 0) && (drinks[1] == 0) && (drinks[2] == 0)) {
		resetDrinksFn()
	}
}

function previousDrink(){
	if (activeDrink > 0) activeDrink = activeDrink - 1;
	updateDrinks();
}

function nextDrink(){
	if (activeDrink < maxDrinks) activeDrink = activeDrink + 1;
	updateDrinks();
}

function showDrinks() {
	g.setBgColor(g.theme.bg);
	g.drawImage(icoBeer,0,100);
	g.drawImage(icoCocktail,40,100);
	g.drawImage(icoShot,80,100);
}

function resetDrinksFn() {
					g.clearRect(0,34,176,176); //Clear
					resetDrinks = E.showPrompt("Reset drinks?", {
						title: "Confirm",
						buttons: { Yes: true, No: false },
					});
					resetDrinks.then((confirm) => {
						if (confirm) {
							for (let i = 0; i <= maxDrinks; i++) {
								drinks[i] = 0;
							}
							//console.log("reset to default");
						}
						//console.log("reset " + confirm);  
						firstDrinkTime = null;
						showDrinks();
						updateDrinks();
						updateTime();
						updateFirstDrinkTime();
					});
}


function initDragEvents() {
	
if (BANGLEJS2) { 	
	Bangle.on("drag", e => {
		if (!drag) { // start dragging
			drag = {x: e.x, y: e.y};
		} else if (!e.b) { // released
			const dx = e.x-drag.x, dy = e.y-drag.y;
			drag = null;
			if (Math.abs(dx)>Math.abs(dy)+10) {
				// horizontal
				if (dx < dy) {
					//console.log("left " + dx + " " + dy);
					previousDrink();
				} else {
					//console.log("right " + dx + " " + dy);
					nextDrink();
				}
			} else if (Math.abs(dy)>Math.abs(dx)+10) {
				// vertical
				if (dx < dy) {
					//console.log("down " + dx + " " + dy);
					removeDrink();
				} else {
					//console.log("up " + dx + " " + dy);
					addDrink();
				}
			} else {
				//console.log("tap " + e.x + " " + e.y);
				if (e.x > 145 && e.y > 145) {
					resetDrinksFn();
				}
			}
		}
	});
	} else {
			setWatch(addDrink, BTN1, { repeat: true, debounce:50 });
			setWatch(removeDrink, BTN3, { repeat: true, debounce:50 });
			setWatch(previousDrink, BTN4, { repeat: true, debounce:50 });
			setWatch(nextDrink, BTN5, { repeat: true, debounce:50 });
		}
}


loadMySettings();
showDrinks();


if (drawTimeout) clearTimeout(drawTimeout);
drawTimeout = undefined;
updateTime();
queueDrawTime();
initDragEvents();
updateDrinks();
updateFirstDrinkTime();
 
