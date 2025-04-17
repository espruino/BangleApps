
var counter = 0;
var over = 0;
var ballTimes = [];
var overTimes = [];

 
function formatDuration(timeDate) { 
  return (timeDate.getHours()-1) + ":" + timeDate.getMinutes().toString().padStart(2, "0") + ":" + timeDate.getSeconds().toString().padStart(2, "0") + "";
}

function formatTimeOfDay(timeSig) { return timeSig.getHours() + ":" + timeSig.getMinutes().toString().padStart(2, "0");}


function countDown(dir) {
  counter += dir;
  if(counter<0) counter=0;

  var timeSig = new Date();
  ballTimes.push(timeSig.getTime());
  
  if(dir>0) console.log(formatTimeOfDay(timeSig) + " Ball " + over + "." +  counter);



  // Over

  if (counter>=6) {
    overTimes.push(timeSig.getTime());
    var firstOverTime = overTimes[0];
    var matchDuration = new Date(timeSig.getTime() - firstOverTime);
    
    var matchMinutesString = "M " + formatDuration(matchDuration);
    
    var firstBallTime = ballTimes[0];
    var overDuration = new Date(timeSig.getTime() - firstBallTime);
    
    var overMinutesString = over + " " + formatDuration(overDuration) + "";
    
    
    console.log(matchMinutesString + "\n" + overMinutesString);

    //console.log(overTimes);

    // display the 'over' message

    E.showMessage(matchMinutesString + "\n" + overMinutesString, "END OF OVER");

    // Now buzz

    Bangle.buzz();

Bangle.setUI({

  mode : "custom",

  btn : ()=>{

    // remove old button press handler

    Bangle.setUI();
    startOver();

  }

});
    return;

  }

  g.clear(1); // clear screen and reset graphics state

  g.setFontAlign(0,0); // center font

  g.setFont("Vector",48); // vector font, 80px

  // draw the current counter value

  g.drawString(formatTimeOfDay(timeSig), g.getWidth()/1.89, g.getHeight()/3.5);
  
  g.setFont("Vector",80); // vector font, 80px

  
  g.drawString(over + "." + counter, g.getWidth()/1.89, g.getHeight()/1.4);

  // optional - this keeps the watch LCD lit up

  Bangle.setLCDPower(1);

}

function startOver() {
  
  over += 1;
  console.log("Over " + over);

  counter = 0;
  ballTimes = [];

  // allow interaction, drag up/down and press button

  Bangle.setUI({

    mode : "updown",

  }, dir => {

    if (!dir) { // if tapped or button pressed, start/stop
      countDown(1);

    } else { // otherwise if dir nonzero, count time up/down

      countDown(-dir); // countDown decrements


    }

  });
  countDown(0);

}
  var timeSig = new Date();
  overTimes.push(timeSig.getTime());

	startOver();
