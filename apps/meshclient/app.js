// Bangle.js 2 Meshtastic Node Monitor
// BLE scan at startup and after connection failure.
// Maintains 10 recently updated nodes and supports mesh chat.
// Meshtastic Bluetooth should be configured for NO_PIN while developing.

// MESHTASTIC BLE UUIDs
const SERVICE = "6ba1b218-15a8-461f-9fa8-5dcae273eafd";
const FROMRADIO = "2c55e69e-4993-11ed-b878-0242ac120002";
const TORADIO = "f75c76d2-129e-4dad-a1dd-7866124401e7";
const FROMNUM = "ed9da18c-a800-4f66-a670-aa7547e34453";

// CONNECTION STATE
var device = null;
var fromRadio = null;
var toRadio = null;
var fromNum = null;
var connected = false;
var connecting = false;
var scanInProgress = false;
var draining = false;

// MESHTASTIC STATE
var myNodeNum = null;
var radioLongName = "---";
var radioVoltage = null;
var nodes = [];
var channels = [];
var msgChannel = 0;
const NODE_LIST_LONGNAME_MAX = 16;


// CONFIGURATION STATE
const configRequestId = 69420;
const DEFAULT_HOP_LIMIT = 7;
// PORTNUM CONSTANTS
const PORTNUM_NODEINFO_APP = 4;
const PORTNUM_TELEMETRY_APP = 67;
const PORTNUM_TEXT_MESSAGE_APP = 1;

// DISPLAY
const SCREEN_W = g.getWidth();
const SCREEN_H = g.getHeight();
const HEADER_H = 22;
const LIST_TOP = 24;
const ROW_H = 10;
const LIST_BOTTOM = 119;
const BUTTON_TOP = 125;
const MAX_MESSAGE_LENGTH = 27;
var chatLinesCache = null;
var chatLinesCacheDirty = true;

// SCREEN HELPERS
function clearScreen() { g.setColor(0, 0, 0); g.clear(); }

// CHAT
var chatMessages = [];
const MAX_CHAT_MESSAGES = 24;      // was 16
const CHAT_MAX_CHARS = 28;

var chatScrollOffset = 0;   // lines scrolled back from the newest (bottom)
var chatDragAccum = 0;

// BUTTON TIMER
var sendHoldTimer = null;
var sendHoldStatus = false;

// UTF-8 DECODER
// Converts UTF-8 bytes into a JavaScript string.
function utf8Decode(bytes) {
  var s = "";
  var i = 0;
  while (i < bytes.length) {
    var c = bytes[i++];
    // ASCII
    if (c < 0x80) { s += String.fromCharCode(c); continue; }
    // 2-byte UTF-8
    if ((c & 0xe0) === 0xc0 && i < bytes.length) {
      var c2 = bytes[i++];
      var cp = ((c & 0x1f) << 6) | (c2 & 0x3f);
      s += String.fromCharCode(cp);
      continue;
    }
    // 3-byte UTF-8
    if ((c & 0xf0) === 0xe0 && i + 1 < bytes.length) {
      var c2 = bytes[i++];
      var c3 = bytes[i++];
      var cp3 = ((c & 0x0f) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f);
      s += String.fromCharCode(cp3);
      continue;
    }
    // 4-byte UTF-8
    if ((c & 0xf8) === 0xf0 && i + 2 < bytes.length) {
      var c2 = bytes[i++];
      var c3 = bytes[i++];
      var c4 = bytes[i++];
      var cp4 = ((c & 0x07) << 18) |
        ((c2 & 0x3f) << 12) |
        ((c3 & 0x3f) << 6) |
        (c4 & 0x3f);
      cp4 -= 0x10000;
      s += String.fromCharCode(
        0xd800 + (cp4 >> 10),
        0xdc00 + (cp4 & 0x3ff)
      );
      continue;
    }
    // Invalid UTF-8 byte.
    s += "?";
  }
  return s;
}

// Return the final four hex digits of a Meshtastic node number.
function nodeNumberSuffix(num) {
  if (num === null || num === undefined || !isFinite(num)) return "????";
  var hex = (num >>> 0).toString(16).toUpperCase();
  while (hex.length < 8) hex = "0" + hex;
  return hex.substr(hex.length - 4, 4);
}

// Replace any non-printable/non-ASCII character with '?' instead of
// rejecting the whole string - long names are usually mostly normal
// text even if they contain one stray emoji.
function sanitizeForDisplay(s) {
  if (!s) return "";
  var out = "";
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    out += (c >= 32 && c <= 126) ? s.charAt(i) : "?";
  }
  return out;
}

function formatNodeListLabel(longName, num, maxChars) {
  var hex = nodeNumberSuffix(num);
  var name = sanitizeForDisplay(longName);

  if (name.length > maxChars) {
    name = name.substr(0, maxChars);
  }

  if (name.length === 0) {
    return "(" + hex + ")";
  }

  return name + " (" + hex + ")";
}

// HEADER
function drawHeader() {
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, SCREEN_W - 1, HEADER_H - 1);
  g.setFont("6x8", 2);
  g.setFontAlign(-1, -1);
  if (connected) {
    g.setColor(0, 1, 0);
    g.drawString(">", 2, 3);
  } else if (connecting) {
    g.setColor(1, 1, 0);
    g.drawString("~", 2, 3);
  } else {
    g.setColor(1, 0, 0);
    g.drawString("x", 2, 3);
  }
  g.setColor(1, 1, 1);
  var headerName = sanitizeForDisplay(radioLongName);
  if (headerName.length === 0) {
    headerName = nodeNumberSuffix(myNodeNum);
  }
  if (headerName.length > 6) headerName = headerName.substr(0, 6);
  g.drawString(headerName, 15, 3);
  var voltageText = "-.--v";
  if (radioVoltage !== null && isFinite(radioVoltage)) voltageText = radioVoltage.toFixed(2) + "v";
  g.setFont("4x6", 2);
  g.drawString(voltageText, 136, 5);
  g.setFontAlign(-1, -1);
  g.setColor(0.3, 0.3, 0.3);
  g.drawLine(0, HEADER_H - 1, SCREEN_W - 1, HEADER_H - 1);
}

