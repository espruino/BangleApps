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
  constructor (state, device) {
    this.state = state;
    this.device = device;
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
  constructor (device) {
    super(STATES.INIT, device);

    this.timeCounter = parseInt(storage.read(".pomodo") || DEFAULT_TIME, 10);
  }

  saveTime () {
    storage.write('.pomodo', '' + this.timeCounter);
  }

  setButtons () {
    this.device.setBTN1(() => {
      if (this.timeCounter + 300 > 3599) {
        this.timeCounter = 3599;
      } else {
        this.timeCounter += 300;
      }

      this.draw();

    });

    this.device.setBTN3(() => {
      if (this.timeCounter - 300 > 0) {
        this.timeCounter -= 300;
        this.draw();
      }
    });

    this.device.setBTN4(() => {
      if (this.timeCounter - 60 > 0) {
        this.timeCounter -= 60;
        this.draw();
      }
    });

    this.device.setBTN5(() => {
      if (this.timeCounter + 60 > 3599) {
        this.timeCounter = 3599;
      } else {
        this.timeCounter += 60;
      }

      this.draw();

    });

    this.device.setBTN2(() => {
      this.saveTime();
      const startedState = new StartedState(this.timeCounter, this.device);

      this.setNext(startedState);
      this.next.go();
    });
  }

  draw () {
    g.clear();
    g.setFontAlign(0, 0); // center font
    g.setFont("Vector", 50); // vector font, 80px
    drawCounter(this.timeCounter);
  }
}

class StartedState extends State {
  constructor (timeCounter, buttons) {
    super(STATES.STARTED, buttons);

    this.timeCounter = timeCounter;
  }

  draw () {
    drawCounter(this.timeCounter, g.getWidth() / 2, g.getHeight() / 2);
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

    const doneState = new DoneState(this.device);
    this.setNext(doneState);
    counterInterval = setInterval(countDown.bind(this), 1000);
  }
}

class BreakState extends State {
  constructor (buttons) {
    super(STATES.BREAK, buttons);
  }

  draw () {
    g.setFontAlign(0, 0);
  }

  init () {
    const startedState = new StartedState(TIME_BREAK, this.device);

    this.setNext(startedState);
    this.next.go();
  }
}

class DoneState extends State {
  constructor (device) {
    super(STATES.DONE, device);
  }

  setButtons () {
    this.device.setBTN1(() => {
    });

    this.device.setBTN3(() => {
    });

    this.device.setBTN2(() => {
    });
  }

  draw () {
    g.clear();
    E.showPrompt("You are a hero!", {
      buttons : {"AGAIN":1,"BREAK":2}
    }).then((v) => {
      var nextSate = (v == 1
                      ? new InitState(this.device)
                      : new BreakState(this.device));
      clearTimeout(this.timeout);
      nextSate.go();
    });
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

class Bangle1 {
  setBTN1(callback) {
    setWatch(callback, BTN1, { repeat: true });
  }

  setBTN2(callback) {
    setWatch(callback, BTN2, { repeat: true });
  }

  setBTN3(callback) {
    setWatch(callback, BTN3, { repeat: true });
  }

  setBTN4(callback) {
    setWatch(callback, BTN4, { repeat: true });
  }

  setBTN5(callback) {
    setWatch(callback, BTN5, { repeat: true });
  }
}

class Bangle2 {
  setBTN1(callback) {
      Bangle.on('touch', function(zone, e) {
          if (e.y < g.getHeight() / 2) {
              callback();
          }
      });
  }

  setBTN2(callback) {
    setWatch(callback, BTN1, { repeat: true });
  }

  setBTN3(callback) {
      Bangle.on('touch', function(zone, e) {
          if (e.y > g.getHeight() / 2) {
              callback();
          }
      });
  }

  setBTN4(callback) { }

  setBTN5(callback) { }
}

function drawCounter (currentValue, x, y) {
  if (currentValue < 0) {
    return;
  }

  x = x || g.getWidth() / 2;
  y = y || g.getHeight() / 2;

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
  device = (process.env.HWVERSION==1
             ? new Bangle1()
             : new Bangle2());
  const initState = new InitState(device);
  initState.go();
}

init();
