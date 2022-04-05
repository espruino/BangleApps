/* Detects if we're running under Gadgetbridge in a WebView, and if
so it overwrites the 'Puck' library with a special one that calls back
into Gadgetbridge to handle watch communications */

/*// test code
Android = {
  bangleTx : function(data) {
    console.log("TX : "+JSON.stringify(data));
  }
};*/

if (typeof Android!=="undefined") {
  console.log("Running under Gadgetbridge, overwrite Puck library");

  var isBusy = false;
  var queue = [];
  var connection = {
    cb : function(data) {},
    write : function(data, writecb) {
      Android.bangleTx(data);  
      Puck.writeProgress(data.length, data.length);
      if (writecb) setTimeout(writecb,10);
    },
    close : function() {},
    received : "", 
    hadData : false
  }

  function bangleRx(data) { 
//    document.getElementById("status").innerText = "RX:"+data;
    connection.received += data;
    connection.hadData = true;
    if (connection.cb)  connection.cb(data);
  } 

  function log(level, s) {
    if (Puck.log) Puck.log(level, s);
  }

  function handleQueue() {
    if (!queue.length) return;
    var q = queue.shift();
    log(3,"Executing "+JSON.stringify(q)+" from queue");
    if (q.type == "write") Puck.write(q.data, q.callback, q.callbackNewline);
    else log(1,"Unknown queue item "+JSON.stringify(q));
  }

 /* convenience function... Write data, call the callback with data:
       callbackNewline = false => if no new data received for ~0.2 sec
       callbackNewline = true => after a newline */
  function write(data, callback, callbackNewline) {
    let result;
    /// If there wasn't a callback function, then promisify
    if (typeof callback !== 'function') {
      callbackNewline = callback;

      result = new Promise((resolve, reject) => callback = (value, err) => {
        if (err) reject(err);
        else resolve(value);
      });
    }

    if (isBusy) {
      log(3, "Busy - adding Puck.write to queue");
      queue.push({type:"write", data:data, callback:callback, callbackNewline:callbackNewline});
      return result;
    }

    var cbTimeout;
    function onWritten() {
      if (callbackNewline) {
        connection.cb = function(d) {
          var newLineIdx = connection.received.indexOf("\n");
          if (newLineIdx>=0) {
            var l = connection.received.substr(0,newLineIdx);
            connection.received = connection.received.substr(newLineIdx+1);
            connection.cb = undefined;
            if (cbTimeout) clearTimeout(cbTimeout);
            cbTimeout = undefined;
            if (callback)
              callback(l);
            isBusy = false;
            handleQueue();
          }
        };
      }
      // wait for any received data if we have a callback...
      var maxTime = 300; // 30 sec - Max time we wait in total, even if getting data
      var dataWaitTime = callbackNewline ? 100/*10 sec if waiting for newline*/ : 3/*300ms*/;
      var maxDataTime = dataWaitTime; // max time we wait after having received data
      cbTimeout = setTimeout(function timeout() {
        cbTimeout = undefined;
        if (maxTime) maxTime--;
        if (maxDataTime) maxDataTime--;
        if (connection.hadData) maxDataTime=dataWaitTime;
        if (maxDataTime && maxTime) {
          cbTimeout = setTimeout(timeout, 100);
        } else {
          connection.cb = undefined;
          if (callback)
            callback(connection.received);
          isBusy = false;
          handleQueue();
          connection.received = "";
        }
        connection.hadData = false;
      }, 100);
    }

    if (!connection.txInProgress) connection.received = "";
    isBusy = true;
    connection.write(data, onWritten);
    return result
  }

  // ----------------------------------------------------------

  Puck = {
    /// Are we writing debug information? 0 is no, 1 is some, 2 is more, 3 is all.
    debug : Puck.debug,
    /// Should we use flow control? Default is true
    flowControl : true,
    /// Used internally to write log information - you can replace this with your own function
    log : function(level, s) { if (level <= this.debug) console.log("<BLE> "+s)},
    /// Called with the current send progress or undefined when done - you can replace this with your own function
    writeProgress : Puck.writeProgress,
    connect : function(callback) {
      setTimeout(callback, 10);
    },
    write : write,
    eval : function(expr, cb) {
      const response = write('\x10Bluetooth.println(JSON.stringify(' + expr + '))\n', true)
        .then(function (d) {
          try {
            return JSON.parse(d);
          } catch (e) {
            log(1, "Unable to decode " + JSON.stringify(d) + ", got " + e.toString());
            return Promise.reject(d);
          }
        });
      if (cb) {
        return void response.then(cb, (err) => cb(null, err));
      } else {
        return response;
      }
    },
    isConnected : function() { return true;  },
    getConnection : function() {  return connection; },
    close : function() {
      if (connection)
        connection.close();
    },
  };
  // no need for header 
  document.getElementsByTagName("header")[0].style="display:none";
  // force connection attempt automatically
  setTimeout(function() {
   getInstalledApps(true).catch(err => {
      showToast("Device connection failed, "+err,"error");
    });
  }, 100);
}
