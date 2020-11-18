var timestarted = 'false';
var counter = 0;
var counterInterval;

var reminders = [
  'You have a bigggg peen!\n',
  'You are sexy!\n',
  'You are really good looking!\n',
  'You are smart!\n',
  'You are right!\n',
  'You are the man!'
];

///////////
//ON LOAD//
///////////
g.clear(reset).setFont('6x8');
g.setFont("Vector",15).setFontAlign(0,0);
g.drawString("Rob's", 130, 90);

g.setFont("Vector",40).setFontAlign(0,0);
g.drawString("big peen!", 130, 130);

/////////
//BTN 1//
/////////
setWatch(() => {
  setTimmer();
}, BTN1, {repeat:true});

function setTimmer() {
  if (timestarted==='false'){
    counter = counter+5;
    date = counter*60;
    g.clear(reset);
    g.setFont("Vector",40).setFontAlign(0,0);
    g.drawString('set time', 130, 90);
    g.drawString(counter, 130, 130);
  }else{
    g.clear(reset);
    g.setFont("Vector",25).setFontAlign(0,0);
    g.drawString('Times ticking!', 130, 90);
    Bangle.buzz();
  }

}

/////////
//BTN 2//
/////////
setWatch(() => {
  startTimmer();
}, BTN2, {repeat:true});

function startTimmer() {
  if (timestarted==='false'){
    timestarted='true';

    var timer = counter*60, minutes, seconds;
    setInterval(function () {
        g.clear(reset);
        g.setFont("Vector",25).setFontAlign(0,0);
        g.drawString('Time Started!', 130, 90);
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        g.drawString(minutes + ":" + seconds, 130, 130); 

        if (--timer < 0) {
          outOfTime();
        }
    }, 1000);
    //g.drawString(date, 130, 130);
    Bangle.buzz();
  }
  else{
    g.clear(reset);
    g.setFont("Vector",25).setFontAlign(0,0);
    g.drawString('Times ticking!', 130, 90);
    Bangle.buzz();
  }
}


function outOfTime() {
  var item = reminders[Math.floor(Math.random() * reminders.length)];
  E.showMessage(item);
  Bangle.buzz();
  Bangle.beep(200, 4000);
  clearInterval();
    //.then(() => new Promise(resolve => setTimeout(resolve,200)))
    //.then(() => Bangle.beep(200, 3000));
}

//counterInterval = setInterval(countDown, 1000);

/////////
//BTN 3//
/////////
setWatch(() => {
  updateScreen();
}, BTN3, {repeat:true});

function updateScreen() {
  counter = 0;
  timestarted='false';
  clearInterval();
  g.clear(reset);
  g.setFont("Vector",40).setFontAlign(0,0);
  g.drawString('Reset', 140, 100);
}

//LOAD APP
Bangle.loadWidgets();
Bangle.drawWidgets();