var uart; // require("ble_uart")
var device; // BluetoothDevice
var customCommand = "";
// Set up terminal
Bangle.loadWidgets();
var R = Bangle.appRect;
var termg = Graphics.createArrayBuffer(R.w, R.h, 1, {msb:true});
var termVisible = false;
termg.setFont("6x8");
let term = require("VT100").connect(termg, {
  charWidth : 6,
  charHeight : 8
});
term.print = str => {
  for (var i of str) term.char(i);
  if (termVisible) g.reset().drawImage(termg,R.x,R.y).setFont("6x8").setFontAlign(0,-1,1).drawString("MORE",R.w-1,(R.y+R.y2)/2);
};

function showConnectMenu() {
  termVisible = false;
  var m = { "" : {title:"Devices"} };
  E.showMessage("Scanning...");
    NRF.findDevices(devices => {
      devices.forEach(dev=>{
        m[dev.name||dev.id.substr(0,17)] = ()=>{
          connectTo(dev);
        };
      });
      m["< Back"] = () => showConnectMenu();
      E.showMenu(m);
    },{filters:[
        { namePrefix: 'Puck.js' },
        { namePrefix: 'Pixl.js' },
        { namePrefix: 'MDBT42Q' },
        { namePrefix: 'Bangle.js' },
        { namePrefix: 'Espruino' },
        { services: [ "6e400001-b5a3-f393-e0a9-e50e24dcca9e" ] }
      ],active:true,timeout:4000});
}

function showOptionsMenu() {
  if (!uart) showConnectMenu();
  termVisible = false;
  var menu = {"":{title:/*LANG*/"Options"},
    "< Back" : () => showTerminal(),
  };
  var json = require("Storage").readJSON("espruinoterm.json",1);
  if (Array.isArray(json)) {
    json.forEach(j => { menu[j.title] = () => sendCommand(j.cmd); });
  } else {
    Object.assign(menu,{
      "Version" : () => sendCommand("process.env.VERSION"),
      "Battery" : () => sendCommand("E.getBattery()"),
      "Flash LED" : () => sendCommand("LED.set();setTimeout(()=>LED.reset(),1000);")
    });
  }
  menu[/*LANG*/"Custom"] = () => { require("textinput").input({text:customCommand}).then(result => {
    customCommand = result;
    sendCommand(customCommand);
  })};
  menu[/*LANG*/"Disconnect"] = () => { showTerminal(); term.print("\r\nDisconnecting...\r\n"); uart.disconnect(); }

  E.showMenu(menu);
}

function showTerminal() {
  E.showMenu();
  Bangle.setUI({
    mode : "custom",
    btn : n=> { showOptionsMenu(); },
    touch : (n,e) => { if (n==2) showOptionsMenu(); }
  });
  termVisible = true;
  term.print(""); // redraw terminal
}

function sendCommand(cmd) {
  showTerminal();
  uart.write(cmd+"\n");
}

function connectTo(dev) {
  device = dev;
  showTerminal();
  term.print(`\r\nConnect to ${dev.name||dev.id.substr(0,17)}...\r\n`);
  device.on('gattserverdisconnected', function(reason) {
    term.print(`\r\nDISCONNECTED (${reason})\r\n`);
    uart = undefined;
    device = undefined;
    setTimeout(showConnectMenu, 1000);
  });
  require("ble_uart").connect(device).then(function(u) {
    uart = u;
    term.print("Connected...\r\n");
    uart.on('data', function(d) { term.print(d); });
  });
}

// now start
Bangle.drawWidgets();
showConnectMenu();
