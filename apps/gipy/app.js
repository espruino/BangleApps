let simulated = false;
let file_version = 3;
let code_key = 47490;

var settings = Object.assign(
  {
    keep_gps_alive: true,
    max_speed: 35,
  },
  require("Storage").readJSON("gipy.json", true) || {}
);

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

class Status {
  constructor(path) {
    this.path = path;
    this.on_path = false; // are we on the path or lost ?
    this.position = null; // where we are
    this.adjusted_cos_direction = null; // cos of where we look at
    this.adjusted_sin_direction = null; // sin of where we look at
    this.current_segment = null; // which segment is closest
    this.reaching = null; // which waypoint are we reaching ?
    this.distance_to_next_point = null; // how far are we from next point ?
    this.paused_time = 0.0; // how long did we stop (stops don't count in avg speed)
    this.paused_since = getTime();

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
    this.starting_time = this.paused_since; // time we start
    this.advanced_distance = 0.0;
    this.gps_coordinates_counter = 0; // how many coordinates did we receive
    this.old_points = [];
    this.old_times = [];
  }
  new_position_reached(position) {
    // we try to figure out direction by looking at previous points
    // instead of the gps course which is not very nice.
    this.gps_coordinates_counter += 1;
    let now = getTime();
    this.old_points.push(position);
    this.old_times.push(now);

    if (this.old_points.length == 1) {
      return null;
    }

    let last_point = this.old_points[this.old_points.length - 1];
    let oldest_point = this.old_points[0];

    // every 7 points we count the distance
    if (this.gps_coordinates_counter % 7 == 0) {
      let distance = last_point.distance(oldest_point);
      if (distance < 150.0) {
        // to avoid gps glitches
        this.advanced_distance += distance;
      }
    }

    if (this.old_points.length == 8) {
      let p1 = this.old_points[0]
        .plus(this.old_points[1])
        .plus(this.old_points[2])
        .plus(this.old_points[3])
        .times(1 / 4);
      let p2 = this.old_points[4]
        .plus(this.old_points[5])
        .plus(this.old_points[6])
        .plus(this.old_points[7])
        .times(1 / 4);
      let t1 = (this.old_times[1] + this.old_times[2]) / 2;
      let t2 = (this.old_times[5] + this.old_times[6]) / 2;
      this.instant_speed = p1.distance(p2) / (t2 - t1);
      this.old_points.shift();
      this.old_times.shift();
    } else {
      this.instant_speed =
        oldest_point.distance(last_point) / (now - this.old_times[0]);

      // update paused time if we are too slow
      if (this.instant_speed < 2) {
        if (this.paused_since === null) {
          this.paused_since = now;
        }
      } else {
        if (this.paused_since !== null) {
          this.paused_time += now - this.paused_since;
          this.paused_since = null;
        }
      }
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
  is_lost(segment) {
    let distance_to_nearest = this.position.distance_to_segment(
      this.path.point(segment),
      this.path.point(segment + 1)
    );
    return distance_to_nearest > 50;
  }
  display(orientation) {
    g.clear();
    this.display_map();

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
        this.adjusted_sin_direction
      );
      g.setColor(color).fillCircle(c[0], c[1], 5);
    }
  }
  display_stats(orientation) {
    let remaining_distance = this.remaining_distance(orientation);
    let rounded_distance = Math.round(remaining_distance / 100) / 10;
    let total = Math.round(this.remaining_distances[0] / 100) / 10;
    let now = new Date();
    let minutes = now.getMinutes().toString();
    if (minutes.length < 2) {
      minutes = "0" + minutes;
    }
    let hours = now.getHours().toString();
    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .setColor(g.theme.fg)
      .drawString(hours + ":" + minutes, 0, 30);

    g.setFont("6x8:2").drawString(
      "" + this.distance_to_next_point + "m",
      0,
      g.getHeight() - 49
    );

    let point_time = this.old_times[this.old_times.length - 1];
    let done_in = point_time - this.starting_time - this.paused_time;
    let approximate_speed = Math.round(
      (this.advanced_distance * 3.6) / done_in
    );
    let approximate_instant_speed = Math.round(this.instant_speed * 3.6);

    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .drawString(
        "" + approximate_speed + "km/h (in." + approximate_instant_speed + ")",
        0,
        g.getHeight() - 15
      );

    g.setFont("6x8:2").drawString(
      "" + rounded_distance + "/" + total,
      0,
      g.getHeight() - 32
    );

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
    for (let i = start; i < end; i++) {
      let tx = (points[2 * i] - cx) * 40000.0;
      let ty = (points[2 * i + 1] - cy) * 40000.0;
      let rotated_x = tx * cos - ty * sin;
      let rotated_y = tx * sin + ty * cos;
      let x = half_width - Math.round(rotated_x); // x is inverted
      let y = half_height + Math.round(rotated_y);
      if (previous_x !== null) {
        if (i == this.current_segment + 1) {
          g.setColor(0.0, 1.0, 0.0);
        } else {
          g.setColor(1.0, 0.0, 0.0);
        }
        g.drawLine(previous_x, previous_y, x, y);

        if (this.path.is_waypoint(i - 1)) {
          g.setColor(g.theme.fg);
          g.fillCircle(previous_x, previous_y, 6);
          g.setColor(g.theme.bg);
          g.fillCircle(previous_x, previous_y, 5);
        }
        g.setColor(g.theme.fg);
        g.fillCircle(previous_x, previous_y, 4);
        g.setColor(g.theme.bg);
        g.fillCircle(previous_x, previous_y, 3);
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

    // display old points for direction debug
    //  for (let i = 0; i < this.old_points.length; i++) {
    //    let tx = (this.old_points[i].lon - cx) * 40000.0;
    //    let ty = (this.old_points[i].lat - cy) * 40000.0;
    //    let rotated_x = tx * cos - ty * sin;
    //    let rotated_y = tx * sin + ty * cos;
    //    let x = half_width - Math.round(rotated_x); // x is inverted
    //    let y = half_height + Math.round(rotated_y);
    //    g.setColor((i + 1) / 4.0, 0.0, 0.0);
    //    g.fillCircle(x, y, 3);
    //  }

    // display current-segment's projection for debug
    let projection = pos.closest_segment_point(
      this.path.point(this.current_segment),
      this.path.point(this.current_segment + 1)
    );

    let tx = (projection.lon - cx) * 40000.0;
    let ty = (projection.lat - cy) * 40000.0;
    let rotated_x = tx * cos - ty * sin;
    let rotated_y = tx * sin + ty * cos;
    let x = half_width - Math.round(rotated_x); // x is inverted
    let y = half_height + Math.round(rotated_y);
    g.setColor(g.theme.fg);
    g.fillCircle(x, y, 4);

    // display direction to next point if lost
    if (!this.on_path) {
      let next_point = this.path.point(this.current_segment + 1);
      let diff = next_point.minus(this.position);
      let angle = Math.atan2(diff.lat, diff.lon);
      let tx = Math.cos(angle) * 50.0;
      let ty = Math.sin(angle) * 50.0;
      let rotated_x = tx * cos - ty * sin;
      let rotated_y = tx * sin + ty * cos;
      let x = half_width - Math.round(rotated_x); // x is inverted
      let y = half_height + Math.round(rotated_y);
      g.setColor(g.theme.fgH).drawLine(half_width, half_height, x, y);
    }
  }
}

function load_gpc(filename) {
  let buffer = require("Storage").readArrayBuffer(filename);
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

  return [
    points,
    waypoints,
    interests_coordinates,
    interests_types,
    interests_on_path,
    interests_starts,
  ];
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

  // execute op on all segments.
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
    this.on_segments(
      function (p1, p2, i) {
        // we use the dot product to figure out if oriented correctly
        // let distance = point.fake_distance_to_segment(p1, p2);

        let projection = point.closest_segment_point(p1, p2);
        let distance = point.fake_distance(projection);

        //        let d = projection.minus(point).times(40000.0);
        //        let rotated_x = d.lon * acos - d.lat * asin;
        //        let rotated_y = d.lon * asin + d.lat * acos;
        //        let x = g.getWidth() / 2 - Math.round(rotated_x); // x is inverted
        //        let y = g.getHeight() / 2 + Math.round(rotated_y);
        //
        let diff = p2.minus(p1);
        let dot = cos_direction * diff.lon + sin_direction * diff.lat;
        let orientation = +(dot < 0); // index 0 is good orientation
        //        g.setColor(0.0, 0.0 + orientation, 1.0 - orientation).fillCircle(
        //          x,
        //          y,
        //          10
        //        );
        if (distance <= mins[orientation]) {
          mins[orientation] = distance;
          indices[orientation] = i - 1;
        }
      },
      start,
      end
    );
    // by default correct orientation (0) wins
    // but if other one is really closer, return other one
    if (mins[1] < mins[0] / 10.0) {
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
  coordinates(current_position, cos_direction, sin_direction) {
    let translated = this.minus(current_position).times(40000.0);
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
    let d = this.minus(other_point);
    return d.lon * d.lon + d.lat * d.lat;
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
  closest_segment_point(v, w) {
    // from : https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    // Return minimum distance between line segment vw and point p
    let l2 = v.length_squared(w); // i.e. |w-v|^2 -  avoid a sqrt
    if (l2 == 0.0) {
      return v; // v == w case
    }
    // Consider the line extending the segment, parameterized as v + t (w - v).
    // We find projection of point p onto the line.
    // It falls where t = [(p-v) . (w-v)] / |w-v|^2
    // We clamp t from [0,1] to handle points outside the segment vw.
    let t = Math.max(0, Math.min(1, this.minus(v).dot(w.minus(v)) / l2));
    return v.plus(w.minus(v).times(t)); // Projection falls on the segment
  }
  distance_to_segment(v, w) {
    let projection = this.closest_segment_point(v, w);
    return this.distance(projection);
  }
  fake_distance_to_segment(v, w) {
    let projection = this.closest_segment_point(v, w);
    return this.fake_distance(projection);
  }
}

Bangle.loadWidgets();

let fake_gps_point = 0.0;
function simulate_gps(status) {
  if (fake_gps_point > status.path.len - 1) {
    return;
  }
  let point_index = Math.floor(fake_gps_point);
  if (point_index >= status.path.len) {
    return;
  }
  //let p1 = status.path.point(0);
  //let n = status.path.len;
  //let p2 = status.path.point(n - 1);
  let p1 = status.path.point(point_index);
  let p2 = status.path.point(point_index + 1);

  let alpha = fake_gps_point - point_index;
  let pos = p1.times(1 - alpha).plus(p2.times(alpha));
  let old_pos = status.position;

  fake_gps_point += 0.05; // advance simulation
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

  // let path = new Path(load_gpx("test.gpx"));
  let path = new Path(load_gpc(fn));
  let status = new Status(path);

  if (simulated) {
    status.position = new Point(status.path.point(0));
    setInterval(simulate_gps, 500, status);
  } else {
    // let's display start while waiting for gps signal
    let p1 = status.path.point(0);
    let p2 = status.path.point(1);
    let diff = p2.minus(p1);
    let direction = Math.atan2(diff.lat, diff.lon);
    Bangle.setLocked(false);
    status.update_position(p1, direction);

    let frame = 0;
    let set_coordinates = function (data) {
      frame += 1;
      // 0,0 coordinates are considered invalid since we sometimes receive them out of nowhere
      let valid_coordinates =
        !isNaN(data.lat) &&
        !isNaN(data.lon) &&
        (data.lat != 0.0 || data.lon != 0.0);
      if (valid_coordinates) {
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