function formatLastHeard(timestamp) {
  if (!timestamp || timestamp <= 0) return "--";
  var now = Math.floor(Date.now() / 1000);
  var diff = now - timestamp;
  if (diff < 0) diff = 0;
  if (diff < 60) return diff + "s";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) {
    var h = Math.floor(diff / 3600);
    var m = Math.floor((diff % 3600) / 60);
    if (m < 10) return h + "h 0" + m;
    return h + "h " + m;
  }
  return Math.floor(diff / 86400) + "d";
}

// NODE LIST
function drawNodeList() {
  g.setColor(0, 0, 0);
  g.fillRect(0, LIST_TOP, SCREEN_W - 1, LIST_BOTTOM);
  g.setFont("6x8");
  var y = LIST_TOP + 1;
  for (var i = 0; i < 10; i++) {
    if (i < nodes.length) {
      var n = nodes[i];
      g.setColor(1, 1, 1);
      var name = formatNodeListLabel(n.longName, n.num, NODE_LIST_LONGNAME_MAX);
      g.drawString(name, 4, y);
      g.setFontAlign(1, -1);
      g.drawString(formatLastHeard(n.lastHeard), 172, y);
      g.setFontAlign(-1, -1);
    } else {
      g.setColor(0.18, 0.18, 0.18);
      g.drawString("--", 4, y);
    }
    y += ROW_H;
  }
}

// BOTTOM BUTTONS
function drawBottomButtons() {
  g.setColor(0, 0, 0);
  g.fillRect(0, BUTTON_TOP, SCREEN_W - 1, SCREEN_H - 1);
  g.setColor(0.3, 0.3, 0.3);
  g.drawLine(0, BUTTON_TOP, SCREEN_W - 1, BUTTON_TOP);
  g.setColor(1, 1, 1);
  g.drawLine(80, BUTTON_TOP + 5, 80, SCREEN_H - 4);
  g.setFont("6x8", 2);
  g.setFontAlign(0, 0);
  g.drawString("CHAT", 44, 151);
  g.drawString("CHANNEL", 132, 151);
  g.setFontAlign(-1, -1);
}

// CHAT
const layers = [
  ["qwert", "yuiop"],
  ["asdfg", "hjkl"],
  ["zxcvb", "nm"],
  ["12345", "67890"],
  ["!?.,&", "+-*/%"]
];


const channel_colors = [
  [1,0,0],
  [0,1,0],
  [1,1,1],
  [1,1,0],
  [1,0,1],
  [0,1,1]
];

const MAX_COLORS = channel_colors.length;

var currentScreen = "main";
var keyboardText = "";
var keyboardShift = false;
var keyboardLayer = 0;
const KB_TOP = 42;
const KB_ROW_H = 27;
const LETTER_KEY_W = 27;
const SIDE_AREA_X = 135;
const SIDE_BTN_W = 41;


function buildKeyboardKeys() {

  var keys = [];

  var row0 = layers[keyboardLayer][0] || "";
  var row1 = layers[keyboardLayer][1] || "";

  var applyShift =
    keyboardShift && keyboardLayer < 3;

  for (var c = 0; c < row0.length; c++) {

    var ch = row0.charAt(c);
    if (applyShift) { ch = ch.toUpperCase(); }

    keys.push({
      x: c * LETTER_KEY_W, y: KB_TOP,
      w: LETTER_KEY_W, h: KB_ROW_H,
      label: ch, action: "char", value: ch
    });
  }

  for (var c2 = 0; c2 < row1.length; c2++) {

    var ch2 = row1.charAt(c2);
    if (applyShift) { ch2 = ch2.toUpperCase(); }

    keys.push({
      x: c2 * LETTER_KEY_W, y: KB_TOP + KB_ROW_H,
      w: LETTER_KEY_W, h: KB_ROW_H,
      label: ch2, action: "char", value: ch2
    });
  }

  // Layer cycle - up/down instead of 4 direct-jump buttons
  keys.push({
    x: SIDE_AREA_X, y: KB_TOP,
    w: SIDE_BTN_W, h: KB_ROW_H,
    label: "^", action: "layerUp"
  });

  keys.push({
    x: SIDE_AREA_X, y: KB_TOP + KB_ROW_H,
    w: SIDE_BTN_W, h: KB_ROW_H,
    label: "v", action: "layerDown"
  });

  var controlY = KB_TOP + 2 * KB_ROW_H;

  keys.push({
    x: 0, y: controlY, w: 56, h: KB_ROW_H,
    label: keyboardShift ? "shft" : "SHFT",
    action: "shift"
  });

  keys.push({
    x: 56, y: controlY, w: 64, h: KB_ROW_H,
    label: "SPC", action: "space"
  });

  keys.push({
    x: 120, y: controlY, w: 56, h: KB_ROW_H,
    label: "DEL", action: "del"
  });

  return keys;
}

