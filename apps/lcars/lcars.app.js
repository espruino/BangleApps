/*
 * Requirements and globals
 */
const locale = require('locale');
var alarm = -1;

var img = {
  width : 176, height : 151, bpp : 3,
  buffer : require("heatshrink").decompress(atob("gFz588+YCbEYdx48cATMHz1584CcIAUCpMkyQCZQDqDjQDqD/QdOatOmATKDDhEgwQCZNAZmDAHKDC8hB9Qf6DE8CD/55A9QYegQf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/ABthw0YsCD9ps06dIQftp02aQf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6Dojlx46D+AGaDNAGaD/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qc9hw0YAQgJBg8cuPHASfAEoUaPQQCIQZkE6ZTCAQgLBnPnz15ASd4E4UTEw4CDQZcBLJILBp88+fPASfIQbcNLJKDqoBBKLJSDpzBAKgZZKQboAXLJaDdAC+TQf8AQBCD4QBCD/Qf6D/Qf6D/Qf6D/Qf6DKDzQAiPQWYIPqDC4CD/fwKD/mhB+Qf6D/AAcYsOGIPwA/AH4A/AH4AHyVJkhB+jlx46D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6D/Qf6DlwCD/48UQf8kyVIkGChACeFAImBFIQCSkCDCAUXEgEB02atICVLKxoPQYM06dNASqD/Qf6D/Qf6D/Qf6D/ARo="))
}

var iconPlanet = {
  width : 60, height : 60, bpp : 3,
  buffer : require("heatshrink").decompress(atob("AA8Dhkw4YCB4AVOoMEiACEChgpEAQcckAWLiEAwgsDAoMwoAUJFIwsDuJcJkGCgEBFIImBhEgwky7YtIFI4sE48cFhSACAoIsC2XbtuwQZwsGuAWFEYOCQYIFCwAvBggsC2hyEbQoCFFIIsCRIsCFgQCEcAUs2wsB23QWBsMmIsKFIoCBkLmBpctFga2EFhQpDAQawEFgmAAQMCiHLFgtsbphZHcYYsGwkQgACBoaGEAQIVBuAsKWYwsCmSGGFINBWYbgCFgWwfYIsihmy5dsF4QsO4YsGnmyFgwpCAQcy5ckcwIsQcYK5EFhACBgIvGXIWQFh6MFFhUhgDjBFglAggsUAQIsBoAsHXJEAwEAFi2wLJACDwAsEBAMcFKIsDgApJAQcAFgQICFKQCDFJYCEgAFDDopfQJob+BRhosEjlxfwNxFhpHCwmy5csAQJ9BdJUADQIpCAQosLgEhFIQCFQAgsFgExFhHHFhcztgsHljsHwAsMXJAVBgEDtu27YsG2AsJgIsKuAsNAQJcHF4gVCgEHFhJcG4AsDposDLg+QFgQrDCwIsQCwgABFga5GWwQUGhjjOCwykCmwvBFgkCWAgAG4YsHWAwAGgQsCRgfYFgQVJgcMFhIVJAAMEFgvQKxIAEFg4VNcwRcCmnQBw4A=="))
}

