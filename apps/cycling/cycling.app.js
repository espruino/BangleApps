const Layout = require('Layout');
const storage = require('Storage');

const SETTINGS_FILE = 'cycling.json';
const SETTINGS_DEFAULT = {
  sensors: {},
  metric: true,
};

const RECONNECT_TIMEOUT = 4000;
const MAX_CONN_ATTEMPTS = 2;

class CSCSensor {
  constructor(blecsc, display) {
    // Dependency injection
    this.blecsc = blecsc;
    this.display = display;

    // Load settings
    this.settings = storage.readJSON(SETTINGS_FILE, true) || SETTINGS_DEFAULT;
    this.wheelCirc = undefined;

    // CSC runtime variables
    this.movingTime = 0;              // unit: s
    this.lastBangleTime = Date.now(); // unit: ms
    this.cwr = -1;                    // cumulative wheel revolutions
    this.cwrTrip = 0;                 // wheel revolutions since trip start
    this.speed = 0;                   // unit: m/s
    this.maxSpeed = 0;                // unit: m/s
    this.speedFailed = 0;

    // Other runtime variables
    this.connected = false;
    this.failedAttempts = 0;
    this.failed = false;

    // Layout configuration
    this.layout = 0;
    this.display.useMetricUnits(true);
    this.deviceAddress = undefined;
    this.display.useMetricUnits((this.settings.metric));
  }

  onDisconnect(event) {
    console.log("disconnected ", event);

    this.connected = false;
    this.wheelCirc = undefined;

    this.setLayout(0);
    this.display.setDeviceAddress("unknown");

    if (this.failedAttempts >= MAX_CONN_ATTEMPTS) {
      this.failed = true;
      this.display.setStatus("Connection failed after " + MAX_CONN_ATTEMPTS + " attempts.");
    } else {
      this.display.setStatus("Disconnected");
      setTimeout(this.connect.bind(this), RECONNECT_TIMEOUT);
    }
  }

  loadCircumference() {
    if (!this.deviceAddress) return;

    // Add sensor to settings if not present
    if (!this.settings.sensors[this.deviceAddress]) {
      this.settings.sensors[this.deviceAddress] = {
        cm: 223,
        mm: 0,
      };
      storage.writeJSON(SETTINGS_FILE, this.settings);
    }

    const high = this.settings.sensors[this.deviceAddress].cm || 223;
    const low = this.settings.sensors[this.deviceAddress].mm || 0;
    this.wheelCirc = (10*high + low) / 1000;
  }

  connect() {
    this.connected = false;
    this.setLayout(0);
    this.display.setStatus("Connecting");
    console.log("Trying to connect to BLE CSC");

    // Hook up events
    this.blecsc.on('data', this.onWheelEvent.bind(this));
    this.blecsc.on('disconnect', this.onDisconnect.bind(this));

    // Scan for BLE device and connect
    this.blecsc.connect()
      .then(function() {
        this.failedAttempts = 0;
        this.failed = false;
        this.connected = true;
        this.deviceAddress = this.blecsc.getDeviceAddress();
        console.log("Connected to " + this.deviceAddress);

        this.display.setDeviceAddress(this.deviceAddress);
        this.display.setStatus("Connected");

        this.loadCircumference();

        // Switch to speed screen in 2s
        setTimeout(function() {
          this.setLayout(1);
          this.updateScreen();
        }.bind(this), 2000);
      }.bind(this))
      .catch(function(e) {
        this.failedAttempts++;
        this.onDisconnect(e);
      }.bind(this));
  }

  disconnect() {
    this.blecsc.disconnect();
    this.reset();
    this.setLayout(0);
    this.display.setStatus("Disconnected");
  }

  setLayout(num) {
    this.layout = num;
    if (this.layout == 0) {
      this.display.updateLayout("status");
    } else if (this.layout == 1) {
      this.display.updateLayout("speed");
    } else if (this.layout == 2) {
      this.display.updateLayout("distance");
    }
  }

  reset() {
    this.connected = false;
    this.failed = false;
    this.failedAttempts = 0;
    this.wheelCirc = undefined;
  }

  interact(d) {
    // Only interested in tap / center button
    if (d) return;

    // Reconnect in failed state
    if (this.failed) {
      this.reset();
      this.connect();
    } else if (this.connected) {
      this.setLayout((this.layout + 1) % 3);
    }
  }

