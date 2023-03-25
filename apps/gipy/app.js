let simulated = false;
let file_version = 3;
let code_key = 47490;

var settings = Object.assign(
  {
    keep_gps_alive: true,
    max_speed: 35,
    display_points: true,
  },
  require("Storage").readJSON("gipy.json", true) || {}
);

let profile_start_times = [];

let splashscreen = require("heatshrink").decompress(
  atob(
    "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"
  )
);

function start_profiling() {
  profile_start_times.push(getTime());
}

function end_profiling(label) {
  let end_time = getTime();
  let elapsed = end_time - profile_start_times.pop();
  console.log("profile:", label, "took", elapsed);
}

let interests_colors = [
  0xf800, // Bakery, red
  0x001f, // DrinkingWater, blue
  0x07ff, // Toilets, cyan
  0x07e0, // Artwork, green
];

function binary_search(array, x) {
  let start = 0,
    end = array.length - 1;

  while (start <= end) {
    let mid = Math.floor((start + end) / 2);
    if (array[mid] < x) start = mid + 1;
    else end = mid - 1;
  }
  return start;
}

// return a string containing estimated time of arrival.
// speed is in km/h
// remaining distance in km
// hour, minutes is current time
function compute_eta(hour, minutes, approximate_speed, remaining_distance) {
  if (isNaN(approximate_speed) || approximate_speed < 0.1) {
    return "";
  }
  let time_needed = (remaining_distance * 60) / approximate_speed; // in minutes
  let eta_in_minutes = hour * 60 + minutes + time_needed;
  let eta_minutes = Math.round(eta_in_minutes % 60);
  let eta_hour = Math.round((eta_in_minutes - eta_minutes) / 60) % 24;
  if (eta_minutes < 10) {
    return eta_hour.toString() + ":0" + eta_minutes;
  } else {
    return eta_hour.toString() + ":" + eta_minutes;
  }
}

