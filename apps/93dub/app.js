{
  // get 12 hour status, code from barclock
  const is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];

  // define background
  const imgBg = require("heatshrink").decompress(atob("2GwgJC/AH4A/AH4A/AH4A/AH4A/ACcGAhAV/Cp3gvdug+Gj0AgeABYMBAQMIggVEg/w/9/h/Gn8As3ACpk559zznmseAs0B13nq/Rie+uodCIIUZw9hzFmv+AgcCmco7MRilow1ACpN8gFhwMilFRCoMowgVEIIVhIINhwFg4GiCpfw/dhx/mn4uBCoXRhWktAVFTIVhw9mj8YseDkUnqPEoeuugVEAAlgSgICBACAVC8AUQCQQVSAEsD/4ASeYgA/ACkHNiK5Cj4VR/AVBng+RCQVwCqMOAQPhIKOHgEB44VR8YVBx4VR+eAgOfCqPxwEDCqX5CoKvS/PAgc/YqQVU/gV/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/Cv4V/CsMfCqP4CoOfCqP54EBx4VR+OAgPPCqPzwEA44VR4cAgHhCqMHCoNwAQIAPjwCBngVRvgCBV6XwCoMHCqPAHyIA/AEigEf4IAOkAEDoAPJWAtA+PHv+Al6uPCofAGAgALoHz51/8AVT+IVS+4VPpMR73woH27n/8Eh8+ZmadIqsoyGICofAkMUktJFZAVBzgVBv34YgMhi8RkIVJnGQIIN8/H34FB8kJiIVIkVEyGQkF8/Pj4GBkhBKCoOexEQvHx8fBgMXzMxTJkICoXCVx8AggDGABsD/4AB/AVQAH4APA"));

  // define fonts
  // reg number first char 48 28 by 41
  const fontNum = atob("AAAAAAAAAAAAAA//8D//g//8P/+I//8//44//w//j4//A/+P4/8A/4/4AAAAD/4AAAAP/wAAAAf/gAAAA//AAAAB/+AAAAD/8AAAAH/4AAAAP/wAAAAf/gAAAA//AAAAB/+AAAAD/8AAAAH/wAAAAH/H/gH/H8f/gf/Hx//h//HH//n//Ef/+H//B//4H//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wB/4AP/4H/4A//4f/4D//5//4P//h//4//+B//4AAAAAAAAAAAAAAAAAf/+AAAB//4gAAD//jgAAD/+PgABj/4/gAHj/j/gAfgAP/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/AA/AAf8f88AAfx/8wAAfH/8AAAcf/8AAAR//4AAAH//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAA4AAAAAD4AAYAAP4AD8AA/4AH4AD/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/wAHgAH/H/GH/H8f/gf/Hx//h//HH//n//Ef/+H//B//4H//AAAAAAAAAAAAAAP//AAAAP//AAAAP//AAAAP/8AAAAP/2AAAAP/eAAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB+AAAAAD8AAAB/7x/4AH/7H/4Af/4f/4B//5//4H//h//4f/+B//4AAAAAAAAAAAAAD//wAAAD//wAAAj//gAADj/+AAAPj/5gAA/j/ngAD/gAfgAP/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/AA/AAf8AA8f8fwAAx/8fAAAH/8cAAAf/8QAAA//8AAAA//8AAAAAAAAAAAAAA//8D//g//8P/+I//8//44//0//j4//Y/+P4/94/4/4AH4AD/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/wAPwAH/AAPH/H8AAMf/HwAAB//HAAAH//EAAAH//AAAAH//AAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAGAAAAAAOAAAAAAeAAAAAA+AAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB8AAAAADx/4B/4HH/4H/4Mf/4f/4R//5//4H//h//4f/+B//4AAAAAAAAAAAAAD//wP/+D//w//4j//z//jj//T/+Pj/9j/4/j/3j/j/gAfgAP/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/AA/AAf8f+8f8fx/+x/8fH/+H/8cf/+f/8R//4f/8H//gf/8AAAAAAAAAAAAAA//8AAAA//8AAAI//8AAA4//0AAD4//YAAP4/94AA/4AH4AD/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/wAPwAH/H/vH/H8f/sf/Hx//h//HH//n//Ef/+H//B//4H//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  // tiny font for percentage first char 48 6 by 8 
  //var fontTiny = atob("AH6BgYF+ACFB/wEBAGGDhYlxAEKBkZFuAAx0hP8EAPqRkZGOAH6RkZFOAICHmKDAAG6RkZFuAHKJiYl+AAAAAAAAAAAAAAAA");
  // date font first char 48 12 by 15
  const fontDate = atob("AAAAAfv149wAeADwAeADwAeADvHr9+AAAAAAAAAAAAAAAAAAAAAAAAAPHn9/AAAAAAP0A9wweGDwweGDwweGDvAL8AAAAAAAAAAAgwOGDwweGDwweGDvHp98AAAAA/gB6AAwAGAAwAGAAwAGAPHj9/AAAAAfgF6BwweGDwweGDwweGDgHoB+AAAAAfv169wweGDwweGDwweGDgHoB+AAAAAAAAAAgAGAAwAGAAwAGAAvHh9/AAAAAfv169wweGDwweGDwweGDvHr9+AAAAAfgF6BwweGDwweGDwweGDvHr9+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

  // define days of the week images
  const imgMon = E.toArrayBuffer(atob("Ig8BgHwfD5AvB8HD8z8wMPzPzMQzM/M/DMz8z8c7f7f7z////3Oz+3+PzPzPw/M/M/D8z8z8PzPzPw/vB8/n/8H3/A=="));
  const imgTue = E.toArrayBuffer(atob("Ig8BwDv9wDAOfmgf/5+Z///n5n/5+fmf/n5+Z//fv9oH////Af37/b/+fn5n/5+fmf/n5+Z/+fn5n/5/g+gfn+D8AA=="));
  const imgWed = E.toArrayBuffer(atob("Ig8Bf7gHgM/NA9Az8z/z8PzP/Pw/M/8/D8z/z8c7QPf7z+A//3O3/3+MzP/PwzM/8/D8z/z8PzP/PxAtA9A4B4B4DA=="));
  const imgThu = E.toArrayBuffer(atob("Ig8BgHf7f6Ac/M/P/z8z8//PzPzz8/M/PPz8z8+/QLf7/+A///v3+3+8/PzPzz8/M/PPz8z88/PzPzz8/vB/P3/8HA=="));
  const imgFri = E.toArrayBuffer(atob("Ig8B/wDwP7+geg/P5/5+c/n/n5z+f+fnP5/5+c/oHoF7/AfAf/7/7/+/n/k/z+f+R/P5/5j8/n/nHz+/++PP7//8+A=="));
  const imgSat = E.toArrayBuffer(atob("Ig8B4DwDwDgOgXAJ/5+f/n/n5/+f+fn55/5+fnoHoF/fAfAf//+b/f3/5n5+f/mfn5/+Z+fn//n5+eAef358B7//nA=="));
  const imgSun = E.toArrayBuffer(atob("Ig8BwHf7D7Ac/MHD/z8wMP/PzMQ/8/M/D/z8z8QPf7f6A/////83+3+/zPzPz/M/M/P8z8z8//PzPwA/B8/oD8H3/A=="));



  // define icons
  const imgSep = E.toArrayBuffer(atob("BhsBAAAAAA///////////////AAAAAAA"));
  //var imgPercent = E.toArrayBuffer(atob("BwcBuq7ffbqugA=="));
  const img24hr = E.toArrayBuffer(atob("EwgBj7vO53na73tcDtu9uDev7vA93g=="));
  const imgPM = E.toArrayBuffer(atob("EwgB+HOfdnPu1X3ar4dV9+q+/bfftg=="));

  //vars
  let separator = true;
  let is24hr = !is12Hour;
  let leadingZero = true;

  //the following 2 sections are used from waveclk to schedule minutely updates
  // timeout used to update every minute
  let drawTimeout;

  // schedule a draw for the next minute
  let queueDraw = function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
  };

  let drawBackground = function() {
    g.setBgColor(0, 0, 0);
    g.setColor(1, 1, 1);
    g.clear();
    g.drawImage(imgBg, 0, 0);
    g.reset();
  };

  let draw = function() {
    drawBackground();
    let date = new Date();
    let h = date.getHours(),
      m = date.getMinutes();
    let d = date.getDate(),
      w = date.getDay();
    g.reset();
    g.setBgColor(0, 0, 0);
    g.setColor(1, 1, 1);

    //draw 24 hr indicator and 12 hr specific behavior
    if (is24hr){
      g.drawImage(img24hr,32, 65);
      if (leadingZero){
        h = ("0"+h).substr(-2);
        }
    } else if (h > 12) {
      g.drawImage(imgPM,40, 70);
      h = h - 12;
      if (leadingZero){
        h = ("0"+h).substr(-2);
      } else {
        h = " " + h;
      }
    } else if (h === 0) {
      // display 12:00 instead of 00:00 for 12 hr mode
      h = "12";
    }

    //draw separator
    if (separator) {
      g.drawImage(imgSep, 85, 98);
    }

    //draw day of week
    let imgW = null;
    if (w == 0) {imgW = imgSun;}
    if (w == 1) {imgW = imgMon;}
    if (w == 2) {imgW = imgTue;}
    if (w == 3) {imgW = imgWed;}
    if (w == 4) {imgW = imgThu;}
    if (w == 5) {imgW = imgFri;}
    if (w == 6) {imgW = imgSat;}
    g.drawImage(imgW, 85, 63);


    // draw nums
    // draw time
    g.setColor(0, 0, 0);
    g.setBgColor(1, 1, 1);
    g.setFontCustom(fontNum, 48, 28, 41);
    if (h < 10) {
      if (leadingZero) {
        h = ("0" + h).substr(-2);
      } else {
        h = " " + h;
      }
    }
    g.drawString(h, 25, 90, true);
    g.drawString(("0" + m).substr(-2), 92, 90, true);
    // draw date
    g.setFontCustom(fontDate, 48, 12, 15);
    g.drawString(("0" + d).substr(-2), 123, 63, true);

    // widget redraw
    Bangle.drawWidgets();
    queueDraw();
  };

  /**
   * This watch is mostly dark, it does not make sense to respect the
   * light theme as you end up with a white strip at the top for the
   * widgets and black watch. So set the colours to the dark theme.
   *
   */
  g.setTheme({
    bg: "#000",
    fg: "#fff",
    dark: true
  }).clear();
  draw();

  //the following section is also from waveclk
  let onLCDPower = on => {
    if (on) {
      draw(); // draw immediately, queue redraw
    } else { // stop draw timer
      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = undefined;
    }
  };
  Bangle.on('lcdPower', onLCDPower);

  Bangle.setUI({
    mode: "clock",
    remove: function() {
      if (drawTimeout) clearTimeout(drawTimeout);
      Bangle.removeListener('lcdPower', onLCDPower);
    }
  });
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