  updateScreen() {
    var tripDist = this.cwrTrip * this.wheelCirc;
    var avgSpeed = this.movingTime > 3 ? tripDist / this.movingTime : 0;

    this.display.setTotalDistance(this.cwr * this.wheelCirc);
    this.display.setTripDistance(tripDist);
    this.display.setSpeed(this.speed);
    this.display.setAvg(avgSpeed);
    this.display.setMax(this.maxSpeed);
    this.display.setTime(Math.floor(this.movingTime));
  }

  onWheelEvent(event) {
    // Calculate number of revolutions since last wheel event
    var dRevs = (this.cwr > 0 ? event.cwr - this.cwr : 0);
    this.cwr = event.cwr;

    // Increment the trip revolutions counter
    this.cwrTrip += dRevs;

    // Recalculate current speed
    if (dRevs>0 ) {
      this.speed = event.wrps * this.wheelCirc;
      this.speedFailed = 0;
      this.movingTime += event.wdt;
    } else {
      this.speedFailed++;
      if (this.speedFailed>3) {
        this.speed = 0;
      }
    }

    // Update max speed
    if (this.speed>this.maxSpeed
      && (this.movingTime>3 || this.speed<20)
      && this.speed<50
    ) this.maxSpeed = this.speed;

    this.updateScreen();
  }
}

class CSCDisplay {
  constructor() {
    this.metric = true;
    this.fontLabel = "6x8";
    this.fontSmall = "15%";
    this.fontMed = "18%";
    this.fontLarge = "32%";
    this.currentLayout = "status";
    this.layouts = {};
    this.layouts.speed = new Layout({
      type: "v",
      c: [
        {
          type: "h",
          id: "speed_g",
          fillx: 1,
          filly: 1,
          pad: 4,
          bgCol: "#fff",
          c: [
            {type: undefined, width: 32, halign: -1},
            {type: "txt", id: "speed", label: "00.0", font: this.fontLarge, bgCol: "#fff", col: "#000", width: 122},
            {type: "txt", id: "speed_u", label: "  km/h", font: this.fontLabel, col: "#000", width: 22, r: 90},
          ]
        },
        {
          type: "h",
          id: "time_g",
          fillx: 1,
          pad: 4,
          bgCol: "#000",
          height: 36,
          c: [
            {type: undefined, width: 32, halign: -1},
            {type: "txt", id: "time", label: "00:00", font: this.fontMed, bgCol: "#000", col: "#fff", width: 122},
            {type: "txt", id: "time_u", label: "mins", font: this.fontLabel, bgCol: "#000", col: "#fff", width: 22, r: 90},
          ]
        },
        {
          type: "h",
          id: "stats_g",
          fillx: 1,
          bgCol: "#fff",
          height: 36,
          c: [
            {
              type: "v",
              pad: 4,
              bgCol: "#fff",
              c: [
                {type: "txt", id: "max_l", label: "MAX", font: this.fontLabel, col: "#000"},
                {type: "txt", id: "max", label: "00.0", font: this.fontSmall, bgCol: "#fff", col: "#000", width: 69},
              ],
            },
            {
              type: "v",
              pad: 4,
              bgCol: "#fff",
              c: [
                {type: "txt", id: "avg_l", label: "AVG", font: this.fontLabel, col: "#000"},
                {type: "txt", id: "avg", label: "00.0", font: this.fontSmall, bgCol: "#fff", col: "#000", width: 69},
              ],
            },
            {type: "txt", id: "stats_u", label: " km/h", font: this.fontLabel, bgCol: "#fff", col: "#000", width: 22, r: 90},
          ]
        },
      ],
    });
    this.layouts.distance = new Layout({
      type: "v",
      bgCol: "#fff",
      c: [
        {
          type: "h",
          id: "tripd_g",
          fillx: 1,
          pad: 4,
          bgCol: "#fff",
          height: 32,
          c: [
            {type: "txt", id: "tripd_l", label: "TRP", font: this.fontLabel, bgCol: "#fff", col: "#000", width: 36},
            {type: "txt", id: "tripd", label: "0", font: this.fontMed, bgCol: "#fff", col: "#000", width: 118},
            {type: "txt", id: "tripd_u", label: "km", font: this.fontLabel, bgCol: "#fff", col: "#000", width: 22, r: 90},
          ]
        },
        {
          type: "h",
          id: "totald_g",
          fillx: 1,
          pad: 4,
          bgCol: "#fff",
          height: 32,
          c: [
            {type: "txt", id: "totald_l", label: "TTL", font: this.fontLabel, bgCol: "#fff", col: "#000", width: 36},
            {type: "txt", id: "totald", label: "0", font: this.fontMed, bgCol: "#fff", col: "#000", width: 118},
            {type: "txt", id: "totald_u", label: "km", font: this.fontLabel, bgCol: "#fff", col: "#000", width: 22, r: 90},
          ]
        },
      ],
    });
    this.layouts.status = new Layout({
      type: "v",
      c: [
        {
          type: "h",
          id: "status_g",
          fillx: 1,
          bgCol: "#fff",
          height: 100,
          c: [
            {type: "txt", id: "status", label: "Bangle Cycling", font: this.fontSmall, bgCol: "#fff", col: "#000", width: 176, wrap: 1},
          ]
        },
        {
          type: "h",
          id: "addr_g",
          fillx: 1,
          pad: 4,
          bgCol: "#fff",
          height: 32,
          c: [
            { type: "txt", id: "addr_l", label: "ADDR", font: this.fontLabel, bgCol: "#fff", col: "#000", width: 36 },
            { type: "txt", id: "addr", label: "unknown", font: this.fontLabel, bgCol: "#fff", col: "#000", width: 140 },
          ]
        },
      ],
    });
  }

