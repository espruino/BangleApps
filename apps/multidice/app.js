var menu = true;
const DICE_ARRAY = [0, 4, 6, 8, 10, 12, 20, 100];
const SELECTION_ARRAY = [6, 0, 0, 0, 0, 0, 0, 0]; // default to selecting a single d20

function drawMenu() {
	
	stringArr = new Array ("", "", "", "", "", "", "", "");
	for (i = 0; i < 8; i++) {
		
		if (SELECTION_ARRAY [i] != 0) {
			
			stringArr [i] = "" + DICE_ARRAY [SELECTION_ARRAY [i]];
		}
	}
	
	g.clear();
	g.setFont ("Vector", 40);
	
	g.drawString (("	 " + stringArr [0]).slice (-3), 5, 10);
	g.drawString (("	 " + stringArr [1]).slice (-3), 5, 50);
	g.drawString (("	 " + stringArr [2]).slice (-3), 5, 90);
	g.drawString (("	 " + stringArr [3]).slice (-3), 5, 130);
	g.drawString (("	 " + stringArr [4]).slice (-3), 96, 10);
	g.drawString (("	 " + stringArr [5]).slice (-3), 96, 50);
	g.drawString (("	 " + stringArr [6]).slice (-3), 96, 90);
	g.drawString (("	 " + stringArr [7]).slice (-3), 96, 130);
}

function touchHandler (button, xy) {
	
	if (! menu) {
		
		menu = true;
		drawMenu();
		return;
	}
	
	if (xy.x <= 87) { // left
		
		if (xy.y <= 43) {
			
			selection = 0;
		} else if (xy.y <= 87) {
			
			selection = 1;
		} else if (xy.y <= 131) {
			
			selection = 2;
		} else {
			
			selection = 3;
		}
	} else { // right
		
		if (xy.y <= 43) {
			
			selection = 4;
		} else if (xy.y <= 87) {
			
			selection = 5;
		} else if (xy.y <= 131) {
			
			selection = 6;
		} else {
			
			selection = 7;
		}
	}
	
	// increment SELECTION_ARRAY [selection]
	if (SELECTION_ARRAY [selection] == 7) {
		
		SELECTION_ARRAY [selection] = 0;
	} else {
		
		SELECTION_ARRAY [selection] += 1;
	}
	
	drawMenu();
}

function accelHandler (xyz) {
	
	if (xyz.diff >= 0.4) {
		
		menu = false;
		rollDice();
	}
}

function voidFn() {
	
	return;
}

function rollDice() {
	
	resultsArr = new Uint8Array (8);
	for (i = 0; i < 8; i++) {
		
		if (SELECTION_ARRAY [i] != 0) {
			
			resultsArr [i] = random (DICE_ARRAY [SELECTION_ARRAY [i]]);
		}
	}
	
	g.clear();
	g.setFont ("Vector", 40);
	
	for (i = 0; i < 4; i++) {
		
		if (SELECTION_ARRAY [i] != 0) {
			
			g.drawString (("	 " + resultsArr [i]).slice (-3), 5, 10 + 40 * i);
		}
	}
	
	for (i = 4; i < 8; i++) {
		
		if (SELECTION_ARRAY [i] != 0) {
			
			g.drawString (("	 " + resultsArr [i]).slice (-3), 96, 10 + 40 * (i - 4));
		}
	}
}

function random (max) {
	
	return Math.round (Math.random() * (max - 1) + 1);
}

function vibrate() {
	
	Bangle.on ('accel', voidFn);
	Bangle.buzz().then ((value) => {
		
		Bangle.on ('accel', accelHandler)
	});
}

drawMenu();
Bangle.on ('touch', touchHandler);
Bangle.on ('accel', accelHandler);
