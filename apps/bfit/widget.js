const notConnectedIcon = require("heatshrink").decompress(atob("jEYwkA///+UiAYIABkUvAgQKBAAMvAggQCABAWEAAwdEBY4KJAHpfXBZaPLBZgkIYAYLTboYkGCwYYHBQgYFCwoMEBQ4lDAwgA=="));
const ConnectedIcon = require("heatshrink").decompress(atob("jEYwkA////WqAYIAB1WvAgQKBAAOvAggQCABAWEAAwdEBY4KJAHpfXBZaPLBZgkIYAYLTboYkGCwYYHBQgYFCwoMEBQ4lDAwgA=="));
const ConnectedWithActivity = require("heatshrink").decompress(atob("jEYwkA////nMAYIAB5nPAgQKBAAPPAggQCABAWEAAwdEBY4KJAHpfXBZaPLBZgkIYAYLTboYkGCwYYHBQgYFCwoMEBQ4lDAwgA=="));
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