class Status {
  constructor(path) {
    this.path = path;
    this.scale_factor = 40000.0; // multiply geo coordinates by this to get pixels coordinates
    this.on_path = false; // are we on the path or lost ?
    this.position = null; // where we are
    this.adjusted_cos_direction = null; // cos of where we look at
    this.adjusted_sin_direction = null; // sin of where we look at
    this.current_segment = null; // which segment is closest
    this.reaching = null; // which waypoint are we reaching ?
    this.distance_to_next_point = null; // how far are we from next point ?
    this.projected_point = null;

    let r = [0];
    // let's do a reversed prefix computations on all distances:
    // loop on all segments in reversed order
    let previous_point = null;
    for (let i = this.path.len - 1; i >= 0; i--) {
      let point = this.path.point(i);
      if (previous_point !== null) {
        r.unshift(r[0] + point.distance(previous_point));
      }
      previous_point = point;
    }
    this.remaining_distances = r; // how much distance remains at start of each segment
    this.starting_time = null; // time we start
    this.advanced_distance = 0.0;
    this.gps_coordinates_counter = 0; // how many coordinates did we receive
    this.old_points = []; // record previous points but only when enough distance between them
    this.old_times = []; // the corresponding times
  }
  new_position_reached(position) {
    // we try to figure out direction by looking at previous points
    // instead of the gps course which is not very nice.

    let now = getTime();

    if (this.old_points.length == 0) {
      this.gps_coordinates_counter += 1;
      this.old_points.push(position);
      this.old_times.push(now);
      return null;
    } else {
      let previous_point = this.old_points[this.old_points.length - 1];
      let distance_to_previous = previous_point.distance(position);
      // gps signal is noisy but rarely above 4 meters
      if (distance_to_previous < 4) {
        return null;
      }
    }
    this.gps_coordinates_counter += 1;
    this.old_points.push(position);
    this.old_times.push(now);

    let oldest_point = this.old_points[0];
    let distance_to_oldest = oldest_point.distance(position);

    // every 3 points we count the distance
    if (this.gps_coordinates_counter % 3 == 0) {
      if (distance_to_oldest < 150.0) {
        // to avoid gps glitches
        this.advanced_distance += distance_to_oldest;
      }
    }

    this.instant_speed = distance_to_oldest / (now - this.old_times[0]);

    if (this.old_points.length == 4) {
      this.old_points.shift();
      this.old_times.shift();
    }
    // let's just take angle of segment between newest point and a point a bit before
    let previous_index = this.old_points.length - 3;
    if (previous_index < 0) {
      previous_index = 0;
    }
    let diff = position.minus(this.old_points[previous_index]);
    let angle = Math.atan2(diff.lat, diff.lon);
    return angle;
  }
  update_position(new_position, maybe_direction) {
    let direction = this.new_position_reached(new_position);
    if (direction === null) {
      if (maybe_direction === null) {
        return;
      } else {
        direction = maybe_direction;
      }
    }

    this.adjusted_cos_direction = Math.cos(-direction - Math.PI / 2.0);
    this.adjusted_sin_direction = Math.sin(-direction - Math.PI / 2.0);
    cos_direction = Math.cos(direction);
    sin_direction = Math.sin(direction);
    this.position = new_position;

    // detect segment we are on now
    let res = this.path.nearest_segment(
      this.position,
      Math.max(0, this.current_segment - 1),
      Math.min(this.current_segment + 2, this.path.len - 1),
      cos_direction,
      sin_direction
    );
    let orientation = res[0];
    let next_segment = res[1];

    if (this.is_lost(next_segment)) {
      // start_profiling();
      // it did not work, try anywhere
      res = this.path.nearest_segment(
        this.position,
        0,
        this.path.len - 1,
        cos_direction,
        sin_direction
      );
      orientation = res[0];
      next_segment = res[1];
      // end_profiling("repositioning");
    }
    // now check if we strayed away from path or back to it
    let lost = this.is_lost(next_segment);
    if (this.on_path == lost) {
      // if status changes
      if (lost) {
        Bangle.buzz(); // we lost path
        setTimeout(() => Bangle.buzz(), 500);
        setTimeout(() => Bangle.buzz(), 1000);
        setTimeout(() => Bangle.buzz(), 1500);
      }
      this.on_path = !lost;
    }

    this.current_segment = next_segment;

    // check if we are nearing the next point on our path and alert the user
    let next_point = this.current_segment + (1 - orientation);
    this.distance_to_next_point = Math.ceil(
      this.position.distance(this.path.point(next_point))
    );

    // disable gps when far from next point and locked
    if (Bangle.isLocked() && !settings.keep_gps_alive) {
      let time_to_next_point =
        (this.distance_to_next_point * 3.6) / settings.max_speed;
      if (time_to_next_point > 60) {
        Bangle.setGPSPower(false, "gipy");
        setTimeout(function () {
          Bangle.setGPSPower(true, "gipy");
        }, time_to_next_point);
      }
    }
    if (this.reaching != next_point && this.distance_to_next_point <= 100) {
      this.reaching = next_point;
      let reaching_waypoint = this.path.is_waypoint(next_point);
      if (reaching_waypoint) {
        Bangle.buzz();
        setTimeout(() => Bangle.buzz(), 500);
        setTimeout(() => Bangle.buzz(), 1000);
        setTimeout(() => Bangle.buzz(), 1500);
        if (Bangle.isLocked()) {
          Bangle.setLocked(false);
        }
      }
    }
    // re-display
    this.display(orientation);
  }
  remaining_distance(orientation) {
    let remaining_in_correct_orientation =
      this.remaining_distances[this.current_segment + 1] +
      this.position.distance(this.path.point(this.current_segment + 1));

    if (orientation == 0) {
      return remaining_in_correct_orientation;
    } else {
      return this.remaining_distances[0] - remaining_in_correct_orientation;
    }
  }
  // check if we are lost (too far from segment we think we are on)
  // if we are adjust scale so that path will still be displayed.
  // we do the scale adjustment here to avoid recomputations later on.
  is_lost(segment) {
    let projection = this.position.closest_segment_point(
      this.path.point(segment),
      this.path.point(segment + 1)
    );
    this.projected_point = projection; // save this info for display
    let distance_to_projection = this.position.distance(projection);
    if (distance_to_projection > 50) {
      this.scale_factor =
        Math.min(88.0 / distance_to_projection, 1.0) * 40000.0;
      return true;
    } else {
      this.scale_factor = 40000.0;
      return false;
    }
  }
  display(orientation) {
    g.clear();
    // start_profiling();
    this.display_map();
    // end_profiling("display_map");

    this.display_interest_points();
    this.display_stats(orientation);
    Bangle.drawWidgets();
  }
  display_interest_points() {
    // this is the algorithm in case we have a lot of interest points
    // let's draw all points for 5 segments centered on current one
    let starting_group = Math.floor(Math.max(this.current_segment - 2, 0) / 3);
    let ending_group = Math.floor(
      Math.min(this.current_segment + 2, this.path.len - 2) / 3
    );
    let starting_bucket = binary_search(
      this.path.interests_starts,
      starting_group
    );
    let ending_bucket = binary_search(
      this.path.interests_starts,
      ending_group + 0.5
    );
    // we have 5 points per bucket
    let end_index = Math.min(
      this.path.interests_types.length - 1,
      ending_bucket * 5
    );
    for (let i = starting_bucket * 5; i <= end_index; i++) {
      let index = this.path.interests_on_path[i];
      let interest_point = this.path.interest_point(index);
      let color = this.path.interest_color(i);
      let c = interest_point.coordinates(
        this.position,
        this.adjusted_cos_direction,
        this.adjusted_sin_direction,
        this.scale_factor
      );
      g.setColor(color).fillCircle(c[0], c[1], 5);
    }
  }
  display_stats(orientation) {
    let remaining_forward_distance = this.remaining_distance(0);
    let remaining_backward_distance = this.remaining_distance(1);
    let rounded_forward_distance =
      Math.round(remaining_forward_distance / 100) / 10;
    let total = Math.round(this.remaining_distances[0] / 100) / 10;
    let now = new Date();
    let minutes = now.getMinutes().toString();
    if (minutes.length < 2) {
      minutes = "0" + minutes;
    }
    let hours = now.getHours().toString();
    // now, distance to next point in meters
    g.setFont("6x8:2")
      .setColor(g.theme.fg)
      .drawString(
        "" + this.distance_to_next_point + "m",
        0,
        g.getHeight() - 49
      );

    let point_time = this.old_times[this.old_times.length - 1];
    let done_in = point_time - this.starting_time;
    let approximate_speed = Math.round(
      (this.advanced_distance * 3.6) / done_in
    );

    let forward_eta = compute_eta(
      now.getHours(),
      now.getMinutes(),
      approximate_speed,
      remaining_forward_distance / 1000
    );

    let backward_eta = compute_eta(
      now.getHours(),
      now.getMinutes(),
      approximate_speed,
      remaining_backward_distance / 1000
    );

    // display backward ETA
    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .setColor(g.theme.fg)
      .drawString(backward_eta, 0, 30);
    // display the clock
    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .setColor(g.theme.fg)
      .drawString(hours + ":" + minutes, 0, 48);
    // now display ETA
    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .setColor(g.theme.fg)
      .drawString(forward_eta, 0, 66);

    // display speed (avg and instant)
    let approximate_instant_speed = Math.round(this.instant_speed * 3.6);
    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .drawString(
        "" + approximate_speed + "km/h (in." + approximate_instant_speed + ")",
        0,
        g.getHeight() - 15
      );

    // display distance on path
    g.setFont("6x8:2").drawString(
      "" + rounded_forward_distance + "/" + total,
      0,
      g.getHeight() - 32
    );

    // display various indicators
    if (this.distance_to_next_point <= 100) {
      if (this.path.is_waypoint(this.reaching)) {
        g.setColor(0.0, 1.0, 0.0)
          .setFont("6x15")
          .drawString("turn", g.getWidth() - 50, 30);
      }
    }
    if (!this.on_path) {
      g.setColor(1.0, 0.0, 0.0)
        .setFont("6x15")
        .drawString("lost", g.getWidth() - 55, 35);
    }
  }
  display_map() {
    // don't display all segments, only those neighbouring current segment
    // this is most likely to be the correct display
    // while lowering the cost a lot
    //
    // note that all code is inlined here to speed things up from 400ms to 200ms
    let start = Math.max(this.current_segment - 4, 0);
    let end = Math.min(this.current_segment + 6, this.path.len);
    let pos = this.position;
    let cos = this.adjusted_cos_direction;
    let sin = this.adjusted_sin_direction;
    let points = this.path.points;
    let cx = pos.lon;
    let cy = pos.lat;
    let half_width = g.getWidth() / 2;
    let half_height = g.getHeight() / 2;
    let previous_x = null;
    let previous_y = null;
    let scale_factor = this.scale_factor;

    // display direction to next point if lost
    if (!this.on_path) {
      let next_point = this.path.point(this.current_segment + 1);
      let previous_point = this.path.point(this.current_segment);
      let nearest_point;
      if (
        previous_point.fake_distance(this.position) <
        next_point.fake_distance(this.position)
      ) {
        nearest_point = previous_point;
      } else {
        nearest_point = next_point;
      }
      let tx = (nearest_point.lon - cx) * scale_factor;
      let ty = (nearest_point.lat - cy) * scale_factor;
      let rotated_x = tx * cos - ty * sin;
      let rotated_y = tx * sin + ty * cos;
      let x = half_width - Math.round(rotated_x); // x is inverted
      let y = half_height + Math.round(rotated_y);
      g.setColor(g.theme.fgH).drawLine(half_width, half_height, x, y);
    }

    // now display path
    for (let i = start; i < end; i++) {
      let tx = (points[2 * i] - cx) * scale_factor;
      let ty = (points[2 * i + 1] - cy) * scale_factor;
      let rotated_x = tx * cos - ty * sin;
      let rotated_y = tx * sin + ty * cos;
      let x = half_width - Math.round(rotated_x); // x is inverted
      let y = half_height + Math.round(rotated_y);
      if (previous_x !== null) {
        let segment_color = g.theme.fg;
        if (i == this.current_segment + 1 || i == this.current_segment + 2) {
          segment_color = 0xf800;
        }
        g.setColor(segment_color);
        g.drawLine(previous_x, previous_y, x, y);

        if (this.path.is_waypoint(i - 1)) {
          g.setColor(g.theme.fg);
          g.fillCircle(previous_x, previous_y, 6);
          g.setColor(g.theme.bg);
          g.fillCircle(previous_x, previous_y, 5);
        }
        if (settings.display_points) {
          g.setColor(g.theme.fg);
          g.fillCircle(previous_x, previous_y, 4);
          g.setColor(g.theme.bg);
          g.fillCircle(previous_x, previous_y, 3);
        }
      }

      previous_x = x;
      previous_y = y;
    }

    if (this.path.is_waypoint(end - 1)) {
      g.setColor(g.theme.fg);
      g.fillCircle(previous_x, previous_y, 6);
      g.setColor(g.theme.bg);
      g.fillCircle(previous_x, previous_y, 5);
    }
    g.setColor(g.theme.fg);
    g.fillCircle(previous_x, previous_y, 4);
    g.setColor(g.theme.bg);
    g.fillCircle(previous_x, previous_y, 3);

    // now display ourselves
    g.setColor(g.theme.fgH);
    g.fillCircle(half_width, half_height, 5);

    // display current-segment's projection
    let tx = (this.projected_point.lon - cx) * scale_factor;
    let ty = (this.projected_point.lat - cy) * scale_factor;
    let rotated_x = tx * cos - ty * sin;
    let rotated_y = tx * sin + ty * cos;
    let x = half_width - Math.round(rotated_x); // x is inverted
    let y = half_height + Math.round(rotated_y);
    g.setColor(g.theme.fgH);
    g.fillCircle(x, y, 4);
  }
}