function handleKeyboardAction(key) {

  if (key.action === "char" || key.action === "space") {

    if (keyboardText.length < MAX_MESSAGE_LENGTH) {
      keyboardText += (key.action === "space") ? " " : key.value;
      drawScreen();
    }

  } else if (key.action === "del") {

    keyboardText = keyboardText.substr(0, keyboardText.length - 1);
    drawScreen();

  } else if (key.action === "shift") {

    keyboardShift = !keyboardShift;
    drawScreen();

  } else if (key.action === "layerUp") {

    keyboardLayer =
      (keyboardLayer === 0) ?
      (layers.length - 1) :
      (keyboardLayer - 1);

    drawScreen();

  } else if (key.action === "layerDown") {

    keyboardLayer =
      (keyboardLayer + 1) % layers.length;

    drawScreen();
  }
}

function drawKeyboardScreen() {
  clearScreen();
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, SCREEN_W - 1, HEADER_H - 1);
  g.setFontAlign(-1, -1);
  g.setColor(0.30, 0.30, 0.30);
  g.drawLine(0, KB_TOP - 4, SCREEN_W - 1, KB_TOP - 4);
  g.setColor(1, 1, 1);
  g.setFont("6x8", 2);
  if (sendHoldStatus) {
    g.setColor(1, 0.6, 0);
    g.setFontAlign(0, 0);
    g.drawString("Hold for 3s", SCREEN_W / 2, 16);
    g.drawString("to send...", SCREEN_W / 2, 27);
    g.setFontAlign(-1, -1);
  } else {
    var previewLines = wrapText(keyboardText.length ? keyboardText : "|", 14);
    var startIdx = Math.max(0, previewLines.length - 2);
    var y = 0;

    for (var i = startIdx; i < previewLines.length; i++) {
      g.drawString(previewLines[i], 4, y);
      y += 18;
    }
  }
  g.setColor(0.30, 0.30, 0.30);
  g.drawLine(0, 36, SCREEN_W - 1, 36);
  var keys = buildKeyboardKeys();
  g.setFont("6x8", 2);
  g.setFontAlign(0, 0);
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    g.setColor(0.3, 0.3, 0.3);
    g.fillRect(key.x + 1, key.y + 1, key.x + key.w - 2, key.y + key.h - 2);
    g.setColor(1, 1, 1);
    g.drawString(key.label, key.x + key.w / 2, key.y + key.h / 2);
  }
  g.setFontAlign(-1, -1);
  g.setFont("6x8", 2);
  g.setColor(0, 0, 0);
  g.fillRect(0, BUTTON_TOP, SCREEN_W - 1, SCREEN_H - 1);
  g.setColor(0.30, 0.30, 0.30);
  g.drawLine(0, BUTTON_TOP, SCREEN_W - 1, BUTTON_TOP);
  g.setColor(1, 1, 1);
  g.drawLine(87, BUTTON_TOP + 5, 87, SCREEN_H - 4);
  
  g.setFontAlign(0, 0);
  g.drawString("CANCEL", 44, 151);
  if (sendHoldStatus) {
    g.setColor(0.5, 0.35, 0);
    g.fillRect(88, BUTTON_TOP + 1, SCREEN_W - 2, SCREEN_H - 2);
    g.setColor(1, 1, 1);
    g.drawString("HOLD...", 132, 151);
  } else {
    g.drawString("SEND", 132, 151);
  }
  
  g.setFontAlign(-1, -1);
  g.flip();
}

function wrapText(text, maxChars) {
  var words = text.split(" ");
  var lines = [];
  var current = "";
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    var candidate = current.length ? current + " " + w : w;
    if (candidate.length > maxChars) {
      if (current.length) lines.push(current);
      while (w.length > maxChars) {
        lines.push(w.substr(0, maxChars));
        w = w.substr(maxChars);
      }
      current = w;
    } else current = candidate;
  }
  if (current.length) lines.push(current);
  return lines;
}

function formatChatMessageText(m) {
  return "[" + m.channel + ":" + nodeNumberSuffix(m.num) + "] " + sanitizeForDisplay(m.text);
}

function buildChatLines(maxChars) {

  if (!chatLinesCacheDirty && chatLinesCache) {
    return chatLinesCache;
  }

  var allLines = [];

  for (var i = 0; i < chatMessages.length; i++) {

    var m = chatMessages[i];
    var wrapped = wrapText(formatChatMessageText(m), maxChars);
    var timeText = formatLastHeard(m.time);

    for (var j = 0; j < wrapped.length; j++) {
      allLines.push({
        text: wrapped[j],
        isLast: (j === wrapped.length - 1),
        time: timeText
      });
    }
  }

  chatLinesCache = allLines;
  chatLinesCacheDirty = false;

  return allLines;
}

function setChannelColor(chan_id) {
  if(chan_id >= MAX_COLORS) {
    g.setColor(1,1,1);
    return;
  }
  g.setColor(
    channel_colors[chan_id][0],
    channel_colors[chan_id][1],
    channel_colors[chan_id][2]
    );
}

