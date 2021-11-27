/*The following code was made by Brandon Abbott and used many portions from Espruino documentation, example watchfaces, and the waveclk app (Gordon Williams). It also sourced from Jon Barlow's 91 Dub v2.0 source code and resources. Time and date keeping functions, and AFAIK the battery display works too. I cut off the top of the original background with a black rectangle to make room for the widgets. It is not pixel perfect. I am using the MIT license for this work.
MIT License
Copyright (c) 2021 Brandon Abbott
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// define background
var imgBg = require("heatshrink").decompress(atob("yGogIqn4EwhgR/AAMN4Hw7k3hk8BQeAgEEgQGCh/h/H+n+MvwRKh1zjnnnPM48A69z1foxPfnXgCIMMmf84cw5n/gMZylsxGKmlDkARD8ARC/EAyMUlARBilCCIQ1Bhg1C4cAqIRILIP8LIV/CIVowtSmgRDPoP4PoU+gORieo8Uh686I4bmQCMYAig//AB3AIuYAUpGcxeAMxE8+lEgEB5GixIdIgmiwlHCwPI0H5CJXiw/ACIOmEZI1BwQRBGpskCIIFBp2eCJUi+MEVP4AJh//ABngCIM/CJv4CIN4GRs8AQImCABcOdIPDGpqzBgePCJvjCIMfCJvzwEDNZ3xwEHCJ35wEGCJ/Ag1/UJwRQ/gR/CP4R/CP4R/CP4R/CP4R/CP4R/CP4R/CP4R/CP4R/CP4R/CP4R/CP4Rhn4RN/HAg4RO/PAgcfCJvxwEDz4RN+eAgOPCJvDgEB4YRNg8AgHgAQIALjwCBvARNvgCBPp3wCIMPCJvAGRoA/AA8Bi+l4gROykYw4ROq4RBPxsBqgRQmkkGp8X0mERFUfcgeACJcgAgdABYsHDof/oHx49/wEvBQh9GCIfAFAgAHoHz51/8ARP+IRO+4RLpMR73woH27n/8Eh8+ZmaBEqsoyGICIfAkMUktJEYgRBzgRBv34UAMhi8RkIRFnGQGoN8/H34FB8kJiIREkVEyGQkF8/Pj4GBkg1GCIOexEQvHx8fBgMXzMxPpEICIXCfZkEAYwAJgbiC/ARMAH4ABA=="));

/*
I took the number bitmaps, added two columns to each digit (for spacing), and combined them for the Espruino Bitmap Font Generator. Here's the commands I used for processing the original 26 by 41 px font:
mogrify -gravity east -extent 28x41 *.png
montage num_[0-9].png -geometry +0+0 numcat.png
I then put numcat.png into the generator. 
*/