var iconGps = {
  width : 60, height : 60, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQCHy8pBZICJpe+6QURAQOPnmkFiVJ3//CiUl589+wIElMiC5dN2///oIDymSogsKkYsB+/aBAdJk4sLtu+///+gICzgsMufPnn379pBANc/JZLyYsB/YtBWwMm/YaCa4UcFhHz7990mXnhHDyVIMIQXDzdvFgPvFoNJ336VQnHglwDonzFgXPvv3RgI7EDIYsIcYP/3xQEuAsBuPCFhC2B75QExLTFFgy2GUINwoMciHHhIsHWwoXBWQtSFg62EB4MciJZC4a2DWYa2FBYLiHcAQsFWwYsEhgsBhi2CFgy2B+xZIWwWTtosFWwP9PoVwoccmHHjkxWwMjFgy2B7QnByIsFWwQsGWwshLILjBFgK2BkIsGWwtEFguSqmRFgy2Fw8MmKGCWwNJg4sGWwsSFgtkyUWFgy2GLIkeUAIsHWwJxCWwuW/ioBrYsG3/6CQS2BFgc8/NkyDjHE4i2Dk3O7fyBINvFgntYwshQwNxsmc+fny0kx4sDKwYCDWwVypM79/JSAW7FgIUGWwUcufEzxWBjgOGAQ8Stdv5Mk94HBChgCByQpBj1548EuAsNAYOv38kdYUlFhgQCPoNxFgNx4QsLpQDBye+/IKDygsLBgN5888uFBjkQ48JFhVIxIDBpwKFqQsKoKDB88ciJZC4a2LAIdCSJAXHkFBhlZ8QsChgsBhi2KRAWRkgNGWxVDhp0CuFDjkw48cmK2JpD3BAoIuBVI77MkJZBuAsCWxgCCogHGWxYCCw8MmKGC4cdFhtJiQsUyUcLIgsPWwwUOWwQsDChy2G0gsPWwKGBuPSFiC2DlIUQWwUcugURWwSwGA="))
}

var iconHrm = {
  width : 60, height : 60, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQCTwArTiVMmHDhgCRkhYUgQstmPHjlxARws/FikeFikLlmy5YsSz158+cFlEeFikAFgPAWaYsBQx8P5AEC2CzQ/jgUv/4cCkf+IsMgfwAon/Fh3/EYn/Fh0f/wyFn4sOQAgsP/4sCh/4j+An/ggACCFg9/VoYCBL4cf/4sIgf8h/AQYX/wEHFgX8Fg4gEKwIFCGoP/AoP/+IsEgP/8BWB/6DBEwIsBGQS5DcAwpFAQZfDQwwvDXAKACR4UDwCzIFgKtFv7pFFg59BkAGEL4LgLARAsOABwsOAQos/Fg0wFlgaBASIsskv/ACf6rnz588ASOlFitIFic9kmSpICFMQf6BYwCKrjaCCiAsXjgsCugsQv5+D9IsPw4sDuPSChuXVg3+Fhi5IVpICD37aHIhgsWAR4A="))
}

var iconCompass = {
  width : 60, height : 60, bpp : 3,
  transparent : 2,
  buffer : require("heatshrink").decompress(atob("pMkyQCFr//AAOkBYwUMC6FLCgoAB/osLl4VHAAIsK34OClmy5cs+YHC6RWL8gKEkofCLhF///8FIWz/YvCn4WB9JBI/1JsuWrN/21Zsp5DIgxBBEwOzFgRcC54FCIgyDB/mSrN9FglnAoMnRI2X//yFIXbQweyAoXPKALFF/ckEYJZCAQtkEoLOE36DDARSJBOIZuB5JWCFhFnySrBOIRuB9myVoYCGR4RxE//2WAKtCFg9ty1J//0boZWLF4jjCOoKwBEwYvGkIFCn6eBTYIpL5+QmQsDTwKbBFghQBAodmpMJkrjD6QsM2MkigyE/sl//kz/5EwNbbQeWpmSpCXBy3/sv//Vf/wsJiVJgkMAoM8FgP/0osBKYfZFgeJYAMCpJZCsm/FgPyVRFkyVBgaMF/+v/5QBVotJaoMkyBFBGoeffIIsICgVBhYLFCoP/JQQsEvmTC4OEGAILDFgfPEAs///fiFAGog+BFgTOBQYcky4JB/MkQ4IsCeoIsD//8Jovx48QqQIDl7yBv5ZC2wsDagP/9/5kLdBMQTsBQxKnB+4sBmSSGQxFnBIX+Q4KSFFhGzMoIKBXgwsC+rgGMQX9QYI4Fsm//VfFgu3/9/dJBlC0v/8mWvJ6CWIbdFy3Zsn/FgP+5d8EATdBXIrpDeQP/0m/9ggDLAO2QY44BSQPSpbOBagf3KxACCPQMk359BEAOXRgJWBFg9ZfAPSpN//YgCngpJX4fpkgnB2QgCFIIyCFg7pBHIIwBUgRWKAQO//4kCDQNJt4gBKxF9y1f//0dQX//mzQZf7lrIBFgSeB/MlFI4CDHoKbBSYRIB+QsLcAKbCC4TcB8hQDrNtAQlkEoKbBFgQzBcYRcC2a8CAQXfNwYXCOIP/WAImCv+2rNnAQI6BNwZxEWwTXDAoYLBNwgCCcYP/7KzCv6GDBQLdCC4pECRI3PBIJBGIgv/2wHCrYHCII6JFAASABAASDFAQyoBAAzFEARBcCAAZWJC5QUJA=="))
}