function drawChatScreen() {
  clearScreen();
  // Header
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, SCREEN_W - 1, HEADER_H - 1);
  g.setFont("6x8", 2);
  g.setFontAlign(-1, -1);
  setChannelColor(msgChannel);
  g.drawString("[" + msgChannel + "]", 0, 2);
  g.setFontAlign(-1, -1);
  g.setColor(1, 1, 1);
  g.drawString("MESH CHAT", 48, 2);
  g.setFontAlign(-1, -1);
  g.setColor(0.3, 0.3, 0.3);
  g.drawLine(0, HEADER_H - 1, SCREEN_W - 1, HEADER_H - 1);

    // Message area
  g.setColor(1, 1, 1);
  g.setFont("6x8");

  var areaTop = LIST_TOP;
  var areaBottom = BUTTON_TOP - 2;
  var lineH = 8;
  var maxLines = Math.floor((areaBottom - areaTop) / lineH);

  var allLines = buildChatLines(CHAT_MAX_CHARS);
  var maxOffset = Math.max(0, allLines.length - maxLines);

  if (chatScrollOffset > maxOffset) chatScrollOffset = maxOffset;
  if (chatScrollOffset < 0) chatScrollOffset = 0;

  if (allLines.length === 0) {

    g.drawString("No messages yet", 4, areaTop);

  } else {

    var startIdx = Math.max(0, allLines.length - maxLines - chatScrollOffset);
    var y = areaTop;
    var csf = true;

    for (var i = startIdx; i < allLines.length && (i - startIdx) < maxLines; i++) {

      var line = allLines[i];

      if (csf && line.text[0] === '[') {
        setChannelColor(+line.text[1]);
        csf = false;
      }

      g.setFontAlign(-1, -1);
      g.drawString(line.text, 4, y);

      if (line.isLast) {
        g.setFontAlign(1, -1);
        g.drawString(line.time, 172, y);
        csf = true;
      }

      y += lineH;
    }

    g.setFontAlign(-1, -1);
  }
  // Bottom bar
  g.setColor(0, 0, 0);
  g.fillRect(0, BUTTON_TOP, SCREEN_W - 1, SCREEN_H - 1);
  g.setColor(0.30, 0.30, 0.30);
  g.drawLine(0, BUTTON_TOP, SCREEN_W - 1, BUTTON_TOP);
  g.setColor(1, 1, 1);
  g.drawLine(87, BUTTON_TOP + 5, 87, SCREEN_H - 4);
  if (chatScrollOffset > 0) {
    g.setFont("6x8");
    g.setFontAlign(1, 1);
    g.drawString("^ scrolled", 172, BUTTON_TOP + 10);
  }
  g.setFont("6x8", 2);
  g.setFontAlign(0, 0);
  g.drawString("MSG", 44, 151);
  g.drawString("BACK", 132, 151);
  g.setFontAlign(-1, -1);
  g.flip();
}

function drawChannelSelectScreen() {
  clearScreen();
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, SCREEN_W - 1, HEADER_H - 1);
  g.setFont("6x8", 2);
  g.setFontAlign(0, -1);
  g.setColor(1, 1, 1);
  g.drawString("SELECT CHANNEL", SCREEN_W / 2, 2);
  g.setFontAlign(-1, -1);
  g.setColor(0.30, 0.30, 0.30);
  g.drawLine(0, HEADER_H - 1, SCREEN_W - 1, HEADER_H - 1);
  g.setColor(1, 1, 1);
  var y = LIST_TOP + 4;
  var rowH = 20;
  if (channels.length === 0) {
    g.drawString("No channels yet", 6, y);
  } else {
    for (var i = 0; i < channels.length; i++) {
      var ch = channels[i];
      var selected = (ch.index === msgChannel);
      if (selected) {
        g.setColor(0.15, 0.35, 0.15);
        g.fillRect(2, y - 2, SCREEN_W - 3, y + rowH);
        g.setColor(1, 1, 1);
      }
      var label = ch.index + ": " + getChannelDisplayName(ch);
      setChannelColor(ch.index);
      g.drawString(label, 4, y);
      g.setColor(1, 1, 1);
      y += rowH;
    }
  }
  g.setColor(0, 0, 0);
  g.fillRect(0, BUTTON_TOP, SCREEN_W - 1, SCREEN_H - 1);
  g.setColor(0.30, 0.30, 0.30);
  g.drawLine(0, BUTTON_TOP, SCREEN_W - 1, BUTTON_TOP);
  g.setFontAlign(0, 0);
  g.setColor(1, 1, 1);
  g.drawString("BACK", 88, 151);
  g.setFontAlign(-1, -1);
  g.flip();
}

// MAIN SCREEN
function drawScreen() {
  if (currentScreen === "chat") { drawChatScreen(); return; }
  if (currentScreen === "keyboard") { drawKeyboardScreen(); return; }
  if (currentScreen === "channelSelect") { drawChannelSelectScreen(); return; }
  clearScreen();
  drawHeader();
  drawNodeList();
  drawBottomButtons();
  g.flip();
}

// STATUS SCREEN
function drawStatus(title, line1, line2) {
  clearScreen();
  g.setColor(1, 1, 1);
  g.setFont("4x6", 2);
  g.setFontAlign(0, 0);
  g.drawString(title, 88, 55);
  if (line1) g.drawString(line1, 88, 76);
  if (line2) g.drawString(line2, 88, 90);
  g.setFontAlign(-1, -1);
  g.flip();
}

function addChatMessage(num, text, time, channel) {

  var newMsg = {
    num: num,
    text: text,
    time: time,
    channel: channel || 0
  };

  if (chatScrollOffset > 0) {
    chatScrollOffset += wrapText(formatChatMessageText(newMsg), CHAT_MAX_CHARS).length;
  }

  chatMessages.push(newMsg);

  while (chatMessages.length > MAX_CHAT_MESSAGES) {

    var removed = chatMessages.shift();

    if (chatScrollOffset > 0) {
      chatScrollOffset -= wrapText(formatChatMessageText(removed), CHAT_MAX_CHARS).length;
      if (chatScrollOffset < 0) chatScrollOffset = 0;
    }
  }

  chatLinesCacheDirty = true;   // <-- new

  if (currentScreen === "chat") drawScreen();
}

// PARSE TELEMETRY
// Only unwraps the device_metrics variant (field 2).
function parseTelemetry(data) {
  var fields = decodeProtobuf(data);
  var f = getField(fields, 2);
  if (f && f.wire === 2) return f.value;
  return null;
}