// define fonts
// reg number first char 48 28 by 41
var fontNum = atob("AAAAAAAAAAAAAA//8D//g//8P/+I//8//44//w//j4//A/+P4/8A/4/4AAAAD/4AAAAP/wAAAAf/gAAAA//AAAAB/+AAAAD/8AAAAH/4AAAAP/wAAAAf/gAAAA//AAAAB/+AAAAD/8AAAAH/wAAAAH/H/gH/H8f/gf/Hx//h//HH//n//Ef/+H//B//4H//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wB/4AP/4H/4A//4f/4D//5//4P//h//4//+B//4AAAAAAAAAAAAAAAAAf/+AAAB//4gAAD//jgAAD/+PgABj/4/gAHj/j/gAfgAP/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/AA/AAf8f88AAfx/8wAAfH/8AAAcf/8AAAR//4AAAH//gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAA4AAAAAD4AAYAAP4AD8AA/4AH4AD/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/wAHgAH/H/GH/H8f/gf/Hx//h//HH//n//Ef/+H//B//4H//AAAAAAAAAAAAAAP//AAAAP//AAAAP//AAAAP/8AAAAP/2AAAAP/eAAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB+AAAAAD8AAAB/7x/4AH/7H/4Af/4f/4B//5//4H//h//4f/+B//4AAAAAAAAAAAAAD//wAAAD//wAAAj//gAADj/+AAAPj/5gAA/j/ngAD/gAfgAP/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/AA/AAf8AA8f8fwAAx/8fAAAH/8cAAAf/8QAAA//8AAAA//8AAAAAAAAAAAAAA//8D//g//8P/+I//8//44//0//j4//Y/+P4/94/4/4AH4AD/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/wAPwAH/AAPH/H8AAMf/HwAAB//HAAAH//EAAAH//AAAAH//AAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAGAAAAAAOAAAAAAeAAAAAA+AAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB+AAAAAD8AAAAAH4AAAAAPwAAAAAfgAAAAA/AAAAAB8AAAAADx/4B/4HH/4H/4Mf/4f/4R//5//4H//h//4f/+B//4AAAAAAAAAAAAAD//wP/+D//w//4j//z//jj//T/+Pj/9j/4/j/3j/j/gAfgAP/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/AA/AAf8f+8f8fx/+x/8fH/+H/8cf/+f/8R//4f/8H//gf/8AAAAAAAAAAAAAA//8AAAA//8AAAI//8AAA4//0AAD4//YAAP4/94AA/4AH4AD/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/4APwAP/wAfgAf/gA/AA//AB+AB/+AD8AD/8AH4AH/wAPwAH/H/vH/H8f/sf/Hx//h//HH//n//Ef/+H//B//4H//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
// tiny font for percentage first char 48 6 by 8 
var fontTiny = atob("AH6BgYF+ACFB/wEBAGGDhYlxAEKBkZFuAAx0hP8EAPqRkZGOAH6RkZFOAICHmKDAAG6RkZFuAHKJiYl+AAAAAAAAAAAAAAAA");
// date font first char 48 12 by 15
var fontDate = atob("AAAAAfv149wAeADwAeADwAeADvHr9+AAAAAAAAAAAAAAAAAAAAAAAAAPHn9/AAAAAAP0A9wweGDwweGDwweGDvAL8AAAAAAAAAAAgwOGDwweGDwweGDvHp98AAAAA/gB6AAwAGAAwAGAAwAGAPHj9/AAAAAfgF6BwweGDwweGDwweGDgHoB+AAAAAfv169wweGDwweGDwweGDgHoB+AAAAAAAAAAgAGAAwAGAAwAGAAvHh9/AAAAAfv169wweGDwweGDwweGDvHr9+AAAAAfgF6BwweGDwweGDwweGDvHr9+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

// define days of the week images
var imgMon = E.toArrayBuffer(atob("Ig8BgHwfD5AvB8HD8z8wMPzPzMQzM/M/DMz8z8c7f7f7z////3Oz+3+PzPzPw/M/M/D8z8z8PzPzPw/vB8/n/8H3/A=="));
var imgTue = E.toArrayBuffer(atob("Ig8BwDv9wDAOfmgf/5+Z///n5n/5+fmf/n5+Z//fv9oH////Af37/b/+fn5n/5+fmf/n5+Z/+fn5n/5/g+gfn+D8AA=="));
var imgWed = E.toArrayBuffer(atob("Ig8Bf7gHgM/NA9Az8z/z8PzP/Pw/M/8/D8z/z8c7QPf7z+A//3O3/3+MzP/PwzM/8/D8z/z8PzP/PxAtA9A4B4B4DA=="));
var imgThu = E.toArrayBuffer(atob("Ig8BgHf7f6Ac/M/P/z8z8//PzPzz8/M/PPz8z8+/QLf7/+A///v3+3+8/PzPzz8/M/PPz8z88/PzPzz8/vB/P3/8HA=="));
var imgFri = E.toArrayBuffer(atob("Ig8B/wDwP7+geg/P5/5+c/n/n5z+f+fnP5/5+c/oHoF7/AfAf/7/7/+/n/k/z+f+R/P5/5j8/n/nHz+/++PP7//8+A=="));
var imgSat = E.toArrayBuffer(atob("Ig8B4DwDwDgOgXAJ/5+f/n/n5/+f+fn55/5+fnoHoF/fAfAf//+b/f3/5n5+f/mfn5/+Z+fn//n5+eAef358B7//nA=="));
var imgSun = E.toArrayBuffer(atob("Ig8BwHf7D7Ac/MHD/z8wMP/PzMQ/8/M/D/z8z8QPf7f6A/////83+3+/zPzPz/M/M/P8z8z8//PzPwA/B8/oD8H3/A=="));



// define icons
var imgSep = E.toArrayBuffer(atob("BhsBAAAAAA///////////////AAAAAAA"));
var imgBattery = E.toArrayBuffer(atob("EAkBAAF//X/8f/x//H/8f/x//QAB"));
var imgBattery_Charge = E.toArrayBuffer(atob("EAkBAAF//UEERwRf9EHEQQR//QAB"));
var imgPercent = E.toArrayBuffer(atob("BwcBuq7ffbqugA=="));
var img24hr = E.toArrayBuffer(atob("EwgBj7vO53na73tcDtu9uDev7vA93g=="));
var imgPM = E.toArrayBuffer(atob("EwgB+HOfdnPu1X3ar4dV9+q+/bfftg=="));

//vars
var separator = true;
var is24hr = true; //assumed true until can find API to check
var leadingZero = true;

//the following 2 sections are used from waveclk to schedule minutely updates
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

// set background
g.setBgColor(0,0,0);
g.setColor(1,1,1);
g.clear();
g.drawImage(imgBg,g.getWidth()/2 - 144/2 ,0);
// this covers the part of the background with branding, makes room for widgets
g.setColor(0,0,0);
g.fillRect(0,0,g.getWidth(),30);

function draw(){
var date = new Date();
var h = date.getHours(), m = date.getMinutes();
var d = date.getDate(), w = date.getDay();
g.reset();
g.setBgColor(0,0,0);
g.setColor(1,1,1);
// draw battery indicator
var batPercent = E.getBattery();
if (Bangle.isCharging()) {selBattery = imgBattery_Charge;}
else {selBattery=imgBattery;}
g.drawImage(selBattery,127,42);
if (batPercent != null) {
g.drawImage(imgPercent, 118,43);

}

//draw 24 hr indicator and 12 hr specific behavior
if (is24hr){
g.drawImage(img24hr,32, 70);
if (leadingZero){
                   h = ("0"+h).substr(-2);}}
else if (h > 12) {g.drawImage(imgPM,40, 70);
                 h = h - 12;
                  if (leadingZero){
                   h = ("0"+h).substr(-2);}
                    else
                   {h = " " + h;}
                 }

//draw separator
if (separator){
g.drawImage(imgSep, 85,96);}

//draw day of week
var imgW = null;
if (w == 0) {imgW = imgSun;}
if (w == 1) {imgW = imgMon;}
if (w == 2) {imgW = imgTue;}
if (w == 3) {imgW = imgWed;}
if (w == 4) {imgW = imgThr;}
if (w == 5) {imgW = imgFri;}
if (w == 6) {imgW = imgSat;}
g.drawImage(imgW, 85, 66);


// draw nums
// draw time
g.setColor(0,0,0);
g.setBgColor(1,1,1);
g.setFontCustom(fontNum, 48, 28, 41);
if (h<10) {
  if (leadingZero) {
    h = ("0"+h).substr(-2);
    }
  else {h = " " + h;}
}
g.drawString(h, 25, 88, true);
g.drawString(("0"+m).substr(-2), 92, 88, true);
// draw date
g.setFontCustom(fontDate, 48, 12, 15);
g.drawString(("0"+d).substr(-2), 123,66, true);
// draw battery
g.setFontCustom(fontTiny, 48, 6, 8);
if (batPercent < 10) {batPercent = " " + batPercent;} //makes sure zero is next to percent sign
if (batPercent < 100) {g.drawString(batPercent, 105, 42, true);}
  else {g.drawString(batPercent, 99, 42, true);}
queueDraw();
}


draw();

//the following section is also from waveclk
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