var iconAlarm = {
  width : 60, height : 60, bpp : 3,
  transparent : 1,
  buffer : require("heatshrink").decompress(atob("kmSpICdmUSC6eTgIRPzAsIpgXLiAsIoQsKzMhFg2TkgsLmAjCFgkQOhlkwgIF5MJOJnABAtMgieQyRrLAQ1MAgdIbqAHFcZ3JAgX//wHBO4yGHAgWf///+VJQxhBFC4PkIhmZA43//LgLQYgCDn/+RJUmBRFv8mQFhGTAgNp02aAQekz/pgKwPAQe/OJJuBFIgCDyf5gghILwvbtoFCk/yoTdJEwWbvv27QFByV/4kETZm3//t2gICTxIsLp/kFhlN34sF//IZBIsJpP8iAsGsgsE2yGBFgef5MJFhlt2wsSpIsVAQoNBggsNknbAogsLyQpCsPAFgOkLKEkgAlEFhgCCoPABonkFigCBFiiGPFitAgAsvyFBFj0kEAQCCFgIFDFhEAACAXDo8cuPHARhLFFipRBAB4sEzu27YKChoFBtgGCm3btu0ghxEBAJQC4wFB2xWCj4FB7UAQwgsB4AkBgYOBGQ1twAsGPoYOCw4sCGQQjBFguwEoQOEGQlggAsF7AVCBwkAgIyC0AGBFgmYPooyDzYdB6AFBFglGBwUYsOGjAGCoIFBsKzHcFgsVAVQA="))
}

Graphics.prototype.setFontAntonioMedium = function(scale) {
  // Actual height 18 (17 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAf4Mf/sYAMAAAAAAfgAfAAAAAfgAeAAAAAAiAAj8H/4fyEAv8f/gfiAAgAAAAD54H98eOPHn8Hz8AhwAAAP8Af+AYGAYCAf+AP8MAB8AHwA+AD4AfAAcf4A/8AwMAwMA/8Af4AAAAAwGD8f/8f8MY/cfz4PD8AHMAAAfAAeAAAAAAAAP/+f//YADAAAQABYADf//P/+AAAAAANAAPAAfwAfgAPAANAAAAAAEAAEAA/AA/AAEAAEAAAAAAZAAfAAYAAAAIAAIAAIAAIAAAAAAAAAMAAMAAAAAAAAEAB8Af4H+AfwAcAAAAAP/4f/8YAMf/8f/8H/wAAAAAAEAAMAAf/8f/8f/8AAAAAAAAAHgcfh8cH8YPMf8MPwEAAAAAAOB4eB8YYMY4Mf/8Pn4AAAAAgAHwA/wPwwf/8f/8AAwAAgAAAf54f58ZwMZwMY/8Qf4AAAAAAP/4f/8YYMYYMff8HP4AAAQAAYAAYD8Y/8f/AfgAcAAAAAAAAPv4f/8YYMY8Mf/8Pn4AAAAAAP94f98YGMcMMf/8H/wAAAAAABgwBgwAAAAAABgABg/Bg8AAAAEAAOAAbAA7gAxgBwwASAAbAAbAAbAAbAASAAAAAxwA5gAbAAPAAOAAAAPAAfHcYPcf8Af4AHgAAAAAAAB/gH/wOA4Y/MZ/sbAsbBkb/MZ/sOBsH/AAAAAAMAP8f/4fwwf4wH/8AH8AAMAAAf/8f/8YYMYYMf/8P/4ADgAAAP/4f/8YAMYAMfj8Pj4AAAAAAf/8f/8YAMYAMf/8P/4B/AAAAf/8f/8YMMYMMYIMAAAAAAf/8f/8YYAYYAYYAAAAAAAP/4f/8YAMYIMfP8Pv8AAAAAAf/8f/8AMAAMAf/8f/8f/8AAAAAAf/8f/8AAAAAAAD4AB8AAMf/8f/4f/gAAAAAAf/8f/8A+AD/gfj4eA8QAEAAAf/8f/8AAMAAMAAMAAAf/8f/8f8AB/wAB8AP8P/Af/8f/8AAAAAAf/8f/8HwAA+AAPwf/8f/8AAAAAAP/4f/8YAMYAMf/8P/4AAAAAAf/8f/8YGAYGAf8AP8ABAAAAAf/w//4wAYwAc//+f/yAAAAAAf/8f/8YMAYMAf/8f/8DA8CAAPj4fz8Y4MeeMfP8HD4YAAYAAf/8f/8YAAQAAAAAf/4f/8AAMAAMf/8f/4AAAYAAf4AP/4AP8AP8f/4fwAQAAYAAf8AP/8AD8D/8f8Af8AD/8AD8f/8f8AAAAQAEeB8P/4B/AP/4fA8QAEYAAfAAP4AB/8H/8fwAcAAAAMYD8Y/8f/MfwMcAMAAAf/+f//YADYADAAAAAAfAAf8AB/wAH8AAMQACYADf//f//AAAAA"), 32, atob("BAUHCAcTCAQFBQgGBAYFBggICAgICAgICAgEBQYGBggNCAgICAcHCAkECAgGCwkICAgIBwYICAwHBwYGBgY="), 18+(scale<<8)+(1<<16));
}

