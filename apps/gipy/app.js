let simulated = false;
let displaying = false;
let in_menu = false;
let go_backwards = false;
let status;

let initial_options = Bangle.getOptions();

let interests_colors = [
  [1, 1, 1], // Waypoints, white
  [1, 0, 0], // Bakery, red
  [0, 0, 1], // DrinkingWater, blue
  [0, 1, 1], // Toilets, cyan
  [0, 1, 0], // Artwork, green
];

let Y_OFFSET = 20;

// some constants for screen types
let MAP = 0;
//let HEIGHTS_ZOOMED_IN = 1;
let HEIGHTS_FULL = 2;

let s = require("Storage");

var settings = Object.assign(
  {
    lost_distance: 50,
    wake_up_speed: 13,
    active_time: 10,
    brightness: 0.5,
    buzz_on_turns: false,
    disable_bluetooth: false,
    power_lcd_off: false,
    powersave_by_default: false,
    sleep_between_waypoints: false,
  },
  s.readJSON("gipy.json", true) || {}
);

let powersaving = settings.powersave_by_default;

// let profile_start_times = [];

// function start_profiling() {
//   profile_start_times.push(getTime());
// }

// function end_profiling(label) {
//   let end_time = getTime();
//   let elapsed = end_time - profile_start_times.pop();
//   console.log("profile:", label, "took", elapsed);
// }

// return the index of the largest element of the array which is <= x
function binary_search(array, x) {
  let start = 0,
    end = array.length;

  while (end - start >= 0) {
    let mid = Math.floor((start + end) / 2);
    if (array[mid] == x) {
      return mid;
    } else if (array[mid] < x) {
      if (array[mid + 1] > x) {
        return mid;
      }
      start = mid + 1;
    } else end = mid - 1;
  }
  if (array[start] > x) {
    return null;
  } else {
    return start;
  }
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
  let eta_in_minutes = Math.round(hour * 60 + minutes + time_needed);
  let eta_minutes = eta_in_minutes % 60;
  let eta_hour = ((eta_in_minutes - eta_minutes) / 60) % 24;
  if (eta_minutes < 10) {
    return eta_hour.toString() + ":0" + eta_minutes;
  } else {
    return eta_hour.toString() + ":" + eta_minutes;
  }
}

class TilesOffsets {
  constructor(filename, offset, bytes_per_tile_index) {
    let header = E.toArrayBuffer(s.read(filename, offset, 4));
    let type_size = Uint8Array(header, 0, 1)[0];
    offset += 1;
    this.entry_size = Uint8Array(header, 1, 1)[0];
    offset += 1;
    let non_empty_tiles_number = Uint16Array(header, 2, 1)[0];
    offset += 2;

    let bytes = (type_size==24)?3:2;
    let buffer = E.toArrayBuffer(s.read(filename, offset, bytes_per_tile_index*non_empty_tiles_number));
    if (bytes_per_tile_index == 2) {
      this.non_empty_tiles = Uint16Array(buffer, 0, non_empty_tiles_number);
    } else {
      this.non_empty_tiles = Uint24Array(buffer, 0, non_empty_tiles_number);
    }
    offset += bytes_per_tile_index * non_empty_tiles_number;
    let tile_buffer = E.toArrayBuffer(s.read(filename, offset, bytes*non_empty_tiles_number));
    if (type_size == 24) {
      this.non_empty_tiles_ends = Uint24Array(
        tile_buffer,
        0,
        non_empty_tiles_number
      );
    } else if (type_size == 16) {
      this.non_empty_tiles_ends = Uint16Array(
        tile_buffer,
        0,
        non_empty_tiles_number
      );
    } else {
      throw "unknown size";
    }
    offset += bytes * non_empty_tiles_number;
    return [this, offset];
  }
  tile_start_offset(tile_index) {
    if (tile_index <= this.non_empty_tiles[0]) {
      return 0;
    } else {
      return this.tile_end_offset(tile_index - 1);
    }
  }
  tile_end_offset(tile_index) {
    let me_or_before = binary_search(this.non_empty_tiles, tile_index);
    if (me_or_before === null) {
      return 0;
    }
    if (me_or_before >= this.non_empty_tiles_ends.length) {
      return (
        this.non_empty_tiles_ends[this.non_empty_tiles.length - 1] *
        this.entry_size
      );
    } else {
      return this.non_empty_tiles_ends[me_or_before] * this.entry_size;
    }
  }
  end_offset() {
    return (
      this.non_empty_tiles_ends[this.non_empty_tiles_ends.length - 1] *
      this.entry_size
    );
  }
}

