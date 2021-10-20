var device;
var gatt;
var service;
var characteristic;

// on/off commands
// Channel 1 ON:  A00101A2 
// Channel 1 OFF: A00100A1
// Channel 2 ON:  A00201A3
// Channel 2 OFF: A00200A2
// Channel 3 ON:  A00301A4
// Channel 3 OFF: A00300A3
// Channel 4 ON:  A00401A5
// Channel 4 OFF: A00400A4

var cmds = [{ on:  new Uint8Array([0xa0, 0x01, 0x01, 0xa2]),
              off: new Uint8Array([0xa0, 0x01, 0x00, 0xa1]) },
            { on:  new Uint8Array([0xa0, 0x02, 0x01, 0xa3]),
              off: new Uint8Array([0xa0, 0x02, 0x00, 0xa2]) },
            { on:  new Uint8Array([0xa0, 0x03, 0x01, 0xa4]),
              off: new Uint8Array([0xa0, 0x03, 0x00, 0xa3]) },
            { on:  new Uint8Array([0xa0, 0x04, 0x01, 0xa5]),
              off: new Uint8Array([0xa0, 0x04, 0x00, 0xa4]) }];

const button_w = 100;
const button_h = 36;
const button_r = button_h/2-4;
const button_sp = 46;

var n_channels = 4;
var channel = 0;
var channel_state = [];

function drawButton(x, y, state) {
  if (state) g.setColor(0.2, 0.2, 0.95);
  else g.setColor(0.5, 0.5, 0.5);
  g.fillCircle(x+button_h/2, y+button_h/2, button_h/2).
    fillRect(x+button_h/2, y, x+button_w-button_h/2, y+button_h).
    fillCircle(x+button_w-button_h/2, y+button_h/2, button_h/2);
  g.setColor(0.85, 0.85, 0.85);
  if (state) 
    g.fillCircle(x+button_w-button_h/2, y+button_h/2, button_r);
  else
    g.fillCircle(x+button_h/2, y+button_h/2, button_r);
  g.flip();
}

function setup_screen() {
  g.clearRect(0, 60, g.getWidth()-1, g.getHeight()-1);
  for (var i=0; i<4; ++i) {
    g.setFontVector(22).setFontAlign(-1, 0, 0).setColor(0xffff).drawString("Ch"+String(i+1), 16, 60+i*button_sp+button_h/2);
    drawButton((g.getWidth()-button_w)/2, 60+i*button_sp, channel_state[i]);
  }
  moveChannelFrame(channel, channel);
}

function parseDevice(d) {
  device = d;
  g.clearRect(0, 60, 239, 239).setFontAlign(0, 0, 0).setColor(0, 1, 0).drawString("Found device", 120, 120).flip();
  device.gatt.connect().then(function(ga) {
  gatt = ga;
  g.clearRect(0, 60, 239, 239).setFontAlign(0, 0, 0).setColor(0, 1, 0).drawString("Connected", 120, 120).flip();
  return gatt.getPrimaryService("FFE0");
}).then(function(s) {
  service = s;
  return service.getCharacteristic("FFE1");
}).then(function(c) {
  characteristic = c;
  console.log(c);
  return;
}).then(function() {
  console.log("Done!");
  g.clearRect(0, 60, 239, 239).setColor(1, 1, 1).flip();
  setup_app();
}).catch(function(e) {
  g.clearRect(0, 60, 239, 239).setColor(1, 0, 0).setFontAlign(0, 0, 0).drawString("ERROR"+e, 120, 120).flip();
  console.log(e);
})}

function connection_setup() {
  NRF.setScan();
  NRF.setScan(parseDevice, { filters: [{services:["FFE0"]}], timeout: 2000});
  g.clearRect(0, 60, 239, 239).setFontVector(18).setFontAlign(0, 0, 0).setColor(0, 1, 0);
  g.drawString("Scanning for relay...", 120, 120);
}

function moveChannelFrame(oldc, newc) {
  g.setColor(0).drawRect(8, 60+oldc*button_sp-4, g.getWidth()-8, 60+oldc*button_sp+button_h+4);
  g.setColor(0.9, 0.9, 0.9).drawRect(8, 60+newc*button_sp-4, g.getWidth()-8, 60+newc*button_sp+button_h+4);
}

function setup_app() {
  characteristic.readValue().then(function(r) {
    for (var i=0; i<r.buffer.length/4; ++i) channel_state.push(r.buffer[i*4+2]==1);
  }).then(setup_screen);
    
  Bangle.on('swipe', function(direction){
      switch(direction){
        case 1:
          drawButton((g.getWidth()-button_w)/2, 60+channel*button_sp, true);
          characteristic.writeValue(cmds[channel].on);
          break;
        case -1:
          drawButton((g.getWidth()-button_w)/2, 60+channel*button_sp, false);
          characteristic.writeValue(cmds[channel].off);
          break;
  }});
  setWatch(function() { var nc = channel-1; if (nc<0) nc = n_channels-1; moveChannelFrame(channel, nc); channel = nc; }, BTN1, {repeat:true, debounce:30});
  setWatch(function() { moveChannelFrame(channel, (channel+1)%n_channels); channel = (channel+1)%n_channels; }, BTN3, {repeat:true, debounce:30});
}


connection_setup();

Bangle.loadWidgets();
Bangle.drawWidgets();
