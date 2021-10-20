/*digitalWrite([D4,D6],1)
digitalWrite([D10,D11],1)*/

function drawBGBtn() {
  var c1 = g.setColor("#ff8100").getColor();
  var c2 = g.setColor("#6beaff").getColor();
  g.drawImage({
  width : 240, height : 240, bpp : 2,
  palette : new Uint16Array([0,c1,c2,0xFFFF]),
  buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4AngNVADFAHf47/Hf47/Hf47/Hf47/Hf47/Hf47/Hf47/Hdn/6oDBv/1AYNf/o76/472OYQ70HgNXAYNVAYY7/HdgARHf47jr6qBABPVHfX1Hf47/Hf47/Hf47/Hf47/Hf47/HY/9q44Fqo7yGAI6E/tVv47/Hf7vqHYrvBHeX/745DHAP3AgI7xGYV//o7BA4Y7yWwK3FHef/6tXHfIAGHf47/Hf47/Hf47/Hf47Pq/VFgoAJq53p/o7Pvo7pv4DCVQPVq4DBOIIDCAgK1EHctfFYQ7LB4Y7nGAI7CF4V/XgVfBYfVHdI4DF4d/H4Q7Cr7/FHcxwCHZSCDHdIwBUogAFYIIMFHcwuBUwqEFeIQ7qF4R4II5A7nWgLjFIwgKGHc5sBVAwABBIKCGHc4xCNoyBBfQ47oGRBEIHdK0CVQgHHHdZvCPAl/WRA7qWgJwDOwSyHHdQ1FOwP/CA47oOYQ2EXIZFBHdjlDWgX1XAi2HHcwuBGYn9A4S8DPAo7lFwPXNYR0COQYGBAIJIBHdFfWITnD/q7Be4Q+Bv47rFYNXHYI1CIIS6BB4TwEHcpnDGQhECBAZIDHdADFq/1IgY3CHeTtB/6sBG4g7qUwQ7DHQIABHe1f//9PIP1XAI7zOgY+BO97vEOwJxCPAPVHeTrDAAJ4BPIIFCHdfVHYboDegRCCr4KEHcorCGYj7EWoJLBHdSpBdAY7FIgKwBBYo7ldgbiEYAj5FHdAvCHQ6ECI4w7mF4LhEWo6+FHcwAUHf47/Hf47/Hf47/Hf47/Hf47/Hf47/Hf47/HcgA/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AEEC1WqwAd2hQcBAAOgDuhXCAAZbWDow8WDgoABDuSTELTAddDg5aVDrhYIeKjtGPC0qDpOoDtxYKSyYdLSyCyKDqRZMWiCUKDqRZMWiAcLWiIdcShg7faRyUMDqBZOaRzuMDqBZOeBwcNDp5ZOaRwcODtbQOeBwddaBw7f0A7cDtUqHduoHbgdqCQuv/47f//6A4o7R3//9QlIDqIAC1f//wdQgRVGHcKZGwA7PDISSGDqbUFLowdKhQZHHcIhF0A7PdwI7ieAo7QDALvKDqDVGeAodKlQYMHbJeI1A7OSBA7aaw47PdxgdQeBodPdxg7Wa44dOdxo7WMA4dKdyI7XbA47NCoQAIHaIcKMIg7NDpSWDHZrQDLJY7NDpiWCHZrQCLJg7/HazSCHZu/O/47/HamqHdItDHZrSLLIQ7NSpf+HaJaDA4YAGHZoAISgo7PLQY7kdwY7KDogWHHbZgHDp7wCRwg7bbATuEDp4XHHbZfHDp7wN0AdJhTuRLKDwMHaheIDqCQCHcLWFDqDwCZggAEwAdJgQUIEJA7QKoQ7hTIo7KDoyzLHa4dXeAI7JDhIABd5TuFHZYdGKwIlIHaqZBagwdR1ZVGAAWoDpcqCxG/TAwdVHbodk0AdLhQ7cDqA7dDruADpcCHbgdQDhYABLLgdQHbodNlQcN1Ad6aBgABhQ7cDpzQNgECLLgdODhrwPLJwdNShzSPDriUOaRxZQDpiUPaRpZQWhgcQDry0KLCKWLWSCWMWSAdfSxJYSSxYdTSxBYTPBLQSPBJ2UPBIdVLQwcVDo6UUDw4cXDryYCZqoAGhTOWAH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AjA="))
});
}

