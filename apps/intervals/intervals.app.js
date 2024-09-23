var counter;
var counterInterval;

var settings;

var work=false; //true if training false if resting
var prep=true; //true if we are in prep phase (at the beginning of the session
var setNum;

var paused;

function endPart() {
  g.clear();
  if (prep){
    prep=false;
    work = true;
    counter = settings.workseg+settings.workmin*60;
    startCounter();
  }else if (work){
    work = false;
    counter = settings.restseg+settings.restmin*60;
    startCounter();
  }
  else{
    if (setNum>1)
    {
      setNum--;
      work = true;
      counter = settings.workseg+settings.workmin*60;
      startCounter();
    }
    else
    {
       //End session
      setWatch(showMenu, BTN2);
      E.showMessage("Press BTN2 for\ngoing back\nto the menu","Well done!");
    }
  }
}

function printCounter(counter){
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",80); // vector font, 80px  
  // draw the current counter value
  let minutes = Math.floor(counter/60);
  let segs = counter % 60;
  let textMinutes = minutes.toString().padStart(2, "0");
  let textSegs = segs.toString().padStart(2,"0");
  g.clearRect(0,80,239,160);
  g.setFont("Vector",30);
  if (prep)
    g.setColor(125,125,0);
  else if (work)
    g.setColor(255,0,0);
  else
    g.setColor(0,255,0);
  g.drawString(setNum,120,50);
  if (prep)
    g.drawString("PREPARATION",120,190);
  else if (work)
    g.drawString("WORK",120,190);
  else
    g.drawString("REST",120,190);
  g.setFont("Vector",10);
  g.drawString("Touch to pause",120,215);
  g.setFont("Vector",80); 
  g.drawString(textMinutes+":"+textSegs,120,120);
}

function signal_to_user(le){
  if (settings.buzz)
    Bangle.buzz(le);
  else
    Bangle.beep(le,4000);
}

function countDown() {
  counter--;
  if (counter<4 && counter>0)
    signal_to_user(200);
  if (counter==0)
    signal_to_user(600);

  if (counter<0) {
    clearInterval(counterInterval);
    counterInterval = undefined;
    endPart();
  }
  else
  {
    printCounter(counter);
  }
  g.flip();
}

function startCounter(){
  if (!counterInterval)
    counterInterval = setInterval(countDown, 1000);
}

function pause()
{
  if (!paused)
  {
    clearInterval(counterInterval);
    counterInterval = undefined;
    setWatch(resume,BTN4);
    setWatch(resume,BTN5);
    paused=true;
    g.clear();
    g.setFont("Vector",60);
    g.drawString("PAUSED",120,120);
    g.setFont("Vector",20);
    g.drawString("Touch to continue",120,180);
  }
}

function resume(){
  if (paused)
  {
    g.clear();
    counterInterval = setInterval(countDown, 1000);
    setWatch(pause,BTN4);
    setWatch(pause,BTN5);
    paused=false;
  }
}

function startSession() {
  E.showMenu();
  paused=false;
  setWatch(pause,BTN4);
  setWatch(pause,BTN5);
  require('Storage').write('intervals.settings.json',settings);
  setNum = settings.sets;
  counter = 5;//prep time
  prep=true;
  work=false;
  startCounter();
}

function showMenu()
{
  settings = require('Storage').readJSON('intervals.settings.json',1)||
      { sets:1,workseg:10,workmin:0,restseg:5,restmin:0,buzz:true};

  var mainmenu = {
  "" : { "title" : "-- Main Menu --" },
  "START" : function() { startSession(); },
  "Sets" : { value : settings.sets,min:0,max:20,step:1,onchange : v => { settings.sets=v; } },
  "Work minutes" : { value : settings.workmin,min:0,max:59,step:1,onchange : v => { settings.workmin=v; } },
  "Work seconds" : { value : settings.workseg,min:0,max:59,step:1,onchange : v => { settings.workseg=v; } },
  "Rest minutes" : { value : settings.restmin,min:0,max:59,step:1,onchange : v => { settings.restmin=v; } },
  "Rest seconds" : { value : settings.restseg,min:0,max:59,step:1,onchange : v => { settings.restseg=v; } },
  "Signal type" :  { value : settings.buzz,format : v => v?"Buzz":"Beep",onchange : v => { settings.buzz=v; }}
  };
  
  E.showMenu(mainmenu);
}

showMenu();






