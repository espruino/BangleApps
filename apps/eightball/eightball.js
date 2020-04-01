// Code from Graphical Editor
var outcomes, acc;

/**
 * Resets the screen to the default state
 */
function flush() {
  g.clear();
  g.setColor(1,1,1);
  g.setFont("6x8",2);g.setFontAlign(-1,-1);
  g.drawString('Magic 8 Ball',50,10,true);
  g.drawString('Says:',50,30,true);
}

/**
 * Harvests accelerometer data we are shaking an eightball afterall
 * Mod function to select an outcome from the outcomes list
 */
function checkBall() {
  acc = 0;
  setTimeout(function() {
    Bangle.on('accel',function(accelData) {
      acc = acc + accelData.diff * 10;

    });
    flush();
    g.setFont("6x8",4);g.setFontAlign(0,0);
    g.setColor(1,0,0);
    g.drawString(outcomes[((Math.floor(acc) % 3 + 1) - 1)],120,100,true);
   }, 2*1000.0);
}

/**
 * Main routine contains a list of the possible outcomes
 */
outcomes = ['Maybe', 'No', 'Yes'];
g.clear();
g.setFont("6x8",2);g.setFontAlign(-1,-1);
g.drawString('Magic 8 Ball',50,10,true);
setWatch(function() {
  flush();
  g.drawString('Says: Thinking',50,30,true);
  checkBall();
 }, BTN1, {"repeat":true,"edge":"rising","debounce":10});
