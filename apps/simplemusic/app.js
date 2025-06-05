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

  // Goad Gadgetbridge into sending us the current track info
  sendCommand(Command.volumeup, false);
  sendCommand(Command.volumedown, false);
}

function draw() {
  layout.render();
  Bangle.drawWidgets();
}

/**
 * Send a command via Bluetooth back to Gadgetbridge.
 * @param {Command} command Which command to execute
 * @param {true|false} buzz Whether to vibrate the motor
 */
function sendCommand(command, buzz) {
  if (buzz) Bangle.buzz(50);
  Bluetooth.println(JSON.stringify({ t: "music", n: command }));

  switch (command) {
    // If this is a play or pause command, display the track and artist
    case Command.play:
      updateState(PlaybackState.playing);
      break;
    case Command.pause:
      updateState(PlaybackState.paused);
      break;
    // Reset the duration clock for new tracks
    case Command.next:
    case Command.previous:
      layout.elapsed.label = formatTime(0);
      break;
  }
}

/// Track how long the current song has been running.
let elapsedTimer;
let position = 0;
function updateTime() {
  position++;
  layout.elapsed.label = formatTime(position);
  layout.render();

  if (Debug) console.log("Tick");
}

/**
 * Get info about the current playing song.
 * @param {Object} info - Gadgetbridge musicinfo event
 */
function showTrackInfo(info) {
  layout.title.label = info ? info.track : "Track N/A";
  layout.artist.label = info ? info.artist : "Artist N/A";
  layout.duration.label = info ? formatTime(info.dur) : formatTime(0);
  draw();
  if (Debug) layout.debug();
}

/**
 * Updates the current state of the app.
 * Called when Gadgetbridge updates (see boot.js)
 * @param {*} state 
 */
function updateState(state) {
  appState.state = state;
  position = state.position;

  // Alternate between play and pause symbols
  if (state === PlaybackState.playing) {
    elapsedTimer = setInterval(updateTime, 1000);
    layout.playpause.label = " || ";
  }
  else if (state === PlaybackState.paused) {
    if (elapsedTimer) clearInterval(elapsedTimer);
    layout.playpause.label = " > ";
  }
}

/**
 * Listen for Gadgetbridge events
 */
setTimeout(() => {
  globalThis.GB = (_GB => e => {
    switch (e.t) {
      case "musicinfo":
        return showTrackInfo(e);
      case "musicstate":
        return updateState(e);
      default:
        // pass on other events
        if (_GB) setTimeout(_GB, 0, e);
    }
  })(globalThis.GB);
}, 1);

// Toggle play/pause if the button is pressed
setWatch(function() {
  sendCommand(appState.state === PlaybackState.paused ? Command.play : Command.pause, true);
}, BTN, {edge:"rising", debounce:50, repeat:true});

// Start the app
initialize();

// Render the screen
g.clear();
draw();