class Map {
  constructor(filename, offset) {
    // header

    let header = E.toArrayBuffer(s.read(filename, offset, 43));
    let color_array = Uint8Array(header, 0, 3);
    this.color = [
      color_array[0] / 255,
      color_array[1] / 255,
      color_array[2] / 255,
    ];
    offset += 3;
    this.first_tile = Int32Array(header, 3, 2); // absolute tile id of first tile
    offset += 2 * 4;
    this.grid_size = Uint32Array(header, 11, 2); // tiles width and height
    offset += 2 * 4;
    this.start_coordinates = Float64Array(header, 19, 2); // min x and y coordinates
    offset += 2 * 8;
    let side_array = Float64Array(header, 35, 1); // side of a tile
    this.side = side_array[0];
    offset += 8;

    // tiles offsets
    let bytes_per_tile_index = (this.grid_size[0] * this.grid_size[1] > 65536)?3:2;
    let res = new TilesOffsets(filename, offset, bytes_per_tile_index);
    this.tiles_offsets = res[0];
    offset = res[1];

    // now, do binary ways
    // since the file is so big we'll go line by line
    let binary_lines = [];
    for (let y = 0; y < this.grid_size[1]; y++) {
      let first_tile_start = this.tiles_offsets.tile_start_offset(
        y * this.grid_size[0]
      );
      let last_tile_end = this.tiles_offsets.tile_start_offset(
        (y + 1) * this.grid_size[0]
      );
      let size = last_tile_end - first_tile_start;
      let string = s.read(filename, offset + first_tile_start, size);
      let array = Uint8Array(E.toArrayBuffer(string));
      binary_lines.push(array);
    }
    this.binary_lines = binary_lines;
    offset += this.tiles_offsets.end_offset();

    return [this, offset];

    // now do streets data header
    // let streets_header = E.toArrayBuffer(s.read(filename, offset, 8));
    // let streets_header_offset = 0;
    // let full_streets_size = Uint32Array(
    //   streets_header,
    //   streets_header_offset,
    //   1
    // )[0];
    // streets_header_offset += 4;
    // let blocks_number = Uint16Array(
    //   streets_header,
    //   streets_header_offset,
    //   1
    // )[0];
    // streets_header_offset += 2;
    // let labels_string_size = Uint16Array(
    //   streets_header,
    //   streets_header_offset,
    //   1
    // )[0];
    // streets_header_offset += 2;
    // offset += streets_header_offset;

    // // continue with main streets labels
    // main_streets_labels = s.read(filename, offset, labels_string_size);
    // // this.main_streets_labels = main_streets_labels.split(/\r?\n/);
    // this.main_streets_labels = main_streets_labels.split(/\n/);
    // offset += labels_string_size;

    // // continue with blocks start offsets
    // this.blocks_offsets = Uint32Array(
    //   E.toArrayBuffer(s.read(filename, offset, blocks_number * 4))
    // );
    // offset += blocks_number * 4;

    // // continue with compressed street blocks
    // let encoded_blocks_size =
    //   full_streets_size - 4 - 2 - 2 - labels_string_size - blocks_number * 4;
    // this.compressed_streets = Uint8Array(
    //   E.toArrayBuffer(s.read(filename, offset, encoded_blocks_size))
    // );
    // offset += encoded_blocks_size;
  }

  add_to_tile_image(img, absolute_tile_x, absolute_tile_y) {
    let tile_x = absolute_tile_x - this.first_tile[0];
    let tile_y = absolute_tile_y - this.first_tile[1];
    let side = img.getWidth() - 6;

    let thick = this.color[0] == 1;
    img.setColor(this.color[0], this.color[1], this.color[2]);

    let tile_num = tile_x + tile_y * this.grid_size[0];

    let line_start_offset = this.tiles_offsets.tile_start_offset(
      tile_y * this.grid_size[0]
    );
    let offset =
      this.tiles_offsets.tile_start_offset(tile_num) - line_start_offset;
    let upper_limit =
      this.tiles_offsets.tile_end_offset(tile_num) - line_start_offset;

    let line = this.binary_lines[tile_y];
    for (let i = offset; i < upper_limit; i += 4) {
      let x1 = (line.buffer[i] / 255) * side + 3;
      let y1 = ((255 - line.buffer[i + 1]) / 255) * side + 3;
      let x2 = (line.buffer[i + 2] / 255) * side + 3;
      let y2 = ((255 - line.buffer[i + 3]) / 255) * side + 3;

      let thickness = 1;
      if (thick) {
        thickness = 3.5;
      }

      let xdiff = x2 - x1;
      let ydiff = y2 - y1;
      let d = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
      let ox = (-ydiff / d) * thickness;
      let oy = (xdiff / d) * thickness;
      img.fillPoly([
        x1 + ox,
        y1 + oy,
        x2 + ox,
        y2 + oy,
        x2 - ox,
        y2 - oy,
        x1 - ox,
        y1 - oy,
      ]);

      // } else {
      // img.drawLine(x1, y1, x2, y2);

      // }
    }
  }
}

class Interests {
  constructor(filename, offset) {
    let header = E.toArrayBuffer(s.read(filename, offset, 40));
    this.first_tile = Int32Array(header, 0, 2); // absolute tile id of first tile
    offset += 2 * 4;
    this.grid_size = Uint32Array(header, 8, 2); // tiles width and height
    offset += 2 * 4;
    this.start_coordinates = Float64Array(header, 16, 2); // min x and y coordinates
    offset += 2 * 8;
    let side_array = Float64Array(header, 32, 1); // side of a tile
    this.side = side_array[0];
    offset += 8;

    let bytes_per_tile_index = (this.grid_size[0] * this.grid_size[1] > 65536)?3:2;
    let res = new TilesOffsets(filename, offset, bytes_per_tile_index);
    offset = res[1];
    this.offsets = res[0];
    let end = this.offsets.end_offset();
    this.binary_interests = new Uint8Array(end);
    let buffer = E.toArrayBuffer(s.read(filename, offset, end));
    this.binary_interests = Uint8Array(buffer);
    offset += end;
    return [this, offset];
  }

  add_to_tile_image(img, absolute_tile_x, absolute_tile_y) {
    let tile_x = absolute_tile_x - this.first_tile[0];
    let tile_y = absolute_tile_y - this.first_tile[1];
    let side = img.getWidth() - 6;

    let tile_num = tile_x + tile_y * this.grid_size[0];

    let offset = this.offsets.tile_start_offset(tile_num);
    let upper_limit = this.offsets.tile_end_offset(tile_num);

    let buffer = this.binary_interests;
    for (let i = offset; i < upper_limit; i += 3) {
      let type = buffer[i];
      let x = (buffer[i + 1] / 255) * side + 3;
      let y = ((255 - buffer[i + 2]) / 255) * side + 3;

      let color = interests_colors[type];
      if (type == 0) {
        img.setColor(0, 0, 0).fillCircle(x, y, 6);
      }
      img.setColor(color[0], color[1], color[2]).fillCircle(x, y, 5);
    }
  }
}