function load_gpc(filename) {
  let buffer = require("Storage").readArrayBuffer(filename);
  let file_size = buffer.length;
  let offset = 0;

  // header
  let header = Uint16Array(buffer, offset, 5);
  offset += 5 * 2;
  let key = header[0];
  let version = header[1];
  let points_number = header[2];
  if (key != code_key || version > file_version) {
    E.showMessage("Invalid gpc file");
    load();
  }

  // path points
  let points = Float64Array(buffer, offset, points_number * 2);
  offset += 8 * points_number * 2;

  // path waypoints
  let waypoints_len = Math.ceil(points_number / 8.0);
  let waypoints = Uint8Array(buffer, offset, waypoints_len);
  offset += waypoints_len;

  // interest points
  let interests_number = header[3];
  let interests_coordinates = Float64Array(
    buffer,
    offset,
    interests_number * 2
  );
  offset += 8 * interests_number * 2;
  let interests_types = Uint8Array(buffer, offset, interests_number);
  offset += interests_number;

  // interests on path
  let interests_on_path_number = header[4];
  let interests_on_path = Uint16Array(buffer, offset, interests_on_path_number);
  offset += 2 * interests_on_path_number;
  let starts_length = Math.ceil(interests_on_path_number / 5.0);
  let interests_starts = Uint16Array(buffer, offset, starts_length);
  offset += 2 * starts_length;

  let path_data = [
    points,
    waypoints,
    interests_coordinates,
    interests_types,
    interests_on_path,
    interests_starts,
  ];

  // checksum file size
  if (offset != file_size) {
    console.log("invalid file size", file_size, "expected", offset);
    let msg = "invalid file\nsize " + file_size + "\ninstead of" + offset;
    E.showAlert(msg).then(function () {
      E.showAlert();
      start_gipy(filename, path_data);
    });
  } else {
    start_gipy(filename, path_data);
  }
}

