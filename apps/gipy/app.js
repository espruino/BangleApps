var lat = null;
var lon = null;
var cos_direction;
var sin_direction;

let simulated = false;

class Path {
    constructor(filename) {
        let buffer = require("Storage").readArrayBuffer(filename);
        this.points = Float64Array(buffer);
        this.total_distance = this.segments_length(0, this.len - 1);
    }

    // return cumulated length of wanted segments (in km).
    // start is index of first wanted segment
    // end is 1 after index of last wanted segment
    segments_length(start, end) {
        let total = 0.0;
        this.on_segments(function(p1, p2, i) {
            total += p1.distance(p2);
        }, start, end);
        return total;
    }

    // start is index of first wanted segment
    // end is 1 after index of last wanted segment
    on_segments(op, start, end) {
        let previous_point = null;
        for (let i = start; i < end + 1; i++) {
            let point = new Point(this.points[2 * i], this.points[2 * i + 1]);
            if (previous_point !== null) {
                op(previous_point, point, i);
            }
            previous_point = point;
        }
    }

    point(index) {
        let lon = this.points[2 * index];
        let lat = this.points[2 * index + 1];
        return new Point(lon, lat);
    }

    // return index of segment which is nearest from point
    nearest_segment(point, start, end) {
        let min_index = 0;
        let min_distance = Number.MAX_VALUE;
        this.on_segments(function(p1, p2, i) {
            let distance = point.fake_distance_to_segment(p1, p2);
            if (distance <= min_distance) {
                min_distance = distance;
                min_index = i - 1;
            }
        }, start, end);
        return min_index;
    }
    get len() {
        return this.points.length / 2;
    }
}

