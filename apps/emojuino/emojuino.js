/**
 * Copyright reelyActive 2021
 * We believe in an open Internet of Things
 */


// Emoji images are 96px x 96px, 4bpp (https://www.espruino.com/Image+Converter)
// and adapted from Font Awesome 5
const GRIN = "sFgwkBiIATDwoaUFi4ynQZ4uuGDzlTF1wwaFyowYFy4wWiAvZgIutGCgubSKRecMCQudMCBeeMCAufMBxegMBwuhMBheiMBgujMBRekMBQvvF0qQIL0xgIF94unSA4vuR1CQGF94upSAovuR1SQEF94urSAY/PCBivQF5z/DEBQ+DEB5ePCJYOEMBgNNF8MBHpogNHwqBNF/4vsEAovOX7TviBhYgFD5Q/EEJoANEAY/OLxgAQPx5edAH4A/AH4A/AH4A/AEUQF1sBF/4v/F/4vviILJBRQANEZYLJHQIMKFpYABQhIiKC4QaMIhBHLF6AAVEhRQIF8ZuCF5B6GACYjMF9ZrOF8jAiKRgvvSEJROBo5gYEBw+IMCwfPB5BgWDxBPHCCBeVJxBgdJqIvJMCQcTCRAwRFxJ8KChQwODKwVJGBouKbZgXLDBQVLPBoZLDYxDMLxocQACLXOMBwARFxxgfLx5gfFyBgdLyIwcFyaRbFygwZFywwXFzAwVFzQwTFzgwRFzwxOFsIyKDSg";
const MEH = "sFgwkBiIATDwoaUFi4ynQZ4uuGDzlTF1wwaFyowYFy4wWiAvZgIutGCgubSKRecMCQudMCBeeMCAufMBxegMBwuhMBheiMBgujMBRekMBQvvF0qQIL0xgIF94unSA4vuR1CQGF94upSAovuR1SQEF94urSAY/PCBivQF5z/DEBQ+DEB5ePCJYOEMBgNNF8MBHpogNHwqBNF/4vsEAovOX7TviBhYgFD5Q/EEJoANEAY/OLxgAQPx5edAH4A/AH4A/AH4A/AEUQF1sBF/4v/F/4vviIvtiIv/F9qeBACDgNB5ouSECAOLFyaBMKAYvrByQvgSBS/fD4jAfXxwQMADxAQF8iQLADjeGF96QoFwxgnLw4vwSEwuIMEpeJMEouKMEZeLMEYuMMEJeNMEIuOMD5ePMD4uQMDpeRGDguTSLYuUGDIuWGC4uYGCouaGCYucGCIueGJwthGRQaUA";
const FROWN = "sFgwkBiIATDwoaUFi4ynQZ4uuGDzlTF1wwaFyowYFy4wWiAvZgIutGCgubSKRecMCQudMCBeeMCAufMBxegMBwuhMBheiMBgujMBRekMBQvvF0qQIL0xgIF94unSA4vuR1CQGF94upSAovuR1SQEF94urSAY/PCBivQF5z/DEBQ+DEB5ePCJYOEMBgNNF8MBHpogNHwqBNF/4vsEAovOX7TviBhYgFD5Q/EEJoANEAY/OLxgAQPx5edAH4A/AH4A/AH4A/AEUQF1sBF/4v/F/4vUgMRAAQZWFqwxWCgIuZGCYvSFxIcUFzYdTOZyNKSKQdCCJwuNMB5NDLzZOPIKAviCJguPJxpNEF94RLRyBONIKAvHNRQvRCKAMUJpIvOZxx9WAEbSTADReHF+CQmFxBglLxJglFxRgjLxZgjFxhghLxpghFxxgfLx5gfFyBgdLyIwcFyaRbFygwZFywwXFzAwVFzQwTFzgwRFzwxOFsIyKDSg";
const THUMBS_UP = "sFgwkBiIAaiAiBDzYAQKYZQcLyAwsF4qSpcoxgoF4xgnRwwvxSEwvvFw4vwYEwv/F/4AOiAv/R1Av/F/6+PgIv/RzwvjLxQvkFxTujLxYvjFxaOiLxgvvR1wviR3gviR3YviFxg6iF7AwVRxowhFzUAgIvuMCSObF6YucSCJedF6IudSARQIHQheeAAIgKGAYufF+CbMF/4v/WYQv/F/6yPF/6OeF9wgNL/4v/F/4vhEQIv/R/4v/F/7ueF/4v/Xx4v/F/4v/F/4v/F/4v/F7ogOF/6OSEAgHCiAvrAwQHHRz4v/F/4v/F58QF8cBE4wPDGLYvHB5aTaKwQvUMS4vYGCx8QF5AwULwgvWYiZJQIAowXDowvYGJyqRFx4bKDRQA==";
const THUMBS_DOWN = "sFgwkBiIAbiAoGEroAHLZgttMcK9RXEZgmFyZgHDZA/JFyogFDZQwHFqovXLiyQHB5wtaF6gubF/4v/F/4vwgIv/F7wgPF/6QTF/4v/F/4v/F/4v/F/4AdF/4v/YCIv/F/4v9EQIv/R/4v/F/7ueL+gFBiMQF8oiBE4wHHF/6QQF/4v/YigvugInBiAvrM5QvvM4gvqMFgvDMD0BF55gegJPKgIvEMDoeLF4pgdJ5QuGF7gjHABaQbFyRgbFygvZFyqQOEixgYF8RgMgIv/SH5gPYH6QfF8aQvMBgvjMBaQjMBYvkMBQv/SEAv/F/7APF/6QfF/4v/F/0BF8sQF/4vnF0rAJF9yOmSBAunF4xeoSAouqMAYTQA==";
const HEART = "sFgwkBiIA/AH4A/AH4AogAADC1EQC4gaQCo8BIqYwRCyxdJDJoVLMJYuMGBIVNGBQYNDI5FOO5IXODI4WWI6BgGCywYTDIYVVO6gvXSAoYTDIQVTMAgYTDIJFUMAgYUACyOXAC7XWF7YurSAYvuR1iQCF/4v/F54utAH4A/AH4A/AH4A/AGMQF1sBF/4v/F58RF9sRF/4vgYFi+BMFouCF+CQqRwYvwSFQuEMFJeFMFIuGME5eHME4uIMEpeJMEouKMEZeLMEYuMMEJeNMEIuOMD5ePMD4uQMDpeRMDouSMDZeTMDYuUMDJeVMDIuWMC5eXMC4uYMCpeZMCouaMCZebMCYucMCJedF+CQQFzxgPFz5gPF8JgMXr5gPF0RgLL0ZgLF0hgJL0pgJF0xgHL05gHF1BgFL1JgFF1QwDF1gA/AH4A/AH4AJA=";
const TX = "k8XwkBiIAYEYogLHBAUIiBNKGxooKEggvJCYYHDKxAMFAoRrOCRAsHCYqbNHQibLKAauOLBCJHQw6JMQBIJBRJDWJThK5JJJi5KbpaJKFBaKEE5ybGHRhcOACEQA";