class Status {
  constructor(path, maps, interests, heights) {
    this.path = path;
    this.default_options = true; // do we still have default options ?
    this.active = true; // should we have screen on
    this.last_activity = getTime();
    this.maps = maps;
    this.interests = interests;
    this.heights = heights;
    this.screen = MAP;
    this.on_path = true; // are we on the path or lost ?
    this.position = null; // where we are
    this.direction = 0;
    this.adjusted_cos_direction = Math.cos(-Math.PI / 2.0);
    this.adjusted_sin_direction = Math.sin(-Math.PI / 2.0);
    this.zoomed_in = true;

    this.current_segment = null; // which segment is closest
    this.reaching = null; // which waypoint are we reaching ?
    this.distance_to_next_point = null; // how far are we from next point ?
    this.projected_point = null;
    this.reset_images_cache();

    let width = g.getWidth();
    let height = g.getHeight();
    let diagonal_third = Math.sqrt(width * width + height * height) / 3;
    this.scale_factor = diagonal_third / maps[0].side; // multiply geo coordinates by this to get pixels coordinates

    if (this.path !== null) {
      //TODO: float32 ??
      let r = new Float64Array(this.path.len);
      // let's do a reversed prefix computations on all distances:
      // loop on all segments in reversed order
      let previous_point = null;
      for (let i = this.path.len - 1; i >= 0; i--) {
        let point = this.path.point(i);
        if (previous_point !== null) {
          r[i] = r[i+1] + point.distance(previous_point);
        }
        previous_point = point;
      }
      this.remaining_distances = r; // how much distance remains at start of each segment
    }
    this.starting_time = null; // time we start
    this.advanced_distance = 0.0;
    this.gps_coordinates_counter = 0; // how many coordinates did we receive
    this.old_points = []; // record previous points but only when enough distance between them
    this.old_times = []; // the corresponding times
  }
  reset_images_cache() {
    let tiles_per_diagonals = this.zoomed_in ? 3 : 5;
    let screen_width = g.getWidth();
    let screen_height = g.getHeight();
    this.images_cache = [];

    let img_side =
      Math.ceil(
        Math.sqrt(screen_width * screen_width + screen_height * screen_height) /
          tiles_per_diagonals
      ) + 6; // three extra pixels on each side to allow thick lines

    E.defrag();
    let limit = tiles_per_diagonals * (tiles_per_diagonals + 1);

    for (let i = 0; i < limit; i++) {
      let img = Graphics.createArrayBuffer(img_side, img_side, 4, {
        msb: true,
      });
      this.images_cache.push({ image: img, x: -1, y: -1 });
    }
  }
  activate() {
    if (!powersaving) {
      return;
    }
    this.last_activity = getTime();
    if (this.active) {
      return;
    } else {
      this.active = true;
      Bangle.setLCDBrightness(settings.brightness);
      Bangle.setLocked(false);
      if (settings.power_lcd_off) {
        Bangle.setLCDPower(true);
      }
    }
  }
  check_activity() {
    if (!this.active || !powersaving) {
      return;
    }
    if (getTime() - this.last_activity > settings.active_time) {
      this.active = false;
      Bangle.setLCDBrightness(0);
      if (settings.power_lcd_off) {
        Bangle.setLCDPower(false);
      }
    }
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
      // gps signal is noisy but rarely above 5 meters
      if (distance_to_previous < 5) {
        // update instant speed and return
        let oldest_point = this.old_points[0];
        let distance_to_oldest = oldest_point.distance(position);
        this.instant_speed = distance_to_oldest / (now - this.old_times[0]);
        return null;
      }
    }
    this.gps_coordinates_counter += 1;
    this.old_points.push(position);
    this.old_times.push(now);

    let oldest_point = this.old_points[0];
    let distance_to_oldest = oldest_point.distance(position);
    let time_to_oldest = now - this.old_times[0];