function drawBGAccel() {
  var c1 = g.setColor("#ff8100").getColor();
  var c2 = g.setColor("#6beaff").getColor();
  g.drawImage({
  width : 240, height : 240, bpp : 2,
  palette : new Uint16Array([0,c1,c2,0xFFFF]),
  buffer : require("heatshrink").decompress(atob("AH4A/AH4A/AH4A/AH4A/AH4AngNVADFAHf47/Hf47/Hf47/Hf47/Hf47/Hf47/Hf47/Hdn/6oDBv/1AYNf/o72G4Vf/47yOYQ74PANXAYNVAYY7/HdgARHf47jr6qBABP1Hf47/Hf47/Hf47/Hf47/Hf47/Hf47D/tXHAtVHeY0CAAQGBv47xGAI7/HeqzGd4I7y//fHIY4B+4EBHeIzCv/9HYIHDHeS2BW4o7z//Vq475AAw7/Hf47/Hf47/Hf47/HZ9X6osFABNXO9P9HZ99HdN/PASqB6tXAYJxBAYQEBWog7lr4rCHZYPDHc4wBHYQvCv68Cr4LDQ4Q7nHAYvDHY1ff4o7mGgQ7EPYQ7CQQY7pGAKlEAArBBBgo7mFwKmFQgrxCHdQvCPBBHIHc60BcYpGEBQw7nNgKoGAAIJBQQw7nGIRtGQIL6HHdAyIIhA7pWgSqEA447rN4R4Ev6yIHdS0BOAZ2CWQ47qGop2B/4QHHdBzCGwi5DIoI7scoa0C+q4EWw47mFwIzE/oHCXgZ4FHcouB+5rCWgRyDPYIBBJAI7or6xCc4f9HwL3CIoQ7rFwNXHYI1CIIS6BB4g7oM4YyEGgYICJAY7oAYtX+pEDG4Q7rNQQ7DdoP/Xgo/DHdw6BAAI72r///p5B+o71OgPVq4+BHd6vCAYJ2BdgLyC6o7v6rsEBIR4BPIIFCHdo0COwQABPoJCCr4KEHcorCGYj7EWoJLBHdR0BdAY7FIgP9BwILEHcrsDcQjAEfIo7oF4R2GQgZHGHcwvBcIi1HI4o7mACg7/Hf47/Hf47/Hf47/Hf47/Hf47/Hf47/Hf47kAH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ACECwA75hWgHfMq1A751Wqd3I7BeHEKHYLw4lQ7BeHA6BeHDuCeHDuCeHDuCeHA6DeGzuEeGzuEeHB5COujxGHXA7/Hf47/Hf47/Hf47/Hf47/Hf47/Hf47/AAMgHZsIHdegHZsKHVUCHZ+AHdMKHZ4PGAEcqHZ+oHdOqHZ4HGd0Y7ReFAqBHaDwolQ7ReFAyBHaDwndwIASeExlCACLwmdwIASeEw6TeEzuUeEw77WfcAlQ6T1A7lhQ7T0A7leAQpGVI5NCd0oyDHaI6meAQ7Qd0wqDHaDumeAY7Qd04zCHaA6oeAI7Pd1ArCHZ7uoeAQ7Pd1IABHZ46qAA47HAGY7/Hf47/Hf47/Hf47/Hf47/Hf47/Hf47/Hf8AlQ5BAAeoHecKHYugHecCHYuAduwADeHTu0eAzu0eAzu1eAo62eAbu2eAju2eAju3eAY64eALu4eATu4eATu5AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4AXA=="))
});
}