// Emojis are pairs with the form [ Image String, Unicode code point ]
// For code points see https://unicode.org/emoji/charts/emoji-list.html
const EMOJIS = [
    [ GRIN, 0x1f642 ],        // Slightly smiling
    [ MEH, 0x1f610 ],         // Neutral
    [ FROWN, 0x1f641 ],       // Slightly frowning
    [ THUMBS_UP, 0x1f44d ],   // Thumbs up
    [ THUMBS_DOWN, 0x1f44e ], // Thumbs down
    [ HEART, 0x02764 ],       // Heart
];
const EMOJI_TRANSMISSION_MILLISECONDS = 5000;
const BLINK_PERIOD_MILLISECONDS = 500;
const TRANSMIT_BUZZ_MILLISECONDS = 200;
const CYCLE_BUZZ_MILLISECONDS = 50;
const WELCOME_MESSAGE = 'Emojuino:\r\n\r\n< Swipe >\r\nto select\r\n\r\nTap\r\nto transmit';

// Non-user-configurable constants
const APP_ID = 'emojuino';
const IMAGE_INDEX = 0;
const CODE_POINT_INDEX = 1;
const EMOJI_PX = 96;
const EMOJI_X = (g.getWidth() - EMOJI_PX) / 2;
const EMOJI_Y = (g.getHeight() - EMOJI_PX) / 2;
const TX_X = 68;
const TX_Y = 12;
const FONT_SIZE = 24;
const ESPRUINO_COMPANY_CODE = 0x0590;
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
  drawImage(EMOJIS[emojiIndex][IMAGE_INDEX], true);

  let displayIntervalId = setInterval(toggleImage, BLINK_PERIOD_MILLISECONDS,
                                      image);

  setTimeout(terminateEmoji, duration, displayIntervalId);
}


// Transmit the app name under the Espruino company code to facilitate discovery
function transmitAppName() {
  let options = {
      showName: false,
      manufacturer: ESPRUINO_COMPANY_CODE,
      manufacturerData: JSON.stringify({ name: APP_ID }),
      interval: 2000
  }

  NRF.setAdvertising({}, options);
}


// Terminate the emoji transmission
function terminateEmoji(displayIntervalId) {
  transmitAppName();
  isTransmitting = false;
  clearInterval(displayIntervalId);
  drawImage(EMOJIS[emojiIndex][IMAGE_INDEX], false);
}


// Toggle the display between image/off
function toggleImage(image) {
  if(isToggleOn) {
    drawImage(EMOJIS[emojiIndex][IMAGE_INDEX], true);
  }
  else {
    g.clear();
  }
  isToggleOn = !isToggleOn;
}


// Draw the given emoji
function drawImage(image, isTx) {
  g.clear();
  g.drawImage(require("heatshrink").decompress(atob(image)), EMOJI_X, EMOJI_Y);
  if(isTx) {
    g.drawImage(require("heatshrink").decompress(atob(TX)), TX_X, TX_Y);
  }
  else {
    g.drawString("< Swipe >", g.getWidth() / 2, g.getHeight() - FONT_SIZE);
  }
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
    drawImage(EMOJIS[emojiIndex][IMAGE_INDEX], false);
  }
});


// On start: display the first emoji and handle drag and touch events
g.clear();
g.setFont('Vector', FONT_SIZE);
g.setFontAlign(0, 0);
g.drawString(WELCOME_MESSAGE, g.getWidth() / 2, g.getHeight() / 2);
Bangle.on('touch', handleTouch);
Bangle.on('drag', handleDrag);
transmitAppName();