    // every 3 points we count the distance
    if (this.gps_coordinates_counter % 3 == 0) {
      if (time_to_oldest > 6 || distance_to_oldest < 150.0) {
        // to avoid gps glitches (sometimes the gps signal will make you jump around)
        // however if gps disconnects (time_to_oldest becomes large) we still count the distance
        // when it re-activates
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
  update_position(new_position) {
    let direction = this.new_position_reached(new_position);
    if (direction === null) {
      if (this.old_points.length > 1) {
        this.display(); // re-display because speed has changed
      }
      return;
    }
    this.direction = direction;
    if (in_menu) {
      return;
    }
    if (this.instant_speed * 3.6 < settings.wake_up_speed) {
      this.activate(); // if we go too slow turn on, we might be looking for the direction to follow
      if (!this.default_options) {
        this.default_options = true;
        Bangle.setOptions(initial_options);
      }
    } else {
      if (this.default_options && powersaving) {
        this.default_options = false;

        Bangle.setOptions({
          lockTimeout: 0,
          backlightTimeout: 0,
          lcdPowerTimeout: 0,
          hrmSportMode: 2,
          wakeOnTwist: false, // if true watch will never sleep due to speed and road bumps. tried several tresholds.
          wakeOnFaceUp: false,
          wakeOnTouch: true,
          powerSave: false,
        });
      }
    }
    this.check_activity(); // if we don't move or are in menu we should stay on

    this.adjusted_cos_direction = Math.cos(-direction - Math.PI / 2.0);
    this.adjusted_sin_direction = Math.sin(-direction - Math.PI / 2.0);
    this.angle = direction;
    let cos_direction = Math.cos(direction);
    let sin_direction = Math.sin(direction);
    this.position = new_position;

    // we will display position of where we'll be at in a few seconds
    // and not where we currently are.
    // this is because the display has more than 1sec duration.
    this.displayed_position = new Point(
      new_position.lon + cos_direction * this.instant_speed * 0.00001,
      new_position.lat + sin_direction * this.instant_speed * 0.00001
    );

    if (this.path !== null) {
      // detect segment we are on now
      let next_segment = this.path.nearest_segment(
        this.displayed_position,
        Math.max(0, this.current_segment - 1),
        Math.min(this.current_segment + 2, this.path.len - 1),
        cos_direction,
        sin_direction
      );

      if (this.is_lost(next_segment)) {
        // start_profiling();
        // it did not work, try anywhere
        next_segment = this.path.nearest_segment(
          this.displayed_position,
          0,
          this.path.len - 1,
          cos_direction,
          sin_direction
        );
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
      if (!this.on_path) {
        this.activate();
      }

      this.current_segment = next_segment;

      // check if we are nearing the next point on our path and alert the user
      let next_point = this.current_segment + (go_backwards ? 0 : 1);
      this.distance_to_next_point = Math.ceil(
        this.position.distance(this.path.point(next_point))
      );

      // disable gps when far from next point and locked
      // if (Bangle.isLocked() && !settings.keep_gps_alive) {
      //   let time_to_next_point =
      //     (this.distance_to_next_point * 3.6) / settings.max_speed;
      //   if (time_to_next_point > 60) {
      //     Bangle.setGPSPower(false, "gipy");
      //     setTimeout(function () {
      //       Bangle.setGPSPower(true, "gipy");
      //     }, time_to_next_point);
      //   }
      // }
      let reaching_waypoint = this.path.is_waypoint(next_point);
      if (this.distance_to_next_point <= 100) {
        if (reaching_waypoint || !settings.sleep_between_waypoints) {
          this.activate();
        }

        if (this.reaching != next_point) {
          this.reaching = next_point;
          if (reaching_waypoint && settings.buzz_on_turns) {
            Bangle.buzz();
            setTimeout(() => Bangle.buzz(), 500);
            setTimeout(() => Bangle.buzz(), 1000);
            setTimeout(() => Bangle.buzz(), 1500);
          }
        }
      }
    }

    // abort most frames if inactive
    if (!this.active && this.gps_coordinates_counter % 5 != 0) {
      return;
    }

    // re-display
    this.display();
  }
  display_direction() {
    let scale_factor = this.scale_factor;
    if (!this.zoomed_in) {
      scale_factor *= 3/5;
    }
    //TODO: go towards point on path at 20 meter
    if (this.current_segment === null) {
      return;
    }
    let next_point = this.path.point(this.current_segment + (1 - go_backwards));

    let distance_to_next_point = Math.ceil(
      this.projected_point.distance(next_point)
    );
    let towards;
    if (distance_to_next_point < 20) {
      towards = this.path.point(this.current_segment + 2 * (1 - go_backwards));
    } else {
      towards = next_point;
    }
    let diff = towards.minus(this.projected_point);
    const direction = Math.atan2(diff.lat, diff.lon);

    let full_angle = direction - this.angle;

    const c = this.projected_point.coordinates(
      this.displayed_position,
      this.adjusted_cos_direction,
      this.adjusted_sin_direction,
      scale_factor
    );

    let cos1 = Math.cos(full_angle + 0.6 + Math.PI / 2);
    let cos2 = Math.cos(full_angle + Math.PI / 2);
    let cos3 = Math.cos(full_angle - 0.6 + Math.PI / 2);
    let sin1 = Math.sin(-full_angle - 0.6 - Math.PI / 2);
    let sin2 = Math.sin(-full_angle - Math.PI / 2);
    let sin3 = Math.sin(-full_angle + 0.6 - Math.PI / 2);
    g.setColor(0, 1, 0).fillPoly([
      c[0] + cos1 * 15,
      c[1] + sin1 * 15,
      c[0] + cos2 * 20,
      c[1] + sin2 * 20,
      c[0] + cos3 * 15,
      c[1] + sin3 * 15,
      c[0] + cos3 * 10,
      c[1] + sin3 * 10,
      c[0] + cos2 * 15,
      c[1] + sin2 * 15,
      c[0] + cos1 * 10,
      c[1] + sin1 * 10,
    ]);
  }
  remaining_distance() {
    if (go_backwards) {
      return (
        this.remaining_distances[0] -
        this.remaining_distances[this.current_segment] +
        this.position.distance(this.path.point(this.current_segment))
      );
    } else {
      return (
        this.remaining_distances[this.current_segment + 1] +
        this.position.distance(this.path.point(this.current_segment + 1))
      );
    }
  }
  // check if we are lost (too far from segment we think we are on)
  // if we are adjust scale so that path will still be displayed.
  // we do the scale adjustment here to avoid recomputations later on.
  is_lost(segment) {
    let projection = this.displayed_position.closest_segment_point(
      this.path.point(segment),
      this.path.point(segment + 1)
    );
    this.projected_point = projection; // save this info for display
    let distance_to_projection = this.displayed_position.distance(projection);
    if (distance_to_projection > settings.lost_distance) {
      return true;
    } else {
      return false;
    }
  }

  tile_image(absolute_tile_x, absolute_tile_y) {
    // in the cache old images are front and recently used ones are back
    let cached_img_index = this.images_cache.findIndex((i) => {
      return i.x == absolute_tile_x && i.y == absolute_tile_y;
    });
    if (cached_img_index == -1) {
      // console.log("loading", absolute_tile_x, absolute_tile_y);
      let old_image = this.images_cache.shift();
      this.compute_tile_image(old_image.image, absolute_tile_x, absolute_tile_y);
      this.images_cache.push({
        image: old_image.image,
        x: absolute_tile_x,
        y: absolute_tile_y,
      });
      return old_image.image;
    } else {
      let cached_img = this.images_cache.splice(cached_img_index, 1)[0];
      this.images_cache.push(cached_img);
      return cached_img.image;
    }
  }

  compute_tile_image(img, absolute_tile_x, absolute_tile_y) {
    img.transparent = img.toColor(1, 1, 1);
    img.setBgColor(1, 1, 1).clear();

    this.maps.forEach((m) => {
      m.add_to_tile_image(img, absolute_tile_x, absolute_tile_y);
    });
    this.interests.add_to_tile_image(img, absolute_tile_x, absolute_tile_y);
  }

  display_map() {

    // start_profiling();
    let displayed_x = this.displayed_position.lon;
    let displayed_y = this.displayed_position.lat;
    let tile_x_coord = displayed_x / this.maps[0].side;
    let tile_y_coord = displayed_y / this.maps[0].side;
    let absolute_tile_x = Math.floor(tile_x_coord);
    let absolute_tile_y = Math.floor(tile_y_coord);

    let tiles_per_diagonals = this.zoomed_in ? 3 : 5;
    let diagonal = Math.ceil(
      Math.sqrt(g.getWidth() * g.getWidth() + g.getHeight() * g.getHeight()) /
        tiles_per_diagonals
    );
    let angle = this.direction - Math.PI / 2;
    let cos_direction = Math.cos(angle);
    let sin_direction = Math.sin(angle);
    let d = Math.floor(tiles_per_diagonals / 2);

    for (let x = -d; x <= d; x++) {
      for (let y = -d; y <= d; y++) {
        let img = this.tile_image(absolute_tile_x + x, absolute_tile_y + y);

        let screen_x =
          (absolute_tile_x + x + 0.5 - tile_x_coord) * diagonal + 3;
        let screen_y =
          -(absolute_tile_y + y + 0.5 - tile_y_coord) * diagonal - 3;

        let rotated_x = screen_x * cos_direction - screen_y * sin_direction;
        let rotated_y = screen_x * sin_direction + screen_y * cos_direction;
        let final_x = g.getWidth() / 2 + rotated_x;
        let final_y = g.getHeight() / 2 + Y_OFFSET + rotated_y;

        g.drawImage(img, final_x, final_y, { rotate: angle });
      }
    }
    // end_profiling("map display");
  }
  display() {
    if (displaying || in_menu) {
      return; // don't draw on drawings
    }
    g.reset();
    displaying = true;
    g.clear();
    if (this.screen == MAP) {
      this.display_map();
      if (this.position !== null) {
        // start_profiling();
        this.display_path();
        // end_profiling("path display");
      }

      // start_profiling();
      this.display_direction();
      this.display_stats();
      // end_profiling("direction and stats display");
    } else {
      let current_position = 0;
      if (this.current_segment !== null) {
        current_position =
          this.remaining_distances[0] -
          (this.remaining_distances[this.current_segment + 1] +
            this.projected_point.distance(
              this.path.point(this.current_segment + 1)
            ));
      }
      if (this.screen == HEIGHTS_FULL) {
        this.display_heights(0, current_position, this.remaining_distances[0]);
      } else {
        // only display 2500m
        let start;
        if (go_backwards) {
          start = Math.max(0, current_position - 2000);
        } else {
          start = Math.max(0, current_position - 500);
        }
        let length = Math.min(2500, this.remaining_distances[0] - start);
        this.display_heights(start, current_position, length);
      }
    }
    Bangle.drawWidgets();
    g.flip();
    displaying = false;
  }
  display_heights(display_start, current_position, displayed_length) {
    let path_length = this.remaining_distances[0];
    let widgets_height = 24;
    let graph_width = g.getWidth();
    let graph_height = g.getHeight() - 20 - widgets_height;

    let distance_per_pixel = displayed_length / graph_width;

    let start_point_index = 0;
    let end_point_index = this.path.len - 1;
    for (let i = 0; i < this.path.len; i++) {
      let point_distance = path_length - this.remaining_distances[i];
      if (point_distance <= display_start) {
        start_point_index = i;
      }
      if (point_distance >= display_start + displayed_length) {
        end_point_index = i;
        break;
      }
    }
    end_point_index = Math.min(end_point_index + 1, this.path.len - 1);
    let max_height = Number.NEGATIVE_INFINITY;
    let min_height = Number.POSITIVE_INFINITY;
    for (let i = start_point_index; i <= end_point_index; i++) {
      let height = this.heights[i];
      max_height = Math.max(max_height, height);
      min_height = Math.min(min_height, height);
    }
    // we'll set the displayed height to a minimum value of 100m
    // if we don't, then we'll see too much noise
    if (max_height - min_height < 100) {
      min_height = min_height - 10;
      max_height = min_height + 110;
    }

    let displayed_height = max_height - min_height;
    let height_per_pixel = displayed_height / graph_height;
    // g.setColor(0, 0, 0).drawRect(0, widgets_height, graph_width, graph_height + widgets_height);

    let previous_x = null;
    let previous_y = null;
    let previous_height = null;
    let previous_distance = null;
    let current_x;
    let current_y;
    for (let i = start_point_index; i < end_point_index; i++) {
      let point_distance = path_length - this.remaining_distances[i];
      let height = this.heights[i];
      let x = Math.round((point_distance - display_start) / distance_per_pixel);
      if (go_backwards) {
        x = graph_width - x;
      }
      let y =
        widgets_height +
        graph_height -
        Math.round((height - min_height) / height_per_pixel);
      if (x != previous_x) {
        if (previous_x !== null) {
          let steepness =
            (height - previous_height) / (point_distance - previous_distance);
          if (go_backwards) {
            steepness *= -1;
          }
          let color;
          if (steepness > 0.15) {
            color = "#ff0000";
          } else if (steepness > 0.8) {
            color = "#ff8000";
          } else if (steepness > 0.03) {
            color = "#ffff00";
          } else if (steepness > -0.03) {
            color = "#00ff00";
          } else if (steepness > -0.08) {
            color = "#00aa44";
          } else if (steepness > -0.015) {
            color = "#0044aa";
          } else {
            color = "#0000ff";
          }
          g.setColor(color);
          g.fillPoly([
            previous_x,
            previous_y,
            x,
            y,
            x,
            widgets_height + graph_height,
            previous_x,
            widgets_height + graph_height,
          ]);
          if (
            current_position >= previous_distance &&
            current_position < point_distance
          ) {
            let current_height =
              previous_height +
              ((current_position - previous_distance) /
                (point_distance - previous_distance)) *
                (height - previous_height);
            current_x = Math.round(
              (current_position - display_start) / distance_per_pixel
            );
            if (go_backwards) {
              current_x = graph_width - current_x;
            }
            current_y =
              widgets_height +
              graph_height -
              Math.round((current_height - min_height) / height_per_pixel);
          }
        }
        previous_distance = point_distance;
        previous_height = height;
        previous_x = x;
        previous_y = y;
      }
    }
    if (this.on_path) {
      g.setColor(0, 0, 0);
    } else {
      g.setColor(1, 0, 1);
    }
    g.fillCircle(current_x, current_y, 5);

    // display min dist/max dist and min height/max height
    g.setColor(g.theme.fg);
    g.setFont("6x8:2");
    g.setFontAlign(-1, 1, 0).drawString(
      Math.ceil(display_start / 100) / 10,
      0,
      g.getHeight()
    );

    g.setFontAlign(1, 1, 0).drawString(
      Math.ceil((display_start + displayed_length) / 100) / 10,
      g.getWidth(),
      g.getHeight()
    );

    g.setFontAlign(1, 1, 0).drawString(
      min_height,
      g.getWidth(),
      widgets_height + graph_height
    );
    g.setFontAlign(1, -1, 0).drawString(
      max_height,
      g.getWidth(),
      widgets_height
    );
  }
  display_stats() {
    let now = new Date();
    let minutes = now.getMinutes().toString();
    if (minutes.length < 2) {
      minutes = "0" + minutes;
    }
    let hours = now.getHours().toString();

    // display the clock
    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .setColor(g.theme.fg)
      .drawString(hours + ":" + minutes, 0, 24);

    let approximate_speed;
    // display speed (avg and instant)
    if (this.old_times.length > 0) {
      let point_time = this.old_times[this.old_times.length - 1];
      let done_in = point_time - this.starting_time;
      approximate_speed = Math.round((this.advanced_distance * 3.6) / done_in);
      let approximate_instant_speed = Math.round(this.instant_speed * 3.6);
      g.setFont("6x8:2")
        .setFontAlign(-1, -1, 0)
        .drawString("" + approximate_speed + "km/h", 0, g.getHeight() - 15);

      g.setFont("6x8:3")
        .setFontAlign(1, -1, 0)
        .drawString(
          "" + approximate_instant_speed,
          g.getWidth(),
          g.getHeight() - 22
        );
    }

    if (this.path === null || this.position === null) {
      return;
    }

    let remaining_distance = this.remaining_distance();
    let rounded_distance = Math.round(remaining_distance / 100) / 10;
    let total = Math.round(this.remaining_distances[0] / 100) / 10;
    // now, distance to next point in meters
    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .setColor(g.theme.fg)
      .drawString(
        "" + this.distance_to_next_point + "m",
        0,
        g.getHeight() - 49
      );

    let forward_eta = compute_eta(
      now.getHours(),
      now.getMinutes(),
      approximate_speed,
      remaining_distance / 1000
    );

    // now display ETA
    g.setFont("6x8:2")
      .setFontAlign(-1, -1, 0)
      .setColor(g.theme.fg)
      .drawString(forward_eta, 0, 42);

    // display distance on path
    g.setFont("6x8:2").drawString(
      "" + rounded_distance + "/" + total,
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
  }
  display_path() {
    // don't display all segments, only those neighbouring current segment
    // this is most likely to be the correct display
    // while lowering the cost a lot
    //
    // note that all code is inlined here to speed things up
    let cos = this.adjusted_cos_direction;
    let sin = this.adjusted_sin_direction;
    let displayed_x = this.displayed_position.lon;
    let displayed_y = this.displayed_position.lat;
    let width = g.getWidth();
    let height = g.getHeight();
    let half_width = width / 2;
    let half_height = height / 2 + Y_OFFSET;
    let scale_factor = this.scale_factor;
    if (!this.zoomed_in) {
      scale_factor *= 3/5;
    }

    if (this.path !== null) {
      // compute coordinate for projection on path
      let tx = (this.projected_point.lon - displayed_x) * scale_factor;
      let ty = (this.projected_point.lat - displayed_y) * scale_factor;
      let rotated_x = tx * cos - ty * sin;
      let rotated_y = tx * sin + ty * cos;
      let projected_x = half_width - Math.round(rotated_x); // x is inverted
      let projected_y = half_height + Math.round(rotated_y);

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
        let tx = (nearest_point.lon - displayed_x) * scale_factor;
        let ty = (nearest_point.lat - displayed_y) * scale_factor;
        let rotated_x = tx * cos - ty * sin;
        let rotated_y = tx * sin + ty * cos;
        let x = half_width - Math.round(rotated_x); // x is inverted
        let y = half_height + Math.round(rotated_y);
        g.setColor(1, 0, 1).drawLine(half_width, half_height, x, y);
      }

      // display current-segment's projection
      g.setColor(0, 0, 0);
      g.fillCircle(projected_x, projected_y, 4);
    }

    // now display ourselves
    if (this.on_path) {
      g.setColor(0, 0, 0);
    } else {
      g.setColor(1, 0, 1);
    }
    g.fillCircle(half_width, half_height, 5);
  }
}

function load_gps(filename) {
  // let's display splash screen while loading file

  let splashscreen = require("heatshrink").decompress(
    atob(
      "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"
    )
  );

  g.clear();

  g.drawImage(splashscreen, 0, 0);
  g.setFont("6x8:2")
    .setFontAlign(-1, -1, 0)
    .setColor(0xf800)
    .drawString(filename, 0, g.getHeight() - 30);
  g.flip();

  let file_size;
  {
    let buffer = s.readArrayBuffer(filename);
    file_size = buffer.length;
  }
  let offset = 0;

  let path = null;
  let heights = null;
  let maps = [];
  let interests = null;
  while (offset < file_size) {
    let block_type = Uint8Array(E.toArrayBuffer(s.read(filename, offset, 1)))[0];
    offset += 1;
    if (block_type == 0) {
      // it's a map
      console.log("loading map");
      let res = new Map(filename, offset);
      let map = res[0];
      offset = res[1];
      maps.push(map);
    } else if (block_type == 2) {
      console.log("loading path");
      let res = new Path(filename, offset);
      path = res[0];
      offset = res[1];
    } else if (block_type == 3) {
      console.log("loading interests");
      let res = new Interests(filename, offset);
      interests = res[0];
      offset = res[1];
    } else if (block_type == 4) {
      let heights_number = path.points.length / 2;
      let buffer = E.toArrayBuffer(s.read(filename, offset, heights_number*2));
      heights = Int16Array(buffer);
      offset += 2 * heights_number;
    } else {
      console.log("todo : block type", block_type);
    }
  }

  start_gipy(path, maps, interests, heights);
}

class Path {
  constructor(filename, offset) {
    let points_number = Uint16Array(E.toArrayBuffer(s.read(filename, offset, 2)))[0];
    offset += 2;
    let waypoints_len = Math.ceil(points_number / 8.0);
    let buffer = E.toArrayBuffer(s.read(filename, offset, points_number * 16 + waypoints_len));

    // path points
    this.points = Float64Array(buffer, 0, 2 * points_number);
    offset += 8 * points_number * 2;

    // path waypoints
    this.waypoints = Uint8Array(buffer, points_number * 2, waypoints_len);
    offset += waypoints_len;

    return [this, offset];
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

  // return index of segment which is nearest from point.
  // we need a direction because there is an ambiguity
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
      let orientation = +(dot < 0); // index 0 is good orientation (if you go forward)
      if (distance <= mins[orientation]) {
        mins[orientation] = distance;
        indices[orientation] = i - 1;
      }

      p1 = p2;
    }

    // by default correct orientation (0 forward, 1 backward) wins
    // but if other one is really closer, return other one
    let good_orientation = go_backwards ? 1 : 0;
    if (mins[1 - good_orientation] < mins[good_orientation] / 100.0) {
      return indices[1 - good_orientation];
    } else {
      return indices[good_orientation];
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
      g.getHeight() / 2 + Math.round(rotated_y) + Y_OFFSET,
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
  // dot(other_point) {
  //     return this.lon * other_point.lon + this.lat * other_point.lat;
  // }
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

//let fake_gps_point = 0;

function drawMenu() {
  const menu = {
    "": {
      title: "choose trace",
    },
  };
  var files = s.list(".gps");
  for (var i = 0; i < files.length; ++i) {
    menu[files[i]] = start.bind(null, files[i]);
  }
  menu["Exit"] = function () {
    load();
  };
  Bangle.setLCDBrightness(settings.brightness);
  Bangle.setLocked(false);
  E.showMenu(menu);
}


function ask_options(fn) {
  g.clear();
  let height = g.getHeight();
  let width = g.getWidth();
  g.drawRect(10, 10, width - 10, height / 2 - 10);
  g.drawRect(10, height/2 + 10, width - 10, height - 10);
  g.setFont("Vector:30").setFontAlign(0,0).drawString("Forward", width/2, height/4);
  g.drawString("Backward", width/2, 3*height/4);
  g.flip();

  function options_select(b, xy) {
    let end = false;
    if (xy.y < height / 2 - 10) {
      g.setColor(0, 0, 0).fillRect(10, 10, width - 10, height / 2 - 10);
      g.setColor(1, 1, 1).setFont("Vector:30").setFontAlign(0,0).drawString("Forward", width/2, height/4);
      end = true;
    } else if (xy.y > height/2 + 10) {
      g.setColor(0, 0, 0).fillRect(10, height/2 + 10, width - 10, height - 10);
      g.setColor(1, 1, 1).setFont("Vector:30").setFontAlign(0,0).drawString("Backward", width/2, 3*height/4);
      go_backwards = true;
      end = true;
    }
    if (end) {
      g.flip();
      Bangle.removeListener("touch", options_select);
      console.log("loading", fn);
      load_gps(fn);
    }
  }
  Bangle.on("touch", options_select);
}

function start(fn) {
  E.showMenu();
  ask_options(fn);
}

function start_gipy(path, maps, interests, heights) {
  console.log("starting");

  if (!simulated && settings.disable_bluetooth) {
    NRF.sleep(); // disable bluetooth completely
  }

  console.log("creating status");
  status = new Status(path, maps, interests, heights);
  console.log("done creating status");

  setWatch(
    function () {
      status.activate();
      if (in_menu) {
        return;
      }
      in_menu = true;
      const menu = {
        "": {
          title: "choose action",
        },
        "Go Backward": {
          value: go_backwards,
          format: (v) => (v ? "On" : "Off"),
          onchange: (v) => {
            go_backwards = v;
          },
        },
        Zoom: {
          value: status.zoomed_in,
          format: (v) => (v ? "In" : "Out"),
          onchange: (v) => {
            status.zoomed_in = v;
            status.reset_images_cache();
          },
        },
        /*LANG*/
        powersaving: {
          value: powersaving,
          onchange: (v) => {
            powersaving = v;
          },
        },
        "back to map": function () {
          in_menu = false;
          E.showMenu();
          g.clear();
          g.flip();
          if (status !== null) {
            status.display();
          }
        },
      };
      try {
        // plot openstmap option if installed
        const osm = require("openstmap");
        menu[/*LANG*/"Plot OpenStMap"] = function() {
          E.showMenu(); // remove menu

          // compute min/max coordinates
          const fix = Bangle.getGPSFix();
          let minLat = fix.lat ? fix.lat : 90;
          let maxLat = fix.lat ? fix.lat : -90;
          let minLong = fix.lon ? fix.lon : 180;
          let maxLong = fix.lon ? fix.lon : -180;
          for(let i=0; i<path.len; i++) {
            const point = path.point(i);
            if(point.lat>maxLat) maxLat=point.lat; if(point.lat<minLat) minLat=point.lat;
            if(point.lon>maxLong) maxLong=point.lon; if(point.lon<minLong) minLong=point.lon;
          }
          const max = Bangle.project({lat: maxLat, lon: maxLong});
          const min = Bangle.project({lat: minLat, lon: minLong});
          const scaleX = (max.x-min.x)/Bangle.appRect.w;
          const scaleY = (max.y-min.y)/Bangle.appRect.h;

          // openstmap initialization
          osm.scale = Math.ceil((scaleX > scaleY ? scaleX : scaleY)*1.1); // add 10% margin
          osm.lat = (minLat+maxLat)/2.0;
          osm.lon = (minLong+maxLong)/2.0;

          const drawOpenStmap = () => {
            g.clearRect(Bangle.appRect);
            osm.draw();

            // draw track
            g.setColor("#f09");
            for(let i=0; i<path.len; i++) {
              const point = path.point(i);
              const mp = osm.latLonToXY(point.lat, point.lon);
              if (i == 0) {
                g.moveTo(mp.x,mp.y);
              } else {
                g.lineTo(mp.x,mp.y);
              }
              g.fillCircle(mp.x,mp.y,2); // make the track more visible
            }

            // draw current position
            g.setColor("#000");
            if (fix.lat && fix.lon) {
              const icon = require("heatshrink").decompress(atob("jEYwYPMyVJkgHEkgICyAHCgIIDyQIChIIEoAIDC4IIEBwOAgEEyVIBAY4DBD4sGHxBQIMRAIIPpAyCHAYILUJEAiVJkAIFgVJXo5fCABQA==")); // 24x24px
              const mp = osm.latLonToXY(fix.lat, fix.lon);
              g.drawImage(icon, mp.x, mp.y);
            }

            // labels
            g.setFont("6x8",2);
            g.setFontAlign(0,0,3);
            g.drawString(/*LANG*/"Back", g.getWidth() - 10, g.getHeight()/2);
            g.drawString("+", g.getWidth() - 10, g.getHeight()/4);
            g.drawString("-", g.getWidth() - 10, g.getHeight()/4*3);
          };
          drawOpenStmap();

          let startDrag = 0;
          Bangle.setUI({
            mode: "custom",
            btn: (n) => { // back handling
              g.clearRect(0, 0, g.getWidth(), g.getHeight());
              E.showMenu(menu);
            },
            drag: (ev) => { // zoom, move
              if (ev.b) {
                osm.scroll(ev.dx, ev.dy);
                if (!startDrag) {
                  startDrag = getTime();
                }
              } else {
                if (getTime() - startDrag < 0.2) {
                  // tap
                  if (ev.y > g.getHeight() / 2) {
                    osm.scale *= 2;
                  } else {
                    osm.scale /= 2;
                  }
                }
                startDrag = 0;
                drawOpenStmap();
              }
            },
          });
        };
      } catch (ex) {
        // openstmap not available.
      }
      E.showMenu(menu);
    },
    BTN1,
    {
      repeat: true,
    }
  );

  if (status.path !== null) {
    let start = status.path.point(0);
    status.displayed_position = start;
  } else {
    let first_map = maps[0];
    status.displayed_position = new Point(
      first_map.start_coordinates[0] +
        (first_map.side * first_map.grid_size[0]) / 2,
      first_map.start_coordinates[1] +
        (first_map.side * first_map.grid_size[1]) / 2
    );
  }
  status.display();

  Bangle.on("touch", () => {
    let active = status.active;
    status.activate();
    if (in_menu) {
      return;
    }
    if (active && status.heights !== null) {
      g.clear();
      g.flip();
      status.screen = (status.screen + 1) % 3;
      status.display();
    }
  });

  Bangle.on("stroke", (o) => {
    status.activate();
    if (in_menu) {
      return;
    }
    // we move display according to stroke
    let first_x = o.xy[0];
    let first_y = o.xy[1];
    let last_x = o.xy[o.xy.length - 2];
    let last_y = o.xy[o.xy.length - 1];
    let xdiff = last_x - first_x;
    let ydiff = last_y - first_y;

    let c = status.adjusted_cos_direction;
    let s = status.adjusted_sin_direction;
    let rotated_x = xdiff * c - ydiff * s;
    let rotated_y = xdiff * s + ydiff * c;
    status.displayed_position.lon += (1.3 * rotated_x) / status.scale_factor;
    status.displayed_position.lat -= (1.3 * rotated_y) / status.scale_factor;
    status.display();
  });

  if (simulated) {
    console.log("un-comment simulator to use it");
    // status.starting_time = getTime();
    // // let's keep the screen on in simulations
    // Bangle.setLCDTimeout(0);
    // Bangle.setLCDPower(1);
    // Bangle.loadWidgets(); // i don't know why i cannot load them at start : they would display on splash screen

    // function simulate_gps(status) {
    //   if (status.path === null) {
    //     let map = status.maps[0];
    //     let p1 = new Point(map.start_coordinates[0], map.start_coordinates[1]);
    //     let p2 = new Point(
    //       map.start_coordinates[0] + map.side * map.grid_size[0],
    //       map.start_coordinates[1] + map.side * map.grid_size[1]
    //     );
    //     let pos = p1.times(1 - fake_gps_point).plus(p2.times(fake_gps_point));
    //     if (fake_gps_point < 1) {
    //       fake_gps_point += 0.05;
    //     }
    //     status.update_position(pos);
    //   } else {
    //     if (fake_gps_point > status.path.len - 1 || fake_gps_point < 0) {
    //       return;
    //     }
    //     let point_index = Math.floor(fake_gps_point);
    //     if (point_index >= status.path.len / 2 - 1) {
    //       return;
    //     }
    //     let p1 = status.path.point(8 * point_index); // use these to approximately follow path
    //     let p2 = status.path.point(8 * (point_index + 1));
    //     //let p1 = status.path.point(point_index); // use these to strictly follow path
    //     //let p2 = status.path.point(point_index + 1);

    //     let alpha = fake_gps_point - point_index;
    //     let pos = p1.times(1 - alpha).plus(p2.times(alpha));

    //     if (go_backwards) {
    //       fake_gps_point -= 0.2; // advance simulation
    //     } else {
    //       fake_gps_point += 0.2; // advance simulation
    //     }
    //     console.log(fake_gps_point);
    //     status.update_position(pos);
    //   }
    // }

    // setInterval(simulate_gps, 500, status);
  } else {
    status.activate();

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
          Bangle.loadWidgets(); // load them even in simulation to eat mem
        }
        status.update_position(new Point(data.lon, data.lat));
      }
      let gps_status_color;
      if (frame % 2 == 0 || valid_coordinates) {
        gps_status_color = g.theme.bg;
      } else {
        gps_status_color = g.theme.fg;
      }
      if (!in_menu) {
        g.setColor(gps_status_color)
          .setFont("6x8:2")
          .drawString("gps", g.getWidth() - 40, 30);
      }
    };

    Bangle.setGPSPower(true, "gipy");
    Bangle.on("GPS", set_coordinates);
  }
}

let files = s.list(".gps");
if (files.length <= 1) {
  if (files.length == 0) {
    load();
  } else {
    start(files[0]);
  }
} else {
  drawMenu();
}