function findDevices() {
  E.showMenu();
  E.showMessage("Searching...");
  NRF.findDevices(function(devices) {
    if (!devices.length) {
      E.showPrompt("No Smartibot found.\nTry again?").then(function(x) {
        if (x) findDevices(); else load();
      });
    } else {
      var m = { "": {title:"Smartibots"} };
      devices.forEach(dev=>{
        m[dev.id.substr(0,17)] = () => startConnectChoose(dev);
      });
      m["Search again"] = () => findDevices();
      m["Back"] = () => load();
      E.showMenu(m);
    }
  }, {timeout : 2000, filters : [{ name : "Espruino SMARTIBOT" }] });
}

function startConnectChoose(device) {
  E.showMenu({
    "": {title:"Control Method"},
    "Accelerometer" : () => startConnectAccel(device),
    "Button" : () => startConnectBtn(device),
    "Back": () => load(),
  });
}

function startConnectBtn(device) {
  E.showMenu();
  startConnect(device,
               "\x03\x10var w=digitalWrite.bind(null,[D4,D6,D11,D10])\n",
               function(gatt, write) {
    function setMotors(val) { write(`\x10w(${val})\n`); }
    drawBGBtn();
    g.reset().setFont("6x8",2).setFontAlign(0,0,1).drawString("BACK", 230,200);
    var state = 0;
    var watches = [
      setWatch(e=>setMotors(state = (state&0b0011) | (e.state<<2)), BTN4, {repeat:true, edge:0}),
      setWatch(e=>setMotors(state = (state&0b1100) | e.state), BTN5, {repeat:true, edge:0}),
      setWatch(() => {
        g.clear();
        watches.forEach(clearWatch);
        write(`\x10w(0)\n`);
        setTimeout(()=>{
          gatt.disconnect()
          findDevices();
        },500);
      }, BTN3, {repeat:true})
    ];
  });
}

function startConnectAccel(device) {
  E.showMenu();
  startConnect(device,
               "\x03\x10function w(x,y,z,v){var a=analogWrite;a(D4,x);a(D6,y);a(D10,z);a(D11,v);}\n",
               function(gatt, write) {
    drawBGAccel();
    g.reset().setFont("6x8",2).setFontAlign(0,0,1).drawString("BACK", 230,200);
    Bangle.on("accel", function(a) {
        var v = [0,0,0,0];
        if (a.z<-0.5) {
          var vel = 0, rot = 0;
          if (a.y<-0.2) vel = a.y+0.2;
          if (a.y>0.2) vel = a.y-0.2;
          if (a.x<-0.2) rot = a.x+0.2;
          if (a.x>0.2) rot = a.x-0.2;
          var rl = Math.round(-(vel+rot)*200)/100;
          var rr = Math.round((vel-rot)*200)/100;
          v[0] = (rl>0) ? rl:0;
          v[1] = (rl<0) ? -rl:0;
          v[2] = (rr>0) ? rr:0;
          v[3] = (rr<0) ? -rr:0;
        }
        write(`\x10w(${v.join(",")})\n`);
      });
    setWatch(() => {
      g.clear();
      Bangle.removeAllListeners("accel");
      write(`\x10w(0,0,0,0)\n`);
        setTimeout(()=>{
          gatt.disconnect()
          findDevices();
        },500);
    }, BTN3, {repeat:0})
  });
}

function startConnect(device, text, callback) {
  var gatt, tx;
  var busy;
  function write(data) {
    var cmd = function() {
      return tx.writeValue(data);
    };
    if (!busy) busy=Promise.resolve().then(cmd).then(()=>busy=false);
    else busy = busy.then(cmd).then(()=>busy=false);
  }

  E.showMessage("Connecting...");
  return device.gatt.connect().then(function(d) {
    gatt = d;
    return d.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(s) {
    return s.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
  }).then(function(c) {
    E.showMessage("Uploading...");
    tx = c;
    function sender(resolve, reject) {
      if (text.length) {
        tx.writeValue(text.substr(0,20)).then(function() {
          sender(resolve, reject);
        }).catch(reject);
        text = text.substr(20);
      } else  {
        resolve();
      }
    }
    return new Promise(sender);
  }).then(function() {
    callback(gatt, write);
  });
}

findDevices();