class Point {
    constructor(lon, lat) {
        this.lon = lon;
        this.lat = lat;
    }
    coordinates() {
        let x = (this.lon - lon) * 20000.0;
        let y = (this.lat - lat) * 20000.0;
        let rotated_x = x * cos_direction - y * sin_direction;
        let rotated_y = x * sin_direction + y * cos_direction;
        return [g.getWidth() / 2 - Math.round(rotated_x), // x is inverted
            g.getHeight() / 2 + Math.round(rotated_y)
        ];
    }
    minus(other_point) {
        let xdiff = this.lon - other_point.lon;
        let ydiff = this.lat - other_point.lat;
        return new Point(xdiff, ydiff);
    }
    plus(other_point) {
        return new Point(this.lon + other_point.lon, this.lat + other_point.lat);
    }
    length_squared(other_point) {
        let d = this.minus(other_point);
        return (d.lon * d.lon + d.lat * d.lat);
    }
    times(scalar) {
        return new Point(this.lon * scalar, this.lat * scalar);
    }
    dot(other_point) {
        return this.lon * other_point.lon + this.lat * other_point.lat;
    }
    distance(other_point) {
        //see https://www.movable-type.co.uk/scripts/latlong.html
        const R = 6371e3; // metres
        const phi1 = this.lat * Math.PI / 180;
        const phi2 = other_point.lat * Math.PI / 180;
        const deltaphi = (other_point.lat - this.lat) * Math.PI / 180;
        const deltalambda = (other_point.lon - this.lon) * Math.PI / 180;

        const a = Math.sin(deltaphi / 2) * Math.sin(deltaphi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltalambda / 2) * Math.sin(deltalambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres
    }
    fake_distance(other_point) {
        return Math.sqrt(this.length_squared(other_point));
    }
    fake_distance_to_segment(v, w) {
        // from : https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
        // Return minimum distance between line segment vw and point p
        let l2 = v.length_squared(w); // i.e. |w-v|^2 -  avoid a sqrt
        if (l2 == 0.0) {
            return this.distance(v); // v == w case
        }
        // Consider the line extending the segment, parameterized as v + t (w - v).
        // We find projection of point p onto the line.
        // It falls where t = [(p-v) . (w-v)] / |w-v|^2
        // We clamp t from [0,1] to handle points outside the segment vw.
        let t =
            Math.max(0, Math.min(1, (this.minus(v)).dot(w.minus(v)) / l2));
        let projection = v.plus((w.minus(v)).times(t)); // Projection falls on the segment
        return this.fake_distance(projection);
    }
}

function display(path) {
    g.clear();
    g.setColor(g.theme.fg);
    let next_segment =
        path.nearest_segment(new Point(lon, lat), 0, path.len - 1);
    let diff;
    if (next_segment != current_segment) {
        if (next_segment > current_segment) {
            diff = path.segments_length(current_segment + 1, next_segment + 1);
        } else {
            diff = -path.segments_length(next_segment + 1, current_segment + 1);
        }
        remaining_distance -= diff;
        current_segment = next_segment;
    }
    let start = Math.max(current_segment - 5, 0);
    let end = Math.min(current_segment + 7, path.len - 1);
    path.on_segments(function(p1, p2, i) {
        let c2 = p2.coordinates();
        if (i == current_segment + 1) {
            g.setColor(0.0, 1.0, 0.0);
        } else {
            g.setColor(1.0, 0.0, 0.0);
        }
        let c1 = p1.coordinates();
        g.drawLine(c1[0], c1[1], c2[0], c2[1]);
        g.setColor(g.theme.fg);
        g.fillCircle(c2[0], c2[1], 4);
        g.setColor(g.theme.bg);
        g.fillCircle(c2[0], c2[1], 3);
    }, 0, path.len - 1);

    g.setColor(g.theme.fgH);
    g.fillCircle(172 / 2, 172 / 2, 5);
    let real_remaining_distance =
        remaining_distance + path.point(current_segment + 1).distance(new Point(lon, lat));
    let rounded_distance = Math.round(real_remaining_distance / 100) / 10;
    let total = Math.round(path.total_distance / 100) / 10;
    g.setFont("6x8:2").drawString("d. " + rounded_distance + "/" + total, 0, g.getHeight() - 32);
    g.drawString("seg." + (current_segment + 1) + "/" + path.len, 0, g.getHeight() - 15);
    Bangle.drawWidgets();
}

Bangle.loadWidgets();
let path = new Path("test.gpc");
var current_segment = path.nearest_segment(new Point(lon, lat), 0, path.len - 1);
var remaining_distance = path.total_distance - path.segments_length(0, 1);

function set_coordinates(data) {
    let old_lat = lat;
    if (!isNaN(data.lat)) {
        lat = data.lat;
    }
    let old_lon = lon;
    if (!isNaN(data.lon)) {
        lon = data.lon;
    }
    if ((old_lat != lat) || (old_lon != lon)) {
        let direction = data.course * Math.PI / 180.0;
        cos_direction = Math.cos(-direction - Math.PI / 2.0);
        sin_direction = Math.sin(-direction - Math.PI / 2.0);
        display(path);
    }
}

let fake_gps_point = 0.0;
function simulate_gps(path) {
    let point_index = Math.floor(fake_gps_point);
    if (point_index >= path.len) {
        return;
    }
    let p1 = path.point(point_index);
    let p2 = path.point(point_index + 1);
    let alpha = fake_gps_point - point_index;

    let old_lon = lon;
    let old_lat = lat;
    lon = (1 - alpha) * p1.lon + alpha * p2.lon;
    lat = (1 - alpha) * p1.lat + alpha * p2.lat;
    fake_gps_point += 0.05;
    let direction = Math.atan2(lat - old_lat, lon - old_lon);
    cos_direction = Math.cos(-direction - Math.PI / 2.0);
    sin_direction = Math.sin(-direction - Math.PI / 2.0);
    display(path);
}


if (simulated) {
    setInterval(simulate_gps, 500, path);

} else {
    Bangle.setGPSPower(true, "gipy");
    Bangle.on('GPS', set_coordinates);
}
