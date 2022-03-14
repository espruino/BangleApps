var mins = 7;
var counter;
var counterInterval;
var timers = [9, 7, 5, 3, 1];

function showMainMenu() {
  const menu = {
    '': { 'title': 'Timers' },
  };
  timers.forEach((timer,idx)=>{
    menu[timer] = function() {
      startTimer(timer);
    };
  });
  return E.showMenu(menu);
}
 
function outOfTime() {
  if (counterInterval) return;
  E.showMessage("Out of Time", "My Timer");
  Bangle.buzz();
  // again, 3 secs later
  setTimeout(outOfTime, 3000);
}

function countDown() {
  counter--;
  // Out of time
  if (counter<=0) {
    clearInterval(counterInterval);
    counterInterval = undefined;
    setWatch(()=>{load();}, BTN1); // Bangle1: BTN2
    outOfTime();
    return;
  }

  function sec2time(counter) {
    let m = Math.floor(counter / 60);
    let s = counter - m * 60;
    if (s < 10)
      return `${m}:0${s}`;
    else 
      return `${m}:${s}`;
  }
  
  g.clear(true);
  g.drawImage(require("Storage").read("timer.img"),70,20);
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",60); // vector font, 80px  
  // draw the current counter value
  g.drawString(sec2time(counter),90,120);
  // optional - this keeps the watch LCD lit up
  // g.flip();
}

function startTimer(timer) {
  counter = timer * 60;
  // console.log(counter);
  countDown();
  if (!counterInterval)
    counterInterval = setInterval(countDown, 1000);
}

showMainMenu();
//startTimer();
