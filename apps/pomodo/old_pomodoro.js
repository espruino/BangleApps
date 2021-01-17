const storage = require("Storage");

const DEFAULT_TIME = 1500; // 25m
const TIME_BREAK = 300;
const STATES = {
  INIT: 1,
  STARTED: 2,
  DONE: 3,
  BREAK: 4
};
var counterInterval;

class State {
  constructor (state) {
    this.state = state;
    this.next = null;
  }

  setNext (next) {
    this.next = next;
  }

  setButtons () {}

  clear () {
    clearWatch();
    g.clear();
    g.setFontAlign(0, 0);
  }

  draw () {
    g.clear();
  }

  init () { }

  go (nextState) {
    if (nextState) {
      this.next = nextState;
    }

    this.clear();
    this.init();
    this.setButtons();
    this.draw();
  }
}

class InitState extends State {
  constructor (time) {
    super(STATES.INIT);

    this.timeCounter = parseInt(storage.read(".pomodo") || DEFAULT_TIME, 10);
  }

  saveTime () {
    storage.write('.pomodo', '' + this.timeCounter);
  }

  setButtons () {
    setWatch(() => {
      if (this.timeCounter + 300 > 3599) {
        this.timeCounter = 3599;
      } else {
        this.timeCounter += 300;
      }

      this.draw();

    }, BTN1, { repeat: true });

    setWatch(() => {
      if (this.timeCounter - 300 > 0) {
        this.timeCounter -= 300;
        this.draw();
      }
    }, BTN3, { repeat: true });

    setWatch(() => {
      if (this.timeCounter - 60 > 0) {
        this.timeCounter -= 60;
        this.draw();
      }
    }, BTN4, { repeat: true });

    setWatch(() => {
      if (this.timeCounter + 60 > 3599) {
        this.timeCounter = 3599;
      } else {
        this.timeCounter += 60;
      }

      this.draw();

    }, BTN5, { repeat: true });

    setWatch(() => {
      this.saveTime();
      const startedState = new StartedState(this.timeCounter);

      this.setNext(startedState);
      this.next.go();
    }, BTN2, { repeat: true });
  }

  draw () {
    g.clear();
    g.setFontAlign(0, 0); // center font
    g.setFont("Vector", 50); // vector font, 80px
    drawCounter(this.timeCounter);
  }
}

class StartedState extends State {
  constructor (timeCounter) {
    super(STATES.STARTED);

    this.timeCounter = timeCounter;
  }

  draw () {
    drawCounter(this.timeCounter, 120, 120);
  }

  init () {
    function countDown () {
      this.timeCounter--;

      // Out of time
      if (this.timeCounter <= 0) {
        clearInterval(counterInterval);
        counterInterval = undefined;
        this.next.go();
        return;
      }

      this.draw();
    }

    const doneState = new DoneState();
    this.setNext(doneState);
    counterInterval = setInterval(countDown.bind(this), 1000);
  }
}

class BreakState extends State {
  constructor () {
    super(STATES.BREAK);
  }

  draw () {
    g.setFontAlign(0, 0);
  }

  init () {
    const startedState = new StartedState(TIME_BREAK);

    this.setNext(startedState);
    this.next.go();
  }
}
class DoneState extends State {
  constructor () {
    super(STATES.DONE);
  }

  setButtons () {
    setWatch(() => {
      const initState = new InitState();
      clearTimeout(this.timeout);
      initState.go();
    }, BTN1, { repeat: true });

    setWatch(() => {
      const breakState = new BreakState();
      clearTimeout(this.timeout);
      breakState.go();
    }, BTN3, { repeat: true });

    setWatch(() => {
    }, BTN2, { repeat: true });
  }

  draw () {
    g.clear();
    g.setFont("6x8", 2);
    g.setFontAlign(0, 0, 3);
    g.drawString("AGAIN", 230, 50);
    g.drawString("BREAK", 230, 190);
    g.setFont("Vector", 45);
    g.setFontAlign(-1, -1);

    g.drawString('You\nare\na\nhero!', 50, 40);
  }

  init () {

    function buzz () {
      Bangle.buzz();
      Bangle.beep(200, 4000)
        .then(() => new Promise(resolve => setTimeout(resolve, 50)))
        .then(() => Bangle.beep(200, 3000))
        .then(() => new Promise(resolve => setTimeout(resolve, 200)))
        .then(() => Bangle.beep(200, 3000))
        .then(() => new Promise(resolve => setTimeout(resolve, 300)))
        .then(() => {
          Bangle.beep(200, 3000);
          Bangle.buzz()
        });
    }

    buzz();
    // again, 10 secs later
    this.timeout = setTimeout(buzz.bind(this), 10000);
  }
}

function drawCounter (currentValue, x, y) {
  if (currentValue < 0) {
    return;
  }

  x = x || 120;
  y = y || 120;

  let minutes = 0;
  let seconds = 0;

  if (currentValue >= 60) {
    minutes = Math.floor(currentValue / 60);
    seconds = currentValue % 60;
  } else {
    seconds = currentValue;
  }

  let minutesString = '' + minutes;
  let secondsString = '' + seconds;

  if (minutes < 10) {
    minutesString = '0' + minutes;
  }

  if (seconds < 10) {
    secondsString = '0' + seconds;
  }

  g.clear();
  g.drawString(minutesString + ':' + secondsString, x, y);
}

function init () {
  const initState = new InitState();
  initState.go();
}

init();
