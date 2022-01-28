#!/usr/bin/nodejs
/* Simple Command-line app loader for Node.js
===============================================

NOTE: This needs the '@abandonware/noble' library to be installed.
However we don't want this in package.json (at least
as a normal dependency) because we want `sanitycheck.js`
to be able to run *quickly* in travis for every commit,
and we don't want NPM pulling in (and compiling native modules)
for Noble.
*/

var SETTINGS = {
  pretokenise : true
};
var APPSDIR = __dirname+"/../apps/";
var Utils = require("../core/js/utils.js");
var AppInfo = require("../core/js/appinfo.js");
var noble;
try {
  noble  = require('@abandonware/noble');
} catch (e) {}
if (!noble) try {
  noble  = require('noble');
} catch (e) { }
if (!noble) {
  console.log("You need to:")
  console.log("  npm install @abandonware/noble")
  console.log("or:")
  console.log("  npm install noble")
}

var apps = [];

function ERROR(msg) {
  console.error(msg);
  process.exit(1);
}

var apps = [];
var dirs = require("fs").readdirSync(APPSDIR, {withFileTypes: true});
dirs.forEach(dir => {
  var appsFile;
  if (dir.name.startsWith("_example") || !dir.isDirectory())
    return;
  try {
    appsFile = require("fs").readFileSync(APPSDIR+dir.name+"/metadata.json").toString();
  } catch (e) {
    ERROR(dir.name+"/metadata.json does not exist");
    return;
  }
  apps.push(JSON.parse(appsFile));
});

var args = process.argv;

if (args.length==3 && args[2]=="list") cmdListApps();
else if (args.length==3 && args[2]=="devices") cmdListDevices();
else if (args.length==4 && args[2]=="install") cmdInstallApp(args[3]);
else if (args.length==5 && args[2]=="install") cmdInstallApp(args[3], args[4]);
else {
  console.log(`apploader.js
-------------

USAGE:

apploader.js list
  - list available apps
apploader.js devices
  - list available device addresses
apploader.js install appname [de:vi:ce:ad:dr:es]
`);
process.exit(0);
}

function cmdListApps() {
  console.log(apps.map(a=>a.id).join("\n"));
}
function cmdListDevices() {
  var foundDevices = [];
  noble.on('discover', function(dev) {
    if (!dev.advertisement) return;
    if (!dev.advertisement.localName) return;
    var a = dev.address.toString();
    if (foundDevices.indexOf(a)>=0) return;
    foundDevices.push(a);
    console.log(a,dev.advertisement.localName);
  });
  noble.startScanning([], true);
  setTimeout(function() {
    console.log("Stopping scan");
    noble.stopScanning();
    setTimeout(function() {
      process.exit(0);
    }, 500);
  }, 4000);
}

function cmdInstallApp(appId, deviceAddress) {
  var app = apps.find(a=>a.id==appId);
  if (!app) ERROR(`App ${JSON.stringify(appId)} not found`);
  if (app.custom) ERROR(`App ${JSON.stringify(appId)} requires HTML customisation`);
  return AppInfo.getFiles(app, {
    fileGetter:function(url) {
      console.log(__dirname+"/"+url);
      return Promise.resolve(require("fs").readFileSync(__dirname+"/../"+url).toString("binary"));
    }, settings : SETTINGS}).then(files => {
    //console.log(files);
    var command = files.map(f=>f.cmd).join("\n")+"\n";
    bangleSend(command, deviceAddress).then(() => process.exit(0));
  });
}

