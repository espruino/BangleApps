var wickets = 0
var counter = 0;
var over = 0;
var ballTimes = [];
var overTimes = [];
var gameState = "Ready...";
var countdownDebounce = false;

function addLog(timeSig, over, ball, matchEvent, metaData) {
  // The fields we want to put in out CSV file
  var csv = [
    formatTimeOfDay(timeSig),
    over, ball, 
    matchEvent, metaData
  ];
  // Write data here
  file.write(csv.join(",")+"\n");
  console.log(csv);
}
 
function formatDuration(timeDate) { 
  return (timeDate.getHours()-1) + ":" + timeDate.getMinutes().toString().padStart(2, "0") + ":" + timeDate.getSeconds().toString().padStart(2, "0") + "";
}

function formatTimeOfDay(timeSig) { return timeSig.getHours() + ":" + timeSig.getMinutes().toString().padStart(2, "0");}


function countDown(dir) {
  if(countdownDebounce!=true) {
  countdownDebounce = true;
  counter += dir;
  if(counter<0) counter=0;

  var timeSig = new Date();
  var lastBallTime = timeSig.getTime();
  if(ballTimes.length>0) {
    lastBallTime = ballTimes[ballTimes.length - 1];
    //console.log("Last ball time");
  } else if(overTimes.length>0) {
    lastBallTime = overTimes[overTimes.length - 1];
    //console.log("Last over time");
  }
  
  var deadDuration = new Date(timeSig.getTime() - lastBallTime);
  //console.log(deadDuration);
  if(dir!=0) {
    if(counter>0) ballTimes.push(timeSig.getTime());
    Bangle.setLCDPower(1);
  if(dir>0) {
    addLog(timeSig, over, counter, "Ball", formatDuration(deadDuration));
  } else {
    addLog(timeSig, over, counter, "Correction", formatDuration(deadDuration));
  }
    if(counter==4) {
      Bangle.buzz().then(()=>{
        return new Promise(resolve=>setTimeout(resolve,500)); // wait 500ms
      }).then(()=>{
        return Bangle.buzz(500);
      })
    } else if(counter==5) {
      Bangle.buzz(800);
    } else {
      Bangle.buzz()
    }
  
  // Over
  if (counter>=6) {
    //Bangle.on('twist', function() { });
    overTimes.push(timeSig.getTime());
    var firstOverTime = overTimes[0];
    var matchDuration = new Date(timeSig.getTime() - firstOverTime);
    
    var matchMinutesString = formatDuration(matchDuration);
    
    var firstBallTime = ballTimes[0];
    var overDuration = new Date(timeSig.getTime() - firstBallTime);
    
    var overMinutesString = formatDuration(overDuration) + "";
    
    addLog(timeSig, over, counter, "Over Duration", overMinutesString);
    addLog(timeSig, over, counter, "Innings Duration", matchMinutesString);

    //console.log(overTimes);

    //E.showMessage(overMinutesString + "\n" + matchMinutesString, "END OF OVER");

    g.clear(1); // clear screen and reset graphics state
    g.setFontAlign(0,0); // center font
    g.setFont("Vector",48); 
    g.drawString(formatTimeOfDay(timeSig), g.getWidth()/1.89, g.getHeight()/3.5);
    g.setFont("Vector",24);
    g.drawString(over + " " + overMinutesString + "\nI " + matchMinutesString, g.getWidth()/1.89, g.getHeight()/1.4);

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
    countdownDebounce = false;
    return;
  }
  }
  if(counter<6) {
  g.clear(1); // clear screen and reset graphics state
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",48); // vector font, 80px
  g.drawString(formatTimeOfDay(timeSig), g.getWidth()/1.89, 50);
  g.setFont("Vector",80); // vector font, 80px
  g.drawString(over + "." + counter, g.getWidth()/1.89, 120);
  g.setFont("Vector",18);
  g.drawString("..." + formatDuration(deadDuration), g.getWidth()/1.89, 166);
  }
  countdownDebounce = false;
  }
}

function startOver() {
  var timeSig = new Date();
  if(over==0) overTimes.push(timeSig.getTime());
  over += 1;
  counter = 0;
  ballTimes = [];
  addLog(timeSig, over, counter, "New Over", "");

  // allow interaction, drag up/down and press button

  Bangle.setUI({
    mode : "updown",
  }, dir => {
    if (!dir) { // if tapped or button pressed, start/stop
      countDown(1);
    } else { // otherwise if dir nonzero, up/down
      countDown(-dir);
    }
  });
  Bangle.on('twist', function() { 
    //console.log("twist");
    countDown(0);
  });
  countDown(0);

}

function resumeGame() {
  if(over==0) {
    startOver();
  } else {
    E.showMenu();
  }
}
// Create the file in append mode
var file = require("Storage").open("matchlog.csv","a");

var timeSig = new Date();
addLog(timeSig, "-", "-", "App Started", timeSig);

var menuItems = {
  "":{title:"Umpire"},
  "Play" : ()=>resumeGame()
};

E.showMenu(menuItems);