class Path {
  constructor(arrays) {
    this.points = arrays[0];
    this.waypoints = arrays[1];
    this.interests_coordinates = arrays[2];
    this.interests_types = arrays[3];
    this.interests_on_path = arrays[4];
    this.interests_starts = arrays[5];
  }

  is_waypoint(point_index) {
    let i = Math.floor(point_index / 8);
    let subindex = point_index % 8;
    let r = this.waypoints[i] & (1 << subindex);
    return r != 0;
  }

  // return point at given index
  point(index) {
    let lon = this.points[2 * index];
    let lat = this.points[2 * index + 1];
    return new Point(lon, lat);
  }

  interest_point(index) {
    let lon = this.interests_coordinates[2 * index];
    let lat = this.interests_coordinates[2 * index + 1];
    return new Point(lon, lat);
  }

  interest_color(index) {
    return interests_colors[this.interests_types[index]];
  }

  // return index of segment which is nearest from point.
  // we need a direction because we need there is an ambiguity
  // for overlapping segments which are taken once to go and once to come back.
  // (in the other direction).
  nearest_segment(point, start, end, cos_direction, sin_direction) {
    // we are going to compute two min distances, one for each direction.
    let indices = [0, 0];
    let mins = [Number.MAX_VALUE, Number.MAX_VALUE];

    let p1 = new Point(this.points[2 * start], this.points[2 * start + 1]);
    for (let i = start + 1; i < end + 1; i++) {
      let p2 = new Point(this.points[2 * i], this.points[2 * i + 1]);

      let closest_point = point.closest_segment_point(p1, p2);
      let distance = point.length_squared(closest_point);

      let dot =
        cos_direction * (p2.lon - p1.lon) + sin_direction * (p2.lat - p1.lat);
      let orientation = +(dot < 0); // index 0 is good orientation
      if (distance <= mins[orientation]) {
        mins[orientation] = distance;
        indices[orientation] = i - 1;
      }

      p1 = p2;
    }

    // by default correct orientation (0) wins
    // but if other one is really closer, return other one
    if (mins[1] < mins[0] / 100.0) {
      return [1, indices[1]];
    } else {
      return [0, indices[0]];
    }
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
  coordinates(current_position, cos_direction, sin_direction, scale_factor) {
    let translated = this.minus(current_position).times(scale_factor);
    let rotated_x =
      translated.lon * cos_direction - translated.lat * sin_direction;
    let rotated_y =
      translated.lon * sin_direction + translated.lat * cos_direction;
    return [
      g.getWidth() / 2 - Math.round(rotated_x), // x is inverted
      g.getHeight() / 2 + Math.round(rotated_y),
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
    let londiff = this.lon - other_point.lon;
    let latdiff = this.lat - other_point.lat;
    return londiff * londiff + latdiff * latdiff;
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
    const phi1 = (this.lat * Math.PI) / 180;
    const phi2 = (other_point.lat * Math.PI) / 180;
    const deltaphi = ((other_point.lat - this.lat) * Math.PI) / 180;
    const deltalambda = ((other_point.lon - this.lon) * Math.PI) / 180;

    const a =
      Math.sin(deltaphi / 2) * Math.sin(deltaphi / 2) +
      Math.cos(phi1) *
        Math.cos(phi2) *
        Math.sin(deltalambda / 2) *
        Math.sin(deltalambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  }
  fake_distance(other_point) {
    return Math.sqrt(this.length_squared(other_point));
  }
  // return closest point from 'this' on [v,w] segment.
  // since this function is critical we inline all code here.
  closest_segment_point(v, w) {
    // from : https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    // Return minimum distance between line segment vw and point p
    let segment_londiff = w.lon - v.lon;
    let segment_latdiff = w.lat - v.lat;
    let l2 =
      segment_londiff * segment_londiff + segment_latdiff * segment_latdiff; // i.e. |w-v|^2 -  avoid a sqrt
    if (l2 == 0.0) {
      return v; // v == w case
    }
    // Consider the line extending the segment, parameterized as v + t (w - v).
    // We find projection of point p onto the line.
    // It falls where t = [(p-v) . (w-v)] / |w-v|^2
    // We clamp t from [0,1] to handle points outside the segment vw.

    // let t = Math.max(0, Math.min(1, this.minus(v).dot(w.minus(v)) / l2)); //inlined below
    let start_londiff = this.lon - v.lon;
    let start_latdiff = this.lat - v.lat;
    let t =
      (start_londiff * segment_londiff + start_latdiff * segment_latdiff) / l2;
    if (t < 0) {
      t = 0;
    } else {
      if (t > 1) {
        t = 1;
      }
    }
    let lon = v.lon + segment_londiff * t;
    let lat = v.lat + segment_latdiff * t;
    return new Point(lon, lat);
  }
}

let fake_gps_point = 0.0;
function simulate_gps(status) {
  // let's keep the screen on in simulations
  Bangle.setLCDTimeout(0);
  Bangle.setLCDPower(1);
  if (fake_gps_point > status.path.len - 1) {
    return;
  }
  let point_index = Math.floor(fake_gps_point);
  if (point_index >= status.path.len / 2 - 1) {
    return;
  }
  let p1 = status.path.point(2 * point_index); // use these to approximately follow path
  let p2 = status.path.point(2 * (point_index + 1));
  //let p1 = status.path.point(point_index); // use these to strictly follow path
  //let p2 = status.path.point(point_index + 1);

  let alpha = fake_gps_point - point_index;
  let pos = p1.times(1 - alpha).plus(p2.times(alpha));
  let old_pos = status.position;

  fake_gps_point += 0.05; // advance simulation
  // status.update_position(new Point(1, 1), null); // uncomment to be always lost
  status.update_position(pos, null);
}

function drawMenu() {
  const menu = {
    "": { title: "choose trace" },
  };
  var files = require("Storage").list(".gpc");
  for (var i = 0; i < files.length; ++i) {
    menu[files[i]] = start.bind(null, files[i]);
  }
  menu["Exit"] = function () {
    load();
  };
  E.showMenu(menu);
}

function start(fn) {
  E.showMenu();
  console.log("loading", fn);

  load_gpc(fn);
}

function start_gipy(filename, path_data) {
  console.log("starting");
  let path = new Path(path_data);
  let status = new Status(path);

  if (simulated) {
    status.starting_time = getTime();
    status.position = new Point(status.path.point(0));
    setInterval(simulate_gps, 500, status);
  } else {
    // let's display splash screen while waiting for gps signal
    g.clear();
    g.drawImage(splashscreen, 0, 0);
    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .setColor(0xf800)
      .drawString(filename, 0, g.getHeight() - 30);

    Bangle.setLocked(false);

    let frame = 0;
    let set_coordinates = function (data) {
      frame += 1;
      // 0,0 coordinates are considered invalid since we sometimes receive them out of nowhere
      let valid_coordinates =
        !isNaN(data.lat) &&
        !isNaN(data.lon) &&
        (data.lat != 0.0 || data.lon != 0.0);
      if (valid_coordinates) {
        if (status.starting_time === null) {
          status.starting_time = getTime();
          Bangle.loadWidgets(); // i don't know why i cannot load them at start : they would display on splash screen
        }
        status.update_position(new Point(data.lon, data.lat), null);
      }
      let gps_status_color;
      if (frame % 2 == 0 || valid_coordinates) {
        gps_status_color = g.theme.bg;
      } else {
        gps_status_color = g.theme.fg;
      }
      g.setColor(gps_status_color)
        .setFont("6x8:2")
        .drawString("gps", g.getWidth() - 40, 30);
    };

    Bangle.setGPSPower(true, "gipy");
    Bangle.on("GPS", set_coordinates);
    Bangle.on("lock", function (on) {
      if (!on) {
        Bangle.setGPSPower(true, "gipy"); // activate gps when unlocking
      }
    });
  }
}

let files = require("Storage").list(".gpc");
if (files.length <= 1) {
  if (files.length == 0) {
    load();
  } else {
    start(files[0]);
  }
} else {
  drawMenu();
}
