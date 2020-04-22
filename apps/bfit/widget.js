const notConnectedIcon = require("heatshrink").decompress(atob("jEYwUBqtqqtV1NVq2q1Nq1WVrWqAAWlBAIACBwQFDAQOolQID1EKAomCAgco0ALDhALD1WAC4QpB0AjBF4QFFCIWpI4IdC0taFIelLII1CytVIIYFDEYJuBLQRxBqpsC0oFBDwIWCCQQQCCQQQCA"));
const ConnectedIcon = require("heatshrink").decompress(atob("jEYwkBiMRjWqAYIAB1WhAgQKBAAOhAggQCABAWEAAwdEBY4FE0EKCJOggALKDBAIB0GqDBEAC5IuCCwpTEgAWEL4oLKEYyQBHZKbDKY6zFC4jADQY4LHFwokFCwzZHBQgYFCwoMEBQ4lDAwg"));
const ConnectedWithActivity = require("heatshrink").decompress(atob("jEYwkBiMRjnMAYIAB5nBAgQKBAAPBAggQCABAWEAAwdEBY4FE4EMCJPAgALKDBAIB4HMDBEAC5IuCCwpTEgAWEL4oLKEYyQBHZKbDKY6zFC4jADQY4LHFwokFCwzZHBQgYFCwoMEBQ4lDAwg"));
const _activityActive;
(()=>{

    function draw() {
        g.setColor(-1);
        if(NRF.getSecurityStatus().connected && _activityActive){
            g.drawImage(ConnectedWithActivity, this.x + 1, this.y + 1);
        }
        if (NRF.getSecurityStatus().connected)
          g.drawImage(ConnectedIcon, this.x + 1, this.y + 1);
        else
          g.drawImage(notConnectedIcon, this.x + 1, this.y + 1);
      }
    
      function changedConnectionState() {
        WIDGETS["bfit"].draw();
        g.flip(); // turns screen on
      }

    WIDGETS["bfit"] = { area: "tl", width: 24, draw: draw};
})();