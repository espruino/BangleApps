var emu, emuConnectedCallback;


window.addEventListener('message', function(e) {
  // emu can be undefined when emu window closed OR refreshed.
  var event = e.data;
  //if (typeof event!="object" || event.from!="emu") return;
  console.log("EMU HOST MESSAGE", event);
  switch (event.type) {
    case "init":
      console.log("EMU frame initialised");
      try {
        emu.addEventListener('unload', function(e) {
          console.log("EMU frame closed (unload handler called)");
          if (UART.getConnection())
            UART.getConnection().closeHandler();
        });
      } catch (e) {
        // Fails if cross-origin - not sure we can detect closure?
        console.log("Unable to emu.addEventListener('unload', ...)", e);
      }
      if (UART.getConnection())
          UART.getConnection().openHandler();
      if (emuConnectedCallback) { // actually the promise resolver for connections
        emuConnectedCallback(UART.getConnection());
        emuConnectedCallback = undefined;
      }
      break;
    case "tx": {
      var d = event.data;
      var a = new Uint8Array(d.length);
      for (var i=0;i<d.length;i++) a[i]=d.charCodeAt(i);
      if (UART.getConnection())
        UART.getConnection().rxDataHandler(a.buffer);
      break;
    }
    case "pagehide":
    case "unload": {
      console.log("EMU frame closed (event received)");
      if (UART.getConnection())
        UART.getConnection().closeHandler();
      break;
    }
  }
});

// Create an emulator window and connection, returns promise
function startEmulator() {

  function post(msg) {
    if (!emu) return;
    msg.for="emu";
    emu.postMessage(msg,"*");
  }

  UART.endpoints.push({
   name : "Emulator",
    description : "Bangle.js Emulator",
    svg : `
<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 26 26" width="48px" height="48px"><path d="M 3 1 C 1.34375 1 0 2.34375 0 4 L 0 18 C 0 19.65625 1.34375 21 3 21 L 10 21 L 10 22 L 16 22 L 16 21 L 23 21 C 24.65625 21 26 19.65625 26 18 L 26 4 C 26 2.34375 24.65625 1 23 1 Z M 3 3 L 23 3 C 23.550781 3 24 3.449219 24 4 L 24 18 C 24 18.550781 23.550781 19 23 19 L 3 19 C 2.449219 19 2 18.550781 2 18 L 2 4 C 2 3.449219 2.449219 3 3 3 Z M 8 5 C 6.34375 5 5 6.34375 5 8 L 5 14 C 5 15.65625 6.34375 17 8 17 L 18 17 C 19.65625 17 21 15.65625 21 14 L 21 8 C 21 6.34375 19.65625 5 18 5 Z M 7 8 L 19 8 L 19 14 C 19 14.550781 18.550781 15 18 15 L 8 15 C 7.449219 15 7 14.550781 7 14 Z M 6 23 C 5.019531 23 5 24 5 24 L 5 25 L 21 25 L 21 24 C 21 23.449219 20.550781 23 20 23 Z"/></svg>`,
    isSupported : function() { return true; },
    connect : function(connection, options) {
      options = options || {};
      connection.closeLowLevel = function(callback) {
        if (emu) emu.close();
        emu = undefined;
        window.emu = undefined;
      };
      connection.writeLowLevel = function(data, callback, alreadyRetried) {
        console.log("EMU sending", data);
        return new Promise((resolve, reject) => {
          post({type:"rx",data: data});
          if (callback) callback();
          resolve();
        });
      };

      connection.openHandler();
      return new Promise( resolve => {

        var emuDevice = {
          id : "BANGLEJS2",
          name : "Bangle.js 2",
          description : 'Bangle.js 2 Emulator',
          link : "https://www.espruino.com/Bangle.js2",
          emulatorURL : "/emu/emu_banglejs2.html",
          emulatorWin : "innerWidth=290,innerHeight=268,location=0"
        };

        var url;/* = window.location.pathname;
        if (url.includes("/"))
          url = url.substr(0,url.lastIndexOf("/"));*/
        if (window.location.hostname=="localhost")
          url = "http://localhost/ide" + emuDevice.emulatorURL; // development only
        else // otherwise use online IDE
          url = "https://www.espruino.com/ide" + emuDevice.emulatorURL;
        console.log("Opening Emulator",url);
        emuConnectedCallback = resolve;
        emu = window.emu = window.open(url, "banglewindow", emuDevice.emulatorWin);
        var inited = false;
        // when the window is loaded, post 'init'
        emu.addEventListener("load", function() {
          if (!inited) post({type:"init"});
          inited = true;
        }, false);
        // if load didn't fire (window was already loaded) then post init after a short delay
        setTimeout(function() {
          if (!inited) post({type:"init"});
          inited = true;
        }, 1000);
      });
    }
  });
  let oldPorts = UART.ports;
  UART.ports = ["Emulator"];
  let promise = Comms.getDeviceInfo();
  UART.ports = oldPorts;
  return promise;
}

// Create an emulator and factory reset it, returns promise
function startCleanEmulator() {
  return startOperation({name:"Start Emulator"}, () => {
    Progress.show({title:`Starting Emulator`, sticky:true});
    let promise;
    if (Comms.isConnected() && UART.getConnection().device!="Emulator")
      promise = Comms.disconnectDevice();
    else
      promise = Promise.resolve();
    if (!Comms.isConnected())
      promise = promise.then(() => startEmulator());
    promise = promise.then(() => Comms.write("Bangle.factoryReset()\n"));
    promise = promise.then(new Promise(resolve => setTimeout(resolve, 500)));
    return promise;
  });
}