Graphics.prototype.setFontAntonioLarge = function(scale) {
  // Actual height 34 (34 - 1)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAADwAAAAAeAAAAADwAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAD+AAAAH/wAAAP/+AAAf/+AAA//8AAB//4AAD//wAAD//gAAAf/AAAAD+AAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAB////gA/////AP////8D/////wfAAAA+DwAAADweAAAAeDwAAADwf////+D/////wP////8Af///+AAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAOAAAAADwAAAAAeAAAAAHgAAAAB/////wf////+D/////wf////+D/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAPwH/4AP+B//AH/wf/4D/+D4AB/9weAAf4ODwAP8BweAP/AOD///gBwP//wAOA//4ABwB/4AAOAAAAAAAAAAAAAAAAAAAAB8AA/gA/gAH/AP8AA/8D/gAH/wfAHAA+DwA4ADweAHgAeDwB8ADwf7/+H+D/////gP/9//8A//H/+AA/AH/AAAAAAAAAAAAAAAAAABwAAAAD+AAAAD/wAAAH/+AAAH/5wAAH/wOAAP/gBwAP/gAOAD/////wf////+D/////wf////+AAAABwAAAAAOAAAAABwAAAAAAAAAAAAAAAAAAeAD//4D/Af//Af8D//4D/wf//Af+DwPAADweB4AAeDwPAADweB///+DwP///weA///8DwD//+AAAA/8AAAAAAAAAAAAAAAAAAAAAA////AA/////AP////8D/////wfgPAB+DwB4ADweAOAAeDwBwADwf+PAA+D/x///wP+H//8A/wf//AAAA//gAAAAAAAAAAAAADgAAAAAeAAAAADwAAAAAeAAAD+DwAAP/weAA//+DwA///weB///8Dx//8AAf//wAAD//gAAAf/AAAAD/AAAAAfAAAAAAAAAAAAAAAAAAAAAAAAAD/wf/wB//v//AP////8D/////weAPwAeDwA8ADwcAHAAeDwB8ADwf////+D/////wP/9//8A//H//AA/AD/AAAAAAAAAAAAAAAAAAAAAD//gfAA///D/AP//8f8D///j/weAA8A+DwADgDweAAcAeDwAHgDwf////+B/////gP////8Af///+AAP//4AAAAAAAAAAAAAAAAAAAAAAD4AfAAAfAD4AAD4AfAAAfAD4AAD4AfAAAAAAAAAAAAAA=="), 46, atob("Cg4QEBAQEBAQEBAQCQ=="), 39+(scale<<8)+(1<<16));
}