// PARSE MESH PACKET
function parseMeshPacket(data) {
  var fields = decodeProtobuf(data);
  var result = {
    from: null,
    decoded: null,
    rxTime: 0,
    channel: 0
  };
  var f = getField(fields, 1);
  if (f && f.wire === 5) result.from = f.value;
  f = getField(fields, 3);
  if (f && f.wire === 0) result.channel = f.value;
  f = getField(fields, 4);
  if (f && f.wire === 2) result.decoded = f.value;
  f = getField(fields, 7);
  if (f && f.wire === 5) result.rxTime = f.value;
  return result;
}

// PARSE DATA
function parseData(data) {
  var fields = decodeProtobuf(data);
  var result = { portnum: null, payload: null };
  var f = getField(fields, 1);
  if (f && f.wire === 0) result.portnum = f.value;
  f = getField(fields, 2);
  if (f && f.wire === 2) result.payload = f.value;
  return result;
}

// Touch a node without replacing its known shortname.
function touchNodeHeard(num, lastHeard) {
  if (num === null || num === undefined) return;
  if (myNodeNum !== null && num === myNodeNum) return;
  if (pendingOwnNode && num === pendingOwnNode.num) return;
  var existing = -1;
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].num === num) { existing = i; break; }
  }
  var entry;
  if (existing >= 0) {
    entry = nodes[existing];
    nodes.splice(existing, 1);
    if (lastHeard) entry.lastHeard = lastHeard;
  } else {
    entry = {
      num: num,
      longName: "",
      lastHeard: lastHeard || 0
    };
  }
  nodes.unshift(entry);
  while (nodes.length > 10) nodes.pop();
  drawScreen();
}

// PROTOBUF ENCODER
function writeVarintValue(value) {
  var bytes = [];
  value = value >>> 0;
  while (value >= 0x80) {
    bytes.push((value & 0x7f) | 0x80);
    value = Math.floor(value / 128);
  }
  bytes.push(value & 0x7f);
  return bytes;
}

function writeTagBytes(fieldNumber, wireType) { return writeVarintValue((fieldNumber * 8) + wireType); }

function writeFixed32Bytes(value) {
  value = value >>> 0;
  return [
    value & 0xff,
    (value >>> 8) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 24) & 0xff
  ];
}

function writeVarintField(fieldNumber, value) { return writeTagBytes(fieldNumber, 0).concat(writeVarintValue(value)); }
function writeFixed32Field(fieldNumber, value) { return writeTagBytes(fieldNumber, 5).concat(writeFixed32Bytes(value)); }

function writeLengthDelimitedField(fieldNumber, byteArray) {
  return writeTagBytes(fieldNumber, 2)
    .concat(writeVarintValue(byteArray.length))
    .concat(byteArray);
}

function utf8EncodeBytes(str) {
  var bytes = [];
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) {
      bytes.push(0xC0 | (c >> 6));
      bytes.push(0x80 | (c & 0x3F));
    } else {
      bytes.push(0xE0 | (c >> 12));
      bytes.push(0x80 | ((c >> 6) & 0x3F));
      bytes.push(0x80 | (c & 0x3F));
    }
  }
  return bytes;
}

function generatePacketId() {
  var id = Math.floor(Math.random() * 0xFFFFFFFF);
  if (id === 0) id = 1;
  return id >>> 0;
}

function buildTextMessageToRadio(text, channel, hopLimit) {
  var payloadBytes = utf8EncodeBytes(text);
  var dataBytes = [];
  dataBytes = dataBytes.concat(writeVarintField(1, PORTNUM_TEXT_MESSAGE_APP));      // portnum
  dataBytes = dataBytes.concat(writeLengthDelimitedField(2, payloadBytes));          // payload
  var packetBytes = [];
  packetBytes = packetBytes.concat(writeFixed32Field(2, 0xFFFFFFFF));                // to: broadcast
  packetBytes = packetBytes.concat(writeVarintField(3, channel));                    // channel  <-- new
  packetBytes = packetBytes.concat(writeFixed32Field(6, generatePacketId()));         // id
  packetBytes = packetBytes.concat(writeVarintField(9, hopLimit));                    // hop_limit <-- new
  packetBytes = packetBytes.concat(writeLengthDelimitedField(4, dataBytes));          // decoded
  var toRadioBytes = [];
  toRadioBytes = toRadioBytes.concat(writeLengthDelimitedField(1, packetBytes));      // packet
  return toRadioBytes;
}

function sendTextMessage(text, channel, hopLimit) {
  if (!connected || !toRadio) return;
  channel = (channel === undefined) ? 0 : channel;
  hopLimit = (hopLimit === undefined) ? DEFAULT_HOP_LIMIT : hopLimit;
  var bytes = buildTextMessageToRadio(text, channel, hopLimit);
  toRadio.writeValue(new Uint8Array(bytes))
    .then(function() {
      addChatMessage(
        myNodeNum,
        text,
        Math.floor(Date.now() / 1000),
        channel
      );
    })
    .catch(function(e) {});
}

// PROTOBUF READER
function readVarint(data, pos) {
  var value = 0;
  var mult = 1;
  var byteCount = 0;
  while (pos.i < data.length) {
    var b = data[pos.i++];
    byteCount++;
    // Ignore high varint bytes beyond the low 32 bits.
    if (byteCount <= 5) {
      value += (b & 0x7f) * mult;
      mult *= 128;
    }
    if ((b & 0x80) === 0) return value % 4294967296;
    if (byteCount >= 10) throw new Error("Varint too large");
  }
  throw new Error("Truncated varint");
}

function readFixed32(data, pos) {
  if (pos.i + 4 > data.length) throw new Error("Truncated fixed32");
  var v =
    data[pos.i] |
    (data[pos.i + 1] << 8) |
    (data[pos.i + 2] << 16) |
    (data[pos.i + 3] * 16777216);
  pos.i += 4;
  return v >>> 0;
}

