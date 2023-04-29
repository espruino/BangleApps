
const modeNames = [/*LANG*/"Noisy", /*LANG*/"Alarms", /*LANG*/"Silent"];
let bSettings = require('Storage').readJSON('setting.json',true)||{};
let current = 0|bSettings.quiet;
//0 off
//1 alarms
//2 silent

console.log("old: " + current);

switch (current) {
	case 0:
		bSettings.quiet = 2;
		Bangle.buzz();
		setTimeout('Bangle.buzz();',500);
		break;
	case 1:
		bSettings.quiet = 0;  
		Bangle.buzz();
		break;
	case 2:
		bSettings.quiet = 0;
		Bangle.buzz();
		break;
	default:
		bSettings.quiet = 0;
		Bangle.buzz(); 
}
	
console.log("new: " + bSettings.quiet);

E.showMessage(modeNames[current] + " -> " + modeNames[bSettings.quiet]);
setTimeout('exitApp();', 2000);


function exitApp(){

require("Storage").writeJSON("setting.json", bSettings);
// reload clocks with new theme, otherwise just wait for user to switch apps

load()
 
}