/*
 * Draw watch face
 */
var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw(true);
  }, 60000 - (Date.now() % 60000));
}


function draw(queue){
  g.reset();
  g.clearRect(0, 24, g.getWidth(), g.getHeight());

  // Draw background image
  g.drawImage(img, 0, 24);

  // Write time
  var currentDate = new Date();
  var timeStr = locale.time(currentDate,1);
  g.setFontAlign(0,0,0);
  g.setFontAntonioLarge();
  g.drawString(timeStr, 57, 57);

  // Write date
  g.setFontAlign(1,-1, 0);
  g.setFontAntonioMedium();

  var dayName = locale.dow(currentDate, true).toUpperCase();
  var day = currentDate.getDate();
  g.drawString(day, 133, 37);
  g.drawString(dayName, 133, 57);

  // Alarm
  g.setFontAlign(-1,-1,0);
  g.drawString("ALRM:", 20, 104);
  var alrmText = alarm >= 0 ? "T-"+alarm : "OFF";
  g.drawString(alrmText, 60, 104);

  // Draw battery
  var bat = E.getBattery();
  var charging = Bangle.isCharging() ? "*" : "";
  g.drawString("BAT:", 20, 124);
  g.drawString(charging + bat+ "%", 60, 124);

  // Draw steps
  var steps = getSteps();
  g.drawString("STEP:", 20, 144);
  g.drawString(steps, 60, 144);

  // Draw symbol
  var iconImg =
    alarm >= 0 ? iconAlarm :
    Bangle.isGPSOn() ? iconGps :
    Bangle.isHRMOn() ? iconHrm :
    Bangle.isCompassOn() ? iconCompass :
    iconPlanet;

  g.drawImage(iconImg, 110, 95);

  // Queue draw in one minute
  if(queue){
    queueDraw();
  }
}

/*
 * Step counter via widget
 */
function getSteps() {
  if (stepsWidget() !== undefined)
    return stepsWidget().getSteps();
  return "???";
}

function stepsWidget() {
  if (WIDGETS.activepedom !== undefined) {
    return WIDGETS.activepedom;
  } else if (WIDGETS.wpedom !== undefined) {
    return WIDGETS.wpedom;
  }
  return undefined;
}

/*
 * Handle alarm
 */
var alarmTimeout;
function queueAlarm() {
  if (alarmTimeout) clearTimeout(alarmTimeout);
  alarmTimeout = setTimeout(function() {
    alarmTimeout = undefined;
    handleAlarm();
  }, 60000 - (Date.now() % 60000));
}

function handleAlarm(){

    // Check each minute
    if(alarm > 0){
      alarm--;
      queueAlarm();
    }

    // After n minutes, inform the user
    if(alarm == 0){
      alarm = -1;

      var t = 300;
      Bangle.buzz(t, 1)
      .then(() => new Promise(resolve => setTimeout(resolve, t)))
      .then(() => Bangle.buzz(t, 1))
      .then(() => new Promise(resolve => setTimeout(resolve, t)))
      .then(() => Bangle.buzz(t, 1))
      .then(() => new Promise(resolve => setTimeout(resolve, t)))
      .then(() => Bangle.buzz(t, 1));
    }

    // Update UI
    draw(false);
}


/*
 * Swipe to set an alarm
 */
Bangle.on('swipe',function(dir) {
  // Increase alarm
  if(dir == -1){
    alarm = alarm < 0 ? 0 : alarm;
    alarm += 5;
    queueAlarm();
  }

  // Decrease alarm
  if(dir == +1){
    alarm -= 5;
    alarm = alarm <= 0 ? -1 : alarm;
  }

  // Update UI
  draw(false);
});


/*
 * Stop updates when LCD is off, restart when on
 */
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(true); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load widgets - needed by draw
Bangle.loadWidgets();

// Clear the screen once, at startup and draw clock
g.setTheme({bg:"#000",fg:"#fff",dark:true}).clear();
draw(true);

// After drawing the watch face, we can draw the widgets
Bangle.drawWidgets();