function readBytes(data, pos, length) {
  if (pos.i + length > data.length) throw new Error("Truncated bytes");
  var out = data.slice(pos.i, pos.i + length);
  pos.i += length;
  return out;
}

function decodeProtobuf(data) {
  var fields = [];
  var pos = { i: 0 };
  while (pos.i < data.length) {
    var tag = readVarint(data, pos);
    var field = Math.floor(tag / 8);
    var wire = tag & 7;
    var value;
    if (wire === 0) value = readVarint(data, pos);
      else if (wire === 1) value = readBytes(data, pos, 8);
      else if (wire === 2) {
      var len = readVarint(data, pos);
      var remaining = data.length - pos.i;
      if (len > remaining) len = remaining;
      value = readBytes(data, pos, len);
    } else if (wire === 5) value = readFixed32(data, pos);
    else throw new Error("Unsupported protobuf wire type " + wire);

    fields.push({
      field: field,
      wire: wire,
      value: value
    });
  }

  return fields;
}

function getField(fields, number) {
  for (var i = 0; i < fields.length; i++) {
    if (fields[i].field === number) return fields[i];
  }
  return null;
}

// PARSE USER
function parseUser(data) {
  var fields = decodeProtobuf(data);
  var result = {
    id: null,
    longName: null
  };

  var f = getField(fields, 1);
  if (f && f.wire === 2) result.id = utf8Decode(f.value);
  f = getField(fields, 2);
  if (f && f.wire === 2) result.longName = utf8Decode(f.value);

  return result;
}

// PARSE DEVICE METRICS
function parseDeviceMetrics(data) {
  var fields = decodeProtobuf(data);
  var result = {
    batteryLevel: null,
    voltage: null
  };

  var f = getField(fields, 1);
  if (f && f.wire === 0) result.batteryLevel = f.value;
  f = getField(fields, 2);
  if (f && f.wire === 5) {
    var buffer = new ArrayBuffer(4);
    var view = new DataView(buffer);
    view.setUint32(0, f.value >>> 0, true);
    result.voltage = view.getFloat32(0, true);
  }
  return result;
}

function parseNodeInfo(data) {
  var fields = decodeProtobuf(data);
  var node = {
    num: null,
    longName: null,
    lastHeard: 0,
    voltage: null
  };
  var f = getField(fields, 1);
  if (f && f.wire === 0) node.num = f.value;

  f = getField(fields, 2);
  if (f && f.wire === 2) {
    try {
      var user = parseUser(f.value);
      node.longName = user.longName;
    } catch (e) {
      console.log("parseNodeInfo: User field decode failed -", e);
    }
  }

  // NodeInfo.last_heard is fixed32, so it arrives as wire type 5.
  f = getField(fields, 5);
  if (f && f.wire === 5) node.lastHeard = f.value;

  f = getField(fields, 6);
  if (f && f.wire === 2) {
    try {
      var metrics = parseDeviceMetrics(f.value);
      node.voltage = metrics.voltage;
    } catch (e) {
      console.log("parseNodeInfo: DeviceMetrics field decode failed -", e);
    }
  }
  return node;
}

// CHANNEL SETUP
function parseChannel(data) {
  var fields = decodeProtobuf(data);
  var result = {
    index: 0,
    name: "",
    role: 0
  };
  var f;
  f = getField(fields, 1);
  if (f && f.wire === 0) {
    result.index = f.value;
  }
  f = getField(fields, 2);
  if (f && f.wire === 2) {
    var settingsFields = decodeProtobuf(f.value);
    var nf = getField(settingsFields, 3);
    if (nf && nf.wire === 2) {
      result.name = utf8Decode(nf.value);
    }
  }

  f = getField(fields, 3);
  if (f && f.wire === 0) {
    result.role = f.value;
  }
  return result;
}


function getChannelDisplayName(ch) {
  if (ch.name && ch.name.length > 0) {
    return ch.name;
  }
  return (ch.role === 1) ? "Default" : ("Ch " + ch.index);
}

// PARSE MY NODE INFO
function parseMyNodeInfo(data) {
  var fields = decodeProtobuf(data);
  var f = getField(fields, 1);

  if (f && f.wire === 0) return f.value;
  return null;
}

// RADIO INFORMATION
var pendingOwnNode = null;

function updateRadioFromNode(node) {
  if (!node) return;
  if (node.longName !== null && node.longName !== undefined) radioLongName = node.longName;
  if (node.voltage !== null && isFinite(node.voltage)) radioVoltage = node.voltage;
}

function processOwnNode(node) {
  updateRadioFromNode(node);
  pendingOwnNode = node;
  removeOwnNode();
  drawScreen();
}

// INSERT / UPDATE NODE
function updateNode(node) {
  if (node.num === null) return;

  if (myNodeNum !== null && node.num === myNodeNum) {
    processOwnNode(node);
    return;
  }

  if (pendingOwnNode && node.num === pendingOwnNode.num) {
    processOwnNode(node);
    return;
  }

  var existing = -1;

  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].num === node.num) { existing = i; break; }
  }

  if (existing >= 0) nodes.splice(existing, 1);

  nodes.unshift({
    num: node.num,
    longName: node.longName || "",
    lastHeard: node.lastHeard || 0
  });

  while (nodes.length > 10) nodes.pop();

  drawScreen();
}

// REMOVE OUR OWN NODE
function removeOwnNode() {
  if (myNodeNum === null) return;

  for (var i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].num === myNodeNum) nodes.splice(i, 1);
  }
}

