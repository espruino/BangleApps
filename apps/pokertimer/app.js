const BLIND_INTERVAL = 600; // 10 minutes in seconds
const BLINDSUP_ALERT_DURATION = 10000; // 10 seconds in ms

// Convert seconds to mm:ss
const secondsToMinutes = (s) => {
  const mm = Math.floor(s/60);
  const ss = s - mm * 60;
  return `${mm}:${String(ss).padStart(2,'0')}`;
};

// Format screen
const fmtDark = () => {
  g.clear();
  g.setFontAlign(0,0);
  g.setBgColor(0,0.5,0);
  g.setColor(1,1,1);
};
const fmtLight = () => {
  g.clear();
  g.setFontAlign(0,0);
  g.setBgColor(0.5,1,0.5);
  g.setColor(0,0,0);
};

// Start/stop/pause/resume timer
const startTimer = () => {
  timer_running = true; tick();
  timer = setInterval(tick, 1000);
};
const stopTimer = () => {
  clearInterval(timer);
  timer_running = false;
};
const pauseResume = () => {
  if (is_alerting) return;
  if (timer_running) {
    stopTimer();
    g.setFont('Vector',15);
    g.drawString('(PAUSED)',
      g.getWidth()/2, g.getHeight()*7/8);
  }
  else startTimer();
};

// Calculate blinds for a round
const getBlinds = (i) => {
  let small;
  if (i===0) small = 1;
  else if (i===1) small = 2;
  else if (i===2) small = 4;
  else small = 5*(Math.pow(2,(i-3)));
  return [small, small*2];
};

// Sound the alarm
const blindsUp = () => {
  is_alerting = true;
  // Display message
  const showMessage = () => {
    g.clear();
    g.setFont('Vector',34);
    g.drawString('Blinds Up!',
      g.getWidth()/2, g.getHeight()/3);
    g.setFont('Vector',40);
    g.drawString(`${blinds[0]}/${blinds[1]}`,
      g.getWidth()/2, g.getHeight()*2/3);
  };
  stopTimer();
  // Increase blinds
  b++;
  // TODO: Kill program between round 25 and 26
  blinds = getBlinds(b);
  console.log(`Blinds for round ${b} are ${blinds[0]} / ${blinds[1]}`);
  // Buzz and light up every second
  const buzzInterval = setInterval(() => {
    Bangle.buzz(500);
    Bangle.setLCDPower(1);
  }, 1000);
  // Invert colors every second
  fmtLight(); showMessage(); let dark = false;
  const flashInterval = setInterval(() => {
    if (dark) {
      fmtLight();
      dark = false;
    } else {
      fmtDark();
      dark = true;
    } showMessage();
  }, 500);
  // Restart timer
  setTimeout(() => {
    is_alerting = false;
    fmtDark(); tick();
    clearInterval(buzzInterval);
    clearInterval(flashInterval);
    time_left = BLIND_INTERVAL + 1;
    startTimer();
  }, BLINDSUP_ALERT_DURATION);
};

// Tick every second
const tick = () => {
  if (!timer_running) return;
  time_left--;
  // 20-second warning buzz
  if (time_left==20) {
    const buzzInterval = setInterval(Bangle.buzz, 500);
    setTimeout(() => {
      clearInterval(buzzInterval);
    }, 5000);
  }
  if (time_left<=0) blindsUp();
  else {
    g.clear();
    g.setFont('Vector',40);
    g.drawString(
      secondsToMinutes(time_left),
      g.getWidth()/2, g.getHeight()/3);
    g.drawString(
      `${blinds[0]}/${blinds[1]}`,
      g.getWidth()/2, g.getHeight()*2/3);
  }
  return;
};

// button listener
Bangle.setUI({
  mode: 'custom',
  btn: pauseResume,
});

// RUNTIME
fmtDark();
let time_left = BLIND_INTERVAL + 1;
let b = 0;
let blinds = getBlinds(b);
let timer_running = true;
let is_alerting = false;
let timer = setInterval(tick, 1000);
tick();
// Start paused
pauseResume();
