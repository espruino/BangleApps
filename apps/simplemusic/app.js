// For info on interfacing with Gadgetbridge, see https://www.espruino.com/Gadgetbridge
const Debug = false;  // Set to true to show debugging into
const Layout = require("Layout");
const PrimaryFont = "Vector:18";

const buttonPadding = 10;

const Command = {
  next: "next",
  pause: "pause",
  play: "play",
  previous: "previous",
  volumeup: "volumeup",
  volumedown: "volumedown",
};

const PlaybackState = {
  paused: "pause",
  playing: "play"
};

/**
 * Format elapsed time in minutes and seconds.
 * @param {*} time Elapsed time
 * @returns Time string
 */
function formatTime(time) {
  let minute = 0, second = 0;
  if (time) {
    minute = Math.floor(time / 60);
    second = time % 60;
  }
  let minuteStr = minute.toString(), secondStr = second.toString();

  if (minute < 10) minuteStr = `0${minute}`;
  if (second < 10) secondStr = `0${second}`;

  return `${minuteStr}:${secondStr}`;
}

/**
 * Global playback state tracker.
 * Follows the syntax {t:"musicstate", state:"play/pause",position,shuffle,repeat}
 */
let appState = { t: "musicstate", state: PlaybackState.paused, position: 0, shuffle: 0, repeat: 0 };

/**
 * Define the screen layout.
 */
let layout = new Layout({
  type: "v", c: [
    { type: "txt", id: "title", halign: -1, fillx: 0, col: g.fg, font: PrimaryFont, label: "Track N/A" },
    { type: "txt", id: "artist", halign: -1, fillx: 0, col: g.fg, font: PrimaryFont, label: "Artist N/A" },
    {
      type: "h", c: [
        { type: "txt", id: "elapsed", halign: -1, fillx: 1, col: g.fg, font: PrimaryFont, label: formatTime(0) },
        { type: "txt", id: "timeSplitter", halign: 0, fillx: 1, col: g.fg, font: PrimaryFont, label: " - " },
        { type: "txt", id: "duration", halign: 1, fillx: 1, col: g.fg, font: PrimaryFont, label: formatTime(0) }
      ]
    },
    {
      type: "h", c: [
        { type: "btn", id: Command.previous, font: PrimaryFont, col: g.fg2, bgCol: g.bg2, pad: buttonPadding, label: "|<<", cb: l => sendCommand(Command.previous, true) },
        { type: "btn", id: "playpause", font: PrimaryFont, col: g.fg2, bgCol: g.bg2, pad: buttonPadding, label: " > ", cb: l => sendCommand(appState.state === PlaybackState.paused ? Command.play : Command.pause, true) },
        { type: "btn", id: Command.next, font: PrimaryFont, col: g.fg2, bgCol: g.bg2, pad: buttonPadding, label: ">>|", cb: l => sendCommand(Command.next, true) }
      ]
    },
  ]
}, { lazy: true });

/// Set up the app
function initialize() {
  // Detect whether we're using an emulator.
  if (typeof Bluetooth === "undefined" || typeof Bluetooth.println === "undefined") { // emulator!
    Bluetooth = {
      println: (line) => { console.log("Bluetooth:", line); },
    };
  }

  // Set up listeners for swiping
  Bangle.on('swipe', function (directionLR, directionUD) {
    switch (directionLR) {
      case -1:  // Left
        sendCommand(Command.previous, true);
        break;
      case 1:   // Right
        sendCommand(Command.next, true);
        break;
    }

    switch (directionUD) {
      case -1:  // Up
        sendCommand(Command.volumeup, true);
        break;
      case 1:   // Down
        sendCommand(Command.volumedown, true);
        break;
    }
  });

  // Eat music events (๑ᵔ⤙ᵔ๑)
  Bangle.on("message", (type, message)=>{
    if (type.includes("music") && !message.handled) {
      processMusicEvent(message);
      message.handled = true;
    }
  });

  // Toggle play/pause if the button is pressed
  setWatch(function() {
    sendCommand(appState.state === PlaybackState.paused ? Command.play : Command.pause, true);
  }, BTN, {edge: "falling", debounce: 50, repeat: true});

  // Goad Gadgetbridge into sending us the current track info
  sendCommand(Command.volumeup, false);
  sendCommand(Command.volumedown, false);

  // Render the screen
  g.clear();
  draw();
}

function draw() {
  layout.update();
  layout.render();
}

// Track how long the current song has been running.
let elapsedTimer;
let position = 0;
function updateTime() {
  position++;
  layout.elapsed.label = formatTime(position);
  draw();

  if (Debug) console.log("Tick");
}

function clearTimer() {
  position = 0;
  if (elapsedTimer) {
    clearInterval(elapsedTimer);
    elapsedTimer = undefined;
  }
}

/**
 * Send a command via Bluetooth back to Gadgetbridge.
 * @param {Command} command Which command to execute
 * @param {true|false} buzz Whether to vibrate the motor
 */
function sendCommand(command, buzz) {
  if (buzz) Bangle.buzz(50);
  Bangle.musicControl(command);
}

function processMusicEvent(event) {
  if (Debug) console.log("State: " + event.state);
  if (Debug) console.log("Position: " + event.position);

  position = event.position;

  switch(event.state) {
    case PlaybackState.playing:
      if (Debug) console.log("Playing");
      appState.state = event.state;
      elapsedTimer = setInterval(updateTime, 1000);
      layout.playpause.label = " || ";
      break;
    case PlaybackState.paused:
      if (Debug) console.log("Paused");
      appState.state = event.state;
      clearTimer();
      layout.playpause.label = " > ";
      break;
    case PlaybackState.previous:
    case PlaybackState.next:
      // Reset position
      position = 0;
      appState.state = PlaybackState.playing;
      break;
  }

  // Re-render track info on song change
  if (event.track != layout.title.label) {
    position = 0;
    layout.title.label = event ? event.track : "Track N/A";
    layout.artist.label = event ? event.artist : "Artist N/A";
    layout.duration.label = formatTime(event.dur);
  }

  draw();
  if (Debug) layout.debug();
}

// Start the app and set up listeners
initialize();