// PARSE FROMRADIO
function parseFromRadio(data) {
  var fields;
  try {
    fields = decodeProtobuf(data);
  } catch (e) {
    console.log("parseFromRadio: outer decode failed -", e);
    return;
  }

  for (var i = 0; i < fields.length; i++) {
    var f = fields[i];

    // MyNodeInfo
    if (f.field === 3 && f.wire === 2) {
      try {
        var n = parseMyNodeInfo(f.value);
        if (n !== null) {
          myNodeNum = n;
          if (pendingOwnNode && pendingOwnNode.num === myNodeNum) {
            updateRadioFromNode(pendingOwnNode);
            pendingOwnNode = null;
          }
          removeOwnNode();
          drawScreen();
        }
      } catch (e) {
        console.log("parseFromRadio: MyNodeInfo decode failed -", e);
      }
      continue;
    }

    // MeshPacket
    if (f.field === 2 && f.wire === 2) {
      try {
        var mp = parseMeshPacket(f.value);
        var heardTime = Math.floor(Date.now() / 1000);

        if (mp.from !== null && mp.decoded) {

          try {
            var d = parseData(mp.decoded);

            if (d.portnum === PORTNUM_NODEINFO_APP && d.payload) {
              var u = parseUser(d.payload);
              updateNode({
                num: mp.from,
                longName: u.longName,
                lastHeard: heardTime
              });

            } else if (d.portnum === PORTNUM_TELEMETRY_APP && d.payload) {
              var dmBytes = parseTelemetry(d.payload);
              if (dmBytes && mp.from === myNodeNum) {
                var metrics = parseDeviceMetrics(dmBytes);
                updateRadioFromNode({ voltage: metrics.voltage });
                drawScreen();
              } else {
                touchNodeHeard(mp.from, heardTime);
              }

            } else if (d.portnum === PORTNUM_TEXT_MESSAGE_APP && d.payload) {
              var text = utf8Decode(d.payload); 
              addChatMessage(mp.from, text, heardTime, mp.channel);
              touchNodeHeard(mp.from, heardTime);
              Bangle.buzz(100); 
            } else if (d.portnum !== null) {
              touchNodeHeard(mp.from, heardTime);
            }

          } catch (e) {
            console.log("parseFromRadio: Data decode failed -", e);
          }

        } else if (mp.from !== null) {
          touchNodeHeard(mp.from, heardTime);
        }

      } catch (e) {
        console.log("parseFromRadio: MeshPacket decode failed -", e);
      }
      continue;
    }

    // NodeInfo
    if (f.field === 4 && f.wire === 2) {
      try {
        var node = parseNodeInfo(f.value);
        if (myNodeNum !== null && node.num === myNodeNum) {
          processOwnNode(node);
        } else {
          updateNode(node);
        }
      } catch (e) {
        console.log("parseFromRadio: NodeInfo decode failed -", e);
      }
      continue;
    }

    // Channel
    if (f.field === 10 && f.wire === 2) {
      try {
        var ch = parseChannel(f.value);
        if (ch.role !== 0) {
          for (var ci = channels.length - 1; ci >= 0; ci--) {
            if (channels[ci].index === ch.index) {
              channels.splice(ci, 1);
            }
          }
          channels.push(ch);
          channels.sort(function(a, b) { return a.index - b.index; });
        }
      } catch (e) {
        console.log("parseFromRadio: Channel decode failed -", e);
      }
      continue;
    }

    if (f.field === 7 && f.wire === 0) continue;
  }
}

// DRAIN FROMRADIO
function drainFromRadio() {
  if (!connected || !fromRadio || draining) return;
  draining = true;
  function readNext() {
    if (!connected) { draining = false; return; }
    fromRadio
      .readValue()
      .then(function(value) {
        var data = new Uint8Array(value.buffer);
        if (data.length === 0) { draining = false; return; }
        parseFromRadio(data);
        // Give Espruino's BLE queue a moment before another read.
        return new Promise(function(resolve) { setTimeout(resolve, 10); });
      })
      .then(function() { if (draining && connected) readNext(); })
      .catch(function(e) { draining = false; });
  }
  readNext();
}

// WANT CONFIG
function makeWantConfig(id) {
  var bytes = [];
  bytes.push(0x18);
  while (id >= 128) { bytes.push((id & 0x7f) | 0x80); id = Math.floor(id / 128); }
  bytes.push(id);
  return new Uint8Array(bytes);
}

// CONNECT
function connectDevice(d) {
  device = d;
  var deviceId = device.id || "unknown";
  connecting = true;
  drawStatus( "MESHTASTIC", "Connecting...", deviceId.split(" ")[0] );
  return device.gatt
    .connect({
      minInterval: 7.5,
      maxInterval: 15
    })
    .then(function(server) {
      connected = true;
      connecting = false;
      device.on("gattserverdisconnected", handleDisconnect);
      return server.getPrimaryService(SERVICE);
    })
    .then(function(service) {
      return service
        .getCharacteristic(FROMRADIO)
        .then(function(c) {
          fromRadio = c;
          return service.getCharacteristic(TORADIO);
        })
        .then(function(c) {
          toRadio = c;
          return service.getCharacteristic(FROMNUM);
        })
        .then(function(c) { fromNum = c; });
    })
    .then(function() { return fromNum.startNotifications(); })
    .then(function() {
      fromNum.on("characteristicvaluechanged", function() { drainFromRadio(); });
      // Reset radio/node state.
      radioLongName = "---";
      radioVoltage = null;
      myNodeNum = null;
      pendingOwnNode = null;
      nodes = [];
      channels = [];
      drawScreen();
      return toRadio.writeValue(makeWantConfig(configRequestId));
    })
    .then(function() { drawScreen(); setTimeout(drainFromRadio, 100); })
    .catch(function(e) {
      connected = false;
      connecting = false;
      drawStatus( "CONNECTION ERROR", String(e), "Scanning again..." );
      setTimeout(startScan, 1500);
      throw e;
    });
}

// DISCONNECT
function handleDisconnect(reason) {
  connected = false;
  connecting = false;
  fromRadio = null;
  toRadio = null;
  fromNum = null;
  draining = false;
  drawStatus( "DISCONNECTED", "Reason: " + reason, "Scanning again..." );
  setTimeout(startScan, 1500);
}

// SCAN
function startScan() {
  if (scanInProgress || connected) { return; }
  scanInProgress = true;
  drawStatus( "MESHTASTIC", "Scanning...", "Looking for radio" );
  NRF.findDevices(
    function(devices) {
      scanInProgress = false;
      var matches = [];
      for (var i = 0; i < devices.length; i++) {
        var d = devices[i];
        if (!d.services) continue;
        for (var j = 0; j < d.services.length; j++) {
          if (String(d.services[j]).toLowerCase() === SERVICE.toLowerCase())
          { matches.push(d); break; }
        }
      }
      if (matches.length === 0) {
        drawStatus( "MESHTASTIC", "No radio found", "Scanning again..." );
        setTimeout(startScan, 3000);
        return;
      }
      matches.sort(function(a, b) { return (b.rssi || -999) - (a.rssi || -999); });
      connectDevice(matches[0]);
    },
    {
      timeout: 3000,
      active: false
    }
  );
}

// TOUCH
Bangle.on("touch", function(zone, e) {
  if (!e) return;
    if (currentScreen === "keyboard") {

      if (e.y >= BUTTON_TOP) {

        if (e.x < 88) {

          if (sendHoldTimer) {
            clearTimeout(sendHoldTimer);
            sendHoldTimer = null;
          }

          sendHoldStatus = false;
          keyboardText = "";
          currentScreen = "chat";
          drawScreen();
        }
        return;
      }
    var keys = buildKeyboardKeys();
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (
        e.x >= key.x &&
        e.x < key.x + key.w &&
        e.y >= key.y &&
        e.y < key.y + key.h
      ) {
        handleKeyboardAction(key);
        break;
      }
    }
    return;
  }
  if (currentScreen === "chat") {
    if (e.y >= BUTTON_TOP) {
      if (e.x < 88) {
          keyboardText = "";
          keyboardShift = false;
          keyboardLayer = 0;
          if (sendHoldTimer) { clearTimeout(sendHoldTimer); sendHoldTimer = null; }
          sendHoldStatus = false;
          currentScreen = "keyboard";
          drawScreen();
      } else {
        currentScreen = "main";
        drawScreen();
      }
    }
    return;
  }
  if (currentScreen === "channelSelect") {

    if (e.y >= BUTTON_TOP) {
      currentScreen = "main";
      drawScreen();
      return;
    }
    var rowH = 20;
    var top = LIST_TOP + 4;
    for (var i = 0; i < channels.length; i++) {
      var rowTop = top + i * rowH - 2;
      var rowBottom = rowTop + rowH;
      if (e.y >= rowTop && e.y < rowBottom) {
        msgChannel = channels[i].index;
        //currentScreen = "main";
        drawScreen();
        return;
      }
    }
    return;
  }
  // Main screen
  if (e.y >= BUTTON_TOP && e.x < 88) {
    currentScreen = "chat";
    chatScrollOffset = 0;
    drawScreen();
    return;
  }
  if (e.y >= BUTTON_TOP && e.x >= 88) {
    currentScreen = "channelSelect";
    drawScreen();
    return;
  }
});

Bangle.on('drag', function(e) {

  if (currentScreen === "keyboard") {

    var inSendZone =
      e.y >= BUTTON_TOP &&
      e.x >= 88;

    if (e.b) {

      if (inSendZone && !sendHoldTimer) {

        sendHoldStatus = true;
        drawScreen();

        sendHoldTimer = setTimeout(function() {

          sendHoldTimer = null;
          sendHoldStatus = false;

          if (keyboardText.length > 0) {
            sendTextMessage(keyboardText, msgChannel, DEFAULT_HOP_LIMIT);
          }

          keyboardText = "";
          currentScreen = "chat";
          drawScreen();

        }, 3000);
      }

    } else {

      if (sendHoldTimer) {
        clearTimeout(sendHoldTimer);
        sendHoldTimer = null;
      }

      if (sendHoldStatus) {
        sendHoldStatus = false;
        drawScreen();
      }
    }

    return;
  }

  if (currentScreen === "chat") {

    if (e.y > HEADER_H && e.y < BUTTON_TOP) {

      chatDragAccum -= e.dy;

      var lineH2 = 8;
      var prevOffset = chatScrollOffset;

      while (chatDragAccum <= -lineH2) {
        chatScrollOffset++;
        chatDragAccum += lineH2;
      }

      while (chatDragAccum >= lineH2) {
        chatScrollOffset--;
        chatDragAccum -= lineH2;
      }

      if (chatScrollOffset < 0) chatScrollOffset = 0;

      if (chatScrollOffset !== prevOffset) {
        drawScreen();
      }
    }

    if (!e.b) {
      chatDragAccum = 0;
    }

    return;
  }
});

// PERIODIC DISPLAY REFRESH
// Updates "12s", "2m", etc. without BLE traffic.
setInterval(function() { if (connected) drawScreen(); }, 10000);

E.on('kill', function() {
  if (NRF.getSecurityStatus().connected) NRF.disconnect();
  NRF.setAdvertising({}, {uart:true});
  load();
});

// START APPLICATION
startScan();