function bangleSend(command, deviceAddress) {
  var log = function() {
    var args = [].slice.call(arguments);
    console.log("UART: "+args.join(" "));
  }
  //console.log("Sending",JSON.stringify(command));

  var RESET = true;
  var DEVICEADDRESS = "";
  if (deviceAddress!==undefined)
    DEVICEADDRESS = deviceAddress;

  var complete = false;
  var foundDevices = [];
  var flowControlPaused = false;
  var btDevice;
  var txCharacteristic;
  var rxCharacteristic;

  return new Promise((resolve,reject) => {
    function foundDevice(dev) {
      if (btDevice!==undefined) return;
      log("Connecting to "+dev.address);
      noble.stopScanning();
      connect(dev, function() {
        // Connected!
        function writeCode() {
          log("Writing code...");
          write(command, function() {
            complete = true;
            btDevice.disconnect();
          });
        }
        if (RESET) {
          setTimeout(function() {
            log("Resetting...");
            write("\x03\x10reset()\n", function() {
              setTimeout(writeCode, 1000);
            });
          }, 500);
        } else
          setTimeout(writeCode, 1000);
      });
    }

    function connect(dev, callback) {
      btDevice = dev;
      log("BT> Connecting");
      btDevice.on('disconnect', function() {
        log("Disconnected");
        setTimeout(function() {
          if (complete) resolve();
          else reject("Disconnected but not complete");
        }, 500);
      });
      btDevice.connect(function (error) {
        if (error) {
          log("BT> ERROR Connecting",error);
          btDevice = undefined;
          return;
        }
        log("BT> Connected");
        btDevice.discoverAllServicesAndCharacteristics(function(error, services, characteristics) {
          function findByUUID(list, uuid) {
            for (var i=0;i<list.length;i++)
              if (list[i].uuid==uuid) return list[i];
            return undefined;
          }

          var btUARTService = findByUUID(services, "6e400001b5a3f393e0a9e50e24dcca9e");
          txCharacteristic = findByUUID(characteristics, "6e400002b5a3f393e0a9e50e24dcca9e");
          rxCharacteristic = findByUUID(characteristics, "6e400003b5a3f393e0a9e50e24dcca9e");
          if (error || !btUARTService || !txCharacteristic || !rxCharacteristic) {
            log("BT> ERROR getting services/characteristics");
            log("Service "+btUARTService);
            log("TX "+txCharacteristic);
            log("RX "+rxCharacteristic);
            btDevice.disconnect();
            txCharacteristic = undefined;
            rxCharacteristic = undefined;
            btDevice = undefined;
            return openCallback();
          }

          rxCharacteristic.on('data', function (data) {
            var s = "";
            for (var i=0;i<data.length;i++) {
              var ch = data[i];
              if (ch==19) {
                log("XOFF");
                flowControlPaused = 200;
              } else if (ch==17) {
                log("XON");
                flowControlPaused = false;
              } else
                s+=String.fromCharCode(ch);
            }
            log("Received", JSON.stringify(s));
          });
          rxCharacteristic.subscribe(function() {
            callback();
          });
        });
      });
    };

    function write(data, callback) {
      var amt = 0;
      var total = data.length;
      var progress=0;

      function writeAgain() {
        if (flowControlPaused) {
          flowControlPaused--;
          if (flowControlPaused==0)
            log("TIMEOUT - sending");
          setTimeout(writeAgain,50);
          return;
        }
        if (!data.length) return callback();
        var d = data.substr(0,20);
        data = data.substr(20);
        var buf = new Buffer.alloc(d.length);
        progress++;
        if (progress>=10) {
          log("Writing "+amt+"/"+total);
          progress=0;
        }
        //log("Writing ",JSON.stringify(d));
        amt += d.length;
        for (var i = 0; i < buf.length; i++)
          buf.writeUInt8(d.charCodeAt(i), i);
        txCharacteristic.write(buf, false, writeAgain);
      }
      writeAgain();
    }

    function disconnect() {
      btDevice.disconnect();
    }

    log("Discovering...");
    noble.on('discover', function(dev) {
      if (!dev.advertisement) return;
      if (!dev.advertisement.localName) return;
      var a = dev.address.toString();
      if (foundDevices.indexOf(a)>=0) return;
      foundDevices.push(a);
      log("Found device: ",a,dev.advertisement.localName);
      if (a == DEVICEADDRESS)
        return foundDevice(dev);
      else if (DEVICEADDRESS=="" && dev.advertisement.localName.indexOf("Bangle.js")==0) {
        return foundDevice(dev);
      }
    });
    noble.startScanning([], true);
  });
}
