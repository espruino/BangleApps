const notConnectedIcon = require("heatshrink").decompress(atob("jEYwUBqtqqtV1NVq2q1Nq1WVrWqAAWlBAIACBwQFDAQOolQID1EKAomCAgco0ALDhALD1WAC4QpB0AjBF4QFFCIWpI4IdC0taFIelLII1CytVIIYFDEYJuBLQRxBqpsC0oFBDwIWCCQQQCCQQQCA"));
const ConnectedIcon = require("heatshrink").decompress(atob("jEYwkBiMRjWqAYIAB1WhAgQKBAAOhAggQCABAWEAAwdEBY4FE0EKCJOggALKDBAIB0GqDBEAC5IuCCwpTEgAWEL4oLKEYyQBHZKbDKY6zFC4jADQY4LHFwokFCwzZHBQgYFCwoMEBQ4lDAwg"));
const ConnectedWithActivity = require("heatshrink").decompress(atob("jEYwkBiMRjnMAYIAB5nBAgQKBAAPBAggQCABAWEAAwdEBY4FE4EMCJPAgALKDBAIB4HMDBEAC5IuCCwpTEgAWEL4oLKEYyQBHZKbDKY6zFC4jADQY4LHFwokFCwzZHBQgYFCwoMEBQ4lDAwg"));


(()=>{
    const _Activity={
        active: false
    };
    const steps;
    var hasFix = false;
    var fixToggle = false; // toggles once for each reading
    var gpsTrack; // file for GPS track
    var periodCtr = 0;
    
    //bluetooth functions
    function BLESend(data){
        Bluetooth.println(JSON.stringify(data));
    }
    global.GB = (event) =>{
        switch(event.t){
            case "startActivity":
                startActivity(event.id);
                break;
            case "stopActivity":
                stopActivity();
                break;
        }
        WIDGETS["bfit"].draw();
    };


    function startActivity(id){
        //HR, Gps, Steps event handler
        Bangle.on('HRM',onHRM);
        //Bangle.on('step',onStep);
        Bangle.on('GPS',onGPS);
        _Activity.Id = id;
        _Activity.active = true;
        _Activity.start = getTime().toFixed(0);

    }
    
    function stopActivity(){
        Bangle.removeListener('HRM',onHRM);
        //Bangle.removeListener('step',onStep);
        Bangle.removeListener('GPS',onGPS);
        Bangle.setHRMPower(0);
        Bangle.setGPSPower(0);
        _Activity.active = false;
        _Activity.end = getTime().toFixed(0);
        BLESend(_Activity);
    }

    //heart rate function
    function onHRM(hrm){
        if(hrm.confidence > 98 && hrm.bpm != 200){
            BLESend(new{t:"hrm", bpm: hrm.bpm, timestamp: getTime.toFixed(0)});
        }
    }

    //gps function
    function onGPS(fix){
        hasFix = fix.fix;
        fixToggle = !fixToggle;
        WIDGETS["bfit"].draw();
        if (hasFix) {
            periodCtr--;
            if (periodCtr<=0) {
                periodCtr = 1;
                if (gpsTrack) {
                    BLESend(new{t:"gps", timestamp: fix.time.getTime(), latitude: fix.lat.toFixed(5), longitude: fix.lon.toFixed(5), altitude: fix.alt});              
                }
            }
          }
    }

    function draw() {
        g.setColor(-1);
        if(NRF.getSecurityStatus().connected && _Activity.active){
            g.drawImage(ConnectedWithActivity, this.x + 1, this.y + 1);
        }
        if (NRF.getSecurityStatus().connected)
            g.drawImage(ConnectedIcon, this.x + 1, this.y + 1);
        else
            g.drawImage(notConnectedIcon, this.x + 1, this.y + 1);
        
        if (hasFix) {
            g.setColor("#FF0000");
            g.drawImage(fixToggle ? atob("CgoCAAAAA0AAOAAD5AAPwAAAAAAAAAAAAAAAAA==") : atob("CgoCAAABw0AcOAHj5A8PwHwAAvgAB/wABUAAAA=="),this.x,this.y+14);
        } else {
            g.setColor("#0000FF");
            if (fixToggle)
                g.setFont("6x8").drawString("?",this.x,this.y+14);
        }
    }

    //connectionchanged function
    function changedConnectionState() {
        WIDGETS["bfit"].draw();
        g.flip(); // turns screen on
    }

    //reporting intervals
    setInterval(function() {BLESend({t:"status",bat:E.getBattery()});},60000);
    
    
    //touch eventhandler
    Bangle.on("touch", function(segment){
        if(Date.now() - lastTouchEvent.time < 250 && segement == lastTouchEvent.segement){
            //left
            if(segement == 1){
                BLESend(new{t: "startActivity", value: true});
            }
            //right
            if(segement == 2){
                BLESend(new{t: "stopActivity", value: true});
            }
        }
        lastTouchEvent.segement = segement;
        lastTouchEvent.time = Date.now();
    });
    //Connection eventHandler
    NRF.on("connect", changedConnectionState);
    NRF.on("disconnect", changedConnectionState);

    WIDGETS["bfit"] = { area: "tl", width: 24, draw: draw};
})();