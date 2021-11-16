/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


// Emojis are integer pairs with the form [ image, Unicode code point ]
// For code points see https://unicode.org/emoji/charts/emoji-list.html
const EMOJIS = [
    [ ':)', 0x1f642 ], // Slightly smiling
    [ ':|', 0x1f610 ], // Neutral
    [ ':(', 0x1f641 ], // Slightly frowning
    [ '+1', 0x1f44d ], // Thumbs up
    [ '-1', 0x1f44e ], // Thumbs down
    [ '<3', 0x02764 ], // Heart
];
const EMOJI_TRANSMISSION_MILLISECONDS = 5000;
const BLINK_PERIOD_MILLISECONDS = 500;
const TRANSMIT_BUZZ_MILLISECONDS = 200;
const CYCLE_BUZZ_MILLISECONDS = 50;

// Non-user-configurable constants
const IMAGE_INDEX = 0;
const CODE_POINT_INDEX = 1;
const BTN_WATCH_OPTIONS = { repeat: true, debounce: 20, edge: "falling" };
const UNICODE_CODE_POINT_ELIDED_UUID = [ 0x49, 0x6f, 0x49, 0x44, 0x55,
                                         0x54, 0x46, 0x2d, 0x33, 0x32 ];


// Global variables
let emojiIndex = 0;
let isToggleOn = false;
let isTransmitting = false;
let lastDragX = 0;
let lastDragY = 0;


// Cycle through emojis
function cycleEmoji(isForward) {
  if(isTransmitting) { return; }

  if(isForward) {
    emojiIndex = (emojiIndex + 1) % EMOJIS.length;
  }
  else if(--emojiIndex < 0) {
    emojiIndex = EMOJIS.length - 1;
  }

  drawImage(EMOJIS[emojiIndex][IMAGE_INDEX]);
  Bangle.buzz(CYCLE_BUZZ_MILLISECONDS);
}


// Handle a touch: transmit displayed emoji
function handleTouch(zone, event) {
  if(isTransmitting) { return; }

  let emoji = EMOJIS[emojiIndex];
  transmitEmoji(emoji[IMAGE_INDEX], emoji[CODE_POINT_INDEX],
                EMOJI_TRANSMISSION_MILLISECONDS);
  Bangle.buzz(TRANSMIT_BUZZ_MILLISECONDS);
}


// Transmit the given code point for the given duration in milliseconds,
// blinking the image once per second.
function transmitEmoji(image, codePoint, duration) {
  let instance = [ 0x00, 0x00, (codePoint >> 24) & 0xff,
                  (codePoint >> 16) & 0xff, (codePoint >> 8) & 0xff,
                  codePoint & 0xff ];

  require('ble_eddystone_uid').advertise(UNICODE_CODE_POINT_ELIDED_UUID,
                                         instance);
  isTransmitting = true;

  let displayIntervalId = setInterval(toggleImage, BLINK_PERIOD_MILLISECONDS,
                                      image);

  setTimeout(terminateEmoji, duration, displayIntervalId);
}


// Terminate the emoji transmission
function terminateEmoji(displayIntervalId) {
  NRF.setAdvertising({ });
  isTransmitting = false;
  clearInterval(displayIntervalId);
  drawImage(EMOJIS[emojiIndex][IMAGE_INDEX]);
}


// Toggle the display between image/off
function toggleImage(image) {
  if(isToggleOn) {
    drawImage(EMOJIS[emojiIndex][IMAGE_INDEX]);
  }
  else {
    g.clear();
  }
  isToggleOn = !isToggleOn;
}


// Draw the given emoji
function drawImage(image) {
  g.clear();
  g.drawString(image, g.getWidth() / 2, g.getHeight() / 2);
  g.flip();
}


// Handle a drag event
function handleDrag(event) {
  let isFingerReleased = (event.b === 0);

  if(isFingerReleased) {
    let isHorizontalDrag = (Math.abs(lastDragX) >= Math.abs(lastDragY)) &&
                           (lastDragX !== 0);

    if(isHorizontalDrag) {
      cycleEmoji(lastDragX > 0);
    }
  }
  else {
    lastDragX = event.dx;
    lastDragY = event.dy;
  }
}


// Special function to handle display switch on
Bangle.on('lcdPower', (on) => {
  if(on) {
    drawImage(EMOJIS[emojiIndex][IMAGE_INDEX]);
  }
});


// On start: display the first emoji and handle drag and touch events
g.clear();
g.setFont('Vector', 80);
g.setFontAlign(0, 0);
drawImage(EMOJIS[emojiIndex][IMAGE_INDEX]);
Bangle.on('touch', handleTouch);
Bangle.on('drag', handleDrag);