  updateLayout(layout) {
    this.currentLayout = layout;

    g.clear();
    this.layouts[layout].update();
    this.layouts[layout].render();
    Bangle.drawWidgets();
  }

  renderIfLayoutActive(layout, node) {
    if (layout != this.currentLayout) return;
    this.layouts[layout].render(node);
  }

  useMetricUnits(metric) {
    this.metric = metric;

    // console.log("using " + (metric ? "metric" : "imperial") + " units");

    var speedUnit = metric ? "km/h" : "mph";
    this.layouts.speed.speed_u.label = speedUnit;
    this.layouts.speed.stats_u.label = speedUnit;

    var distanceUnit = metric ? "km" : "mi";
    this.layouts.distance.tripd_u.label = distanceUnit;
    this.layouts.distance.totald_u.label = distanceUnit;

    this.updateLayout(this.currentLayout);
  }

  convertDistance(meters) {
    if (this.metric) return meters / 1000;
    return meters / 1609.344;
  }

  convertSpeed(mps) {
    if (this.metric) return mps * 3.6;
    return mps * 2.23694;
  }

  setSpeed(speed) {
    this.layouts.speed.speed.label = this.convertSpeed(speed).toFixed(1);
    this.renderIfLayoutActive("speed", this.layouts.speed.speed_g);
  }

  setAvg(speed) {
    this.layouts.speed.avg.label = this.convertSpeed(speed).toFixed(1);
    this.renderIfLayoutActive("speed", this.layouts.speed.stats_g);
  }

  setMax(speed) {
    this.layouts.speed.max.label = this.convertSpeed(speed).toFixed(1);
    this.renderIfLayoutActive("speed", this.layouts.speed.stats_g);
  }

  setTime(seconds) {
    var time = '';
    var hours = Math.floor(seconds/3600);
    if (hours) {
      time += hours + ":";
      this.layouts.speed.time_u.label = " hrs";
    } else {
      this.layouts.speed.time_u.label = "mins";
    }

    time += String(Math.floor((seconds%3600)/60)).padStart(2, '0') + ":";
    time += String(seconds % 60).padStart(2, '0');

    this.layouts.speed.time.label = time;
    this.renderIfLayoutActive("speed", this.layouts.speed.time_g);
  }

  setTripDistance(distance) {
    this.layouts.distance.tripd.label = this.convertDistance(distance).toFixed(1);
    this.renderIfLayoutActive("distance", this.layouts.distance.tripd_g);
  }

  setTotalDistance(distance) {
    distance = this.convertDistance(distance);
    if (distance >= 1000) {
      this.layouts.distance.totald.label = String(Math.round(distance));
    } else {
      this.layouts.distance.totald.label = distance.toFixed(1);
    }
    this.renderIfLayoutActive("distance", this.layouts.distance.totald_g);
  }

  setDeviceAddress(address) {
    this.layouts.status.addr.label = address;
    this.renderIfLayoutActive("status", this.layouts.status.addr_g);
  }

  setStatus(status) {
    this.layouts.status.status.label = status;
    this.renderIfLayoutActive("status", this.layouts.status.status_g);
  }
}

var blecsc = require("blecsc").getInstance();
var display = new CSCDisplay();
var sensor = new CSCSensor(blecsc, display);

E.on('kill',()=>{
  sensor.disconnect();
});

Bangle.setUI("updown", d => {
  sensor.interact(d);
});

Bangle.loadWidgets();
sensor.connect();
