Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.reset();
c = 1;


var icoBeer = require("heatshrink").decompress(atob("lEoxH+AG2BAAoecEpAoWC4fXAAIGGAAowTDxAmJE4YGGE5QeJE5QHHE7owJE0pQKE7pQJE86fnE5QJSE5YUHBAIJQYxIpFAAvGBBAJIExYoGDgIACBBApFExonCDYoAOFSAnbFJYnE6vVDYYFHAwakQE4YaFAoQGJEIYoME7QoEE7ogFE/4neTBgntY84n/E+7HUE64mDE8IAFEw4nDTBifIE9gmId7gALE5IGCAooGDE6gASE8yaME7gmOFIgAREqIAhA=="));
var icoCocktail = require("heatshrink").decompress(atob("lEoxH+AH4AJtgABEkgmiEiXGAAIllAAiXeEAPXAQQDCFBYmTEgYqDFBZNWAIZRME6IfBEAYuEE5J2UwIAaJ5QncFBB3DB4YGCACQnKTQgoXE5bIEE6qfKPAZRFA4MUABgmNPAonBCgQnPExgpFPIgoNEyBSF4wGBFBgmSABCjJTZwoXEzwoHE0AoFE0QnCFAQmhKAonjFAInCE0Qn/E/4n/E/4n/wInDFEAhBEwQoDFLYdCEwooEFTAjHAAwoYIYgAMPDglT"));
var icoShot = require("heatshrink").decompress(atob("lEoxH+AH4A/AH4A/AH4AqwIAgE+HXADRPME8ZQM5AnSZBQkGAAYngEYonfJA5QQE8zGJFAYfKFBwmKE4iYIE7rpIeYgAJE5woEEpQKHTxhQIIpJaHJxgn/E8zGQZBAnQYxxQRFQYnlFgon5FCYmDE6LjHZRQmPE5AAOE/4njFCTGQKCwmRKAgATE54oWEyAqTDZY"));

function setColor(delta){
	c+=delta;
	c = Math.max(c,0);
	c = Math.min(c,2);
	if (c<1){
		g.setColor(c,0,0);
		Bangle.setLCDBrightness(c >= 0.1 ? c : 0.1);
	}else{
		g.setColor(1,c-1,c-1);
		Bangle.setLCDBrightness(1);
		}
	g.fillRect(0,0,g.getWidth(),g.getHeight());
}

function updownHandler(direction){
if (direction == undefined){
	c=1;
	setColor(0);
	} else {
	setColor(-direction * 0.1);
	}
}

setColor(0);
	g.drawImage(icoBeer,0,100);
	g.drawImage(icoCocktail,40,100);
	g.drawImage(icoShot,80,100);

// Bangle 1:
// BTN1: light up toward white
// BTN3: light down to red
// BTN2: reset
// Bangle 2:
// Swipe up: light up toward white
// Swipe down: light down to red
// BTN1: reset
Bangle.setUI("updown", updownHandler);
