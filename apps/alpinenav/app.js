var background_colour = "#000000";
var foregound_colour = "#ccff99";
var position_colour = "#ff3329";
var log_limit = 1000;
var max_array_size = 50;
var pause_tracker = false;
var temp;
var file;
var d;
var origin_lat;
var origin_lon;
var current_lat;
var current_lon;
var current_speed;
var distance_from_origin = 0;
var distane_travelled = 0;
var log_size;
var waypoints = [];
var start_alt = 0;
var current_alt = 0;
var button_lock = false;
var display_waypoints = [];
var waypoint = {
    lat: "",
    lon: ""
};
var compass_heading = "---";

function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371e3;
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function toRad(Value) {
    return Value * Math.PI / 180;
}

function draw() {
    if (pause_tracker)
        g.setColor(background_colour);
    else
        g.setColor(foregound_colour);
    g.setFont("6x8", 2);
    g.setFontAlign(0, 1);
    g.drawString(distance_from_origin.toFixed(0), 40, 220, true);
    g.drawString(distane_travelled.toFixed(0), 200, 220, true);
    g.setFont("6x8", 1);
    g.drawString(start_alt.toFixed(0), 40, 120, true);
    g.drawString(current_alt.toFixed(0), 200, 120, true);
    if (button_lock) {
        g.setFont("6x8", 2);
        g.setFontAlign(0, 0);
        g.drawString("X", 120, 220, true);
        g.setFont("6x8", 1);
    }
}

function cull_array() {
    for (var i = 2; i <= waypoints.length; i += 2)
        waypoints.splice(i, 1);
}

function process_and_display() {
    g.setColor(background_colour);
    g.fillRect(10, 65, 230, 230);
    g.setColor(foregound_colour);
    if (waypoints.length > max_array_size)
        cull_array();
    rescale();
    if (display_waypoints.length > 0) {
        for (let x = 0; x < display_waypoints.length - 1; x++) {
            g.reset();
            g.setColor(foregound_colour);
            g.drawLine(display_waypoints[x].lon, display_waypoints[x].lat, display_waypoints[x + 1].lon, display_waypoints[x + 1].lat);
        }
        g.reset();
        g.setColor(position_colour);
        g.fillCircle(display_waypoints[display_waypoints.length - 1].lon, display_waypoints[display_waypoints.length - 1].lat, 3);
    }
}

function process_GPS() {
    if (waypoints.length > 0) {
        //check distance
        temp_distance = calcCrow(current_lat, current_lon, waypoints[waypoints.length - 1].lat, waypoints[waypoints.length - 1].lon);
        if (temp_distance > 5) {
            var temp = Object.create(waypoint);
            temp.lat = current_lat;
            temp.lon = current_lon;
            waypoints.push(temp);
            distane_travelled += temp_distance;
            distance_from_origin = calcCrow(current_lat, current_lon, waypoints[0].lat, waypoints[0].lon);
            process_and_display();
            if (log_size < log_limit) {
                var csv = [
                    d,
                    origin_lat - current_lat,
                    current_lon - origin_lon,
                    current_speed,
                    current_alt
                ];
                file.write(csv.join(",") + "\n");
                log_size += 1;
            }
        }
    }
    else {
        g.setColor(position_colour);
        g.fillCircle(120, 120, 3);
    }
  draw();
}

function rescale() {
    var max_val = 0;
    display_waypoints = [];

    for (let x = 0; x < waypoints.length; x++) {
        if (Math.abs(waypoints[x].lat) > max_val)
            max_val = Math.abs(waypoints[x].lat);
        if (Math.abs(waypoints[x].lon) > max_val)
            max_val = Math.abs(waypoints[x].lon);
    }

    scaler = 60 / max_val;

    for (let x = 0; x < waypoints.length; x++) {
        temp = Object.create(waypoint);
        temp.lat = 140 - Math.round(waypoints[x].lat * scaler);
        temp.lon = 120 - Math.round(waypoints[x].lon * scaler);
        display_waypoints.push(temp);
    }
}

Bangle.setCompassPower(1);
Bangle.setGPSPower(1);
g.clear();
process_GPS();
/*var poll_GPS =*/ setInterval(process_GPS, 9000);

setWatch(function () {
    if (!button_lock) {
        waypoints.splice(1);
        process_GPS();
    }
}, BTN2, { repeat: true, edge: "falling" });

setWatch(function () {
    if (!button_lock) {
        if (!pause_tracker) {
            Bangle.setCompassPower(0);
            Bangle.setGPSPower(0);
            pause_tracker = true;
        }
        else {
            Bangle.setCompassPower(1);
            Bangle.setGPSPower(1);
            pause_tracker = false;
        }
    }
}, BTN3, { repeat: true, edge: "falling" });

setWatch(function () {
    if (button_lock) {
        button_lock = false;
        g.setFontAlign(0, 0);
        g.drawString(" ", 120, 220, true);
    }
    else {
        button_lock = true;
        g.setFontAlign(0, 0);
        g.drawString("X", 120, 220, true);
    }
}, BTN1, { repeat: true, edge: "falling" });

Bangle.on('GPS', function (g) {
    if (g.fix) {
        if (waypoints.length == 0) {
            file = require("Storage").open("alpine_log.csv", "w");
            file.write("");
            file = require("Storage").open("alpine_log.csv", "a");
            Bangle.buzz();
            position_colour = 0xF81F;
            origin_lat = g.lat;
            origin_lon = g.lon;
            start_alt = g.alt;
            current_speed = g.speed;
            sat_count = g.satellites;
            var csv = [
                d,
                origin_lat,
                origin_lon,
                current_speed,
                current_alt
            ];
            file.write(csv.join(",") + "\n");
            var temp = Object.create(waypoint);
            temp.lat = 0;
            temp.lon = 0;
            process_GPS();
            waypoints.push(temp);
        }
        else {
            current_lat = g.lat - origin_lat;
            current_lon = origin_lon - g.lon;
            current_speed = g.speed;
            sat_count = g.satellites;
            current_alt = g.alt;
            gps_time = g.time;
        }
    }
});

Bangle.on('mag', function (m) {
    if (isNaN(m.heading))
        compass_heading = "---";
    else
        compass_heading = Math.round(m.heading);
    current_colour = g.getColor();
    g.reset();
    g.setColor(background_colour);
    g.fillRect(140, 30, 190, 55);
    g.setColor(foregound_colour);
    g.setFont("6x8", 2);
    if(compass_heading<100)
      compass_heading = " " + compass_heading.toString();
    g.drawString(compass_heading, 150, 15, true);
});
