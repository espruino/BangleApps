let simulated = false;
let displaying = false;
let in_menu = false;
let go_backwards = false;
let zoomed = true;
let status;

let interests_colors = [
  0xffff, // Waypoints, white
  0xf800, // Bakery, red
  0x001f, // DrinkingWater, blue
  0x07ff, // Toilets, cyan
  0x07e0, // Artwork, green
];

let Y_OFFSET = 20;
let s = require("Storage");

var settings = Object.assign(
  {
    lost_distance: 50,
  },
  s.readJSON("gipy.json", true) || {}
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
  constructor(buffer, offset) {
    let type_size = Uint8Array(buffer, offset, 1)[0];
    offset += 1;
    this.entry_size = Uint8Array(buffer, offset, 1)[0];
    offset += 1;
    let non_empty_tiles_number = Uint16Array(buffer, offset, 1)[0];
    offset += 2;
    this.non_empty_tiles = Uint16Array(buffer, offset, non_empty_tiles_number);
    offset += 2 * non_empty_tiles_number;
    if (type_size == 24) {
      this.non_empty_tiles_ends = Uint24Array(
        buffer,
        offset,
        non_empty_tiles_number
      );
      offset += 3 * non_empty_tiles_number;
    } else if (type_size == 16) {
      this.non_empty_tiles_ends = Uint16Array(
        buffer,
        offset,
        non_empty_tiles_number
      );
      offset += 2 * non_empty_tiles_number;
    } else {
      throw "unknown size";
    }
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
  constructor(buffer, offset, filename) {
    this.points_cache = []; // don't refetch points all the time
    // header
    let color_array = Uint8Array(buffer, offset, 3);
    this.color = [
      color_array[0] / 255,
      color_array[1] / 255,
      color_array[2] / 255,
    ];
    offset += 3;
    this.first_tile = Uint32Array(buffer, offset, 2); // absolute tile id of first tile
    offset += 2 * 4;
    this.grid_size = Uint32Array(buffer, offset, 2); // tiles width and height
    offset += 2 * 4;
    this.start_coordinates = Float64Array(buffer, offset, 2); // min x and y coordinates
    offset += 2 * 8;
    let side_array = Float64Array(buffer, offset, 1); // side of a tile
    this.side = side_array[0];
    offset += 8;

    // tiles offsets
    let res = new TilesOffsets(buffer, offset);
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

  display(
    displayed_x,
    displayed_y,
    scale_factor,
    cos_direction,
    sin_direction
  ) {
    g.setColor(this.color[0], this.color[1], this.color[2]);
    let local_x = displayed_x - this.start_coordinates[0];
    let local_y = displayed_y - this.start_coordinates[1];
    let tile_x = Math.floor(local_x / this.side);
    let tile_y = Math.floor(local_y / this.side);

    let limit = 1;
    if (!zoomed) {
      limit = 2;
    }
    for (let y = tile_y - limit; y <= tile_y + limit; y++) {
      if (y < 0 || y >= this.grid_size[1]) {
        continue;
      }
      for (let x = tile_x - limit; x <= tile_x + limit; x++) {
        if (x < 0 || x >= this.grid_size[0]) {
          continue;
        }
        if (
          this.tile_is_on_screen(
            x,
            y,
            local_x,
            local_y,
            scale_factor,
            cos_direction,
            sin_direction
          )
        ) {
//           let colors = [
//             [0, 0, 0],
//             [0, 0, 1],
//             [0, 1, 0],
//             [0, 1, 1],
//             [1, 0, 0],
//             [1, 0, 1],
//             [1, 1, 0],
//             [1, 1, 0.5],
//             [0.5, 0, 0.5],
//             [0, 0.5, 0.5],
//           ];
          if (this.color[0] == 1 && this.color[1] == 0 && this.color[2] == 0) {
            this.display_thick_tile(
              x,
              y,
              local_x,
              local_y,
              scale_factor,
              cos_direction,
              sin_direction
            );
          } else {
            this.display_tile(
              x,
              y,
              local_x,
              local_y,
              scale_factor,
              cos_direction,
              sin_direction
            );
          }
        }
      }
    }
  }

  tile_is_on_screen(
    tile_x,
    tile_y,
    current_x,
    current_y,
    scale_factor,
    cos_direction,
    sin_direction
  ) {
    let width = g.getWidth();
    let height = g.getHeight();
    let center_x = width / 2;
    let center_y = height / 2 + Y_OFFSET;
    let side = this.side;
    let tile_center_x = (tile_x + 0.5) * side;
    let tile_center_y = (tile_y + 0.5) * side;
    let scaled_center_x = (tile_center_x - current_x) * scale_factor;
    let scaled_center_y = (tile_center_y - current_y) * scale_factor;
    let rotated_center_x = scaled_center_x * cos_direction - scaled_center_y * sin_direction;
    let rotated_center_y = scaled_center_x * sin_direction + scaled_center_y * cos_direction;
    let on_screen_center_x = center_x - rotated_center_x;
    let on_screen_center_y = center_y + rotated_center_y;

    let scaled_side = side * scale_factor * Math.sqrt(1/2);

    if (on_screen_center_x + scaled_side <= 0) {
      return false;
    }
    if (on_screen_center_x - scaled_side >= width) {
      return false;
    }
    if (on_screen_center_y + scaled_side <= 0) {
      return false;
    }
    if (on_screen_center_y - scaled_side >= height) {
      return false;
    }
    return true;
  }

  tile_points(tile_num, tile_x, tile_y, scaled_side) {
    let line_start_offset = this.tiles_offsets.tile_start_offset(
      tile_y * this.grid_size[0]
    );
    let offset =
      this.tiles_offsets.tile_start_offset(tile_num) - line_start_offset;
    let upper_limit =
      this.tiles_offsets.tile_end_offset(tile_num) - line_start_offset;

    let line = this.binary_lines[tile_y];
    // we need to copy both for correct results and for performances
    // let's precompute also.
    let cached_tile = new Float64Array(upper_limit - offset);
    for (let i = offset; i < upper_limit; i += 2) {
      let x = (tile_x + line.buffer[i] / 255) * scaled_side;
      let y = (tile_y + line.buffer[i + 1] / 255) * scaled_side;
      cached_tile[i - offset] = x;
      cached_tile[i + 1 - offset] = y;
    }
    return cached_tile;
  }

  invalidate_caches() {
    this.points_cache = [];
  }

  fetch_points(tile_x, tile_y, scaled_side) {
    let tile_num = tile_x + tile_y * this.grid_size[0];
    for (let i = 0; i < this.points_cache.length; i++) {
      if (this.points_cache[i][0] == tile_num) {
        return this.points_cache[i][1];
      }
    }
    if (this.points_cache.length > 40) {
      this.points_cache.shift();
    }
    let points = this.tile_points(tile_num, tile_x, tile_y, scaled_side);
    this.points_cache.push([tile_num, points]);
    return points;
  }

  display_tile(
    tile_x,
    tile_y,
    current_x,
    current_y,
    scale_factor,
    cos_direction,
    sin_direction
  ) {
      "jit";
    let center_x = g.getWidth() / 2;
    let center_y = g.getHeight() / 2 + Y_OFFSET;

    let points = this.fetch_points(tile_x, tile_y, this.side * scale_factor);
    let scaled_current_x = current_x * scale_factor;
    let scaled_current_y = current_y * scale_factor;

    for (let i = 0; i < points.length; i += 4) {
      let scaled_x = points[i] - scaled_current_x;
      let scaled_y = points[i + 1] - scaled_current_y;
      let rotated_x = scaled_x * cos_direction - scaled_y * sin_direction;
      let rotated_y = scaled_x * sin_direction + scaled_y * cos_direction;
      let final_x = center_x - rotated_x;
      let final_y = center_y + rotated_y;
      scaled_x = points[i + 2] - scaled_current_x;
      scaled_y = points[i + 3] - scaled_current_y;
      rotated_x = scaled_x * cos_direction - scaled_y * sin_direction;
      rotated_y = scaled_x * sin_direction + scaled_y * cos_direction;
      let new_final_x = center_x - rotated_x;
      let new_final_y = center_y + rotated_y;
      g.drawLine(final_x, final_y, new_final_x, new_final_y);
    }
  }

  display_thick_tile(
    tile_x,
    tile_y,
    current_x,
    current_y,
    scale_factor,
    cos_direction,
    sin_direction
  ) {
    let center_x = g.getWidth() / 2;
    let center_y = g.getHeight() / 2 + Y_OFFSET;

    let points = this.fetch_points(tile_x, tile_y, this.side * scale_factor);
    let scaled_current_x = current_x * scale_factor;
    let scaled_current_y = current_y * scale_factor;

    for (let i = 0; i < points.length; i += 4) {
      let scaled_x = points[i] - scaled_current_x;
      let scaled_y = points[i + 1] - scaled_current_y;
      let rotated_x = scaled_x * cos_direction - scaled_y * sin_direction;
      let rotated_y = scaled_x * sin_direction + scaled_y * cos_direction;
      let final_x = center_x - rotated_x;
      let final_y = center_y + rotated_y;
      scaled_x = points[i + 2] - scaled_current_x;
      scaled_y = points[i + 3] - scaled_current_y;
      rotated_x = scaled_x * cos_direction - scaled_y * sin_direction;
      rotated_y = scaled_x * sin_direction + scaled_y * cos_direction;
      let new_final_x = center_x - rotated_x;
      let new_final_y = center_y + rotated_y;

      let xdiff = new_final_x - final_x;
      let ydiff = new_final_y - final_y;
      let d = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
      let ox = (-ydiff / d) * 3;
      let oy = (xdiff / d) * 3;
      g.fillPoly([
        final_x + ox,
        final_y + oy,
        new_final_x + ox,
        new_final_y + oy,
        new_final_x - ox,
        new_final_y - oy,
        final_x - ox,
        final_y - oy,
      ]);
    }
  }
}

class Interests {
  constructor(buffer, offset) {
    this.first_tile = Uint32Array(buffer, offset, 2); // absolute tile id of first tile
    offset += 2 * 4;
    this.grid_size = Uint32Array(buffer, offset, 2); // tiles width and height
    offset += 2 * 4;
    this.start_coordinates = Float64Array(buffer, offset, 2); // min x and y coordinates
    offset += 2 * 8;
    let side_array = Float64Array(buffer, offset, 1); // side of a tile
    this.side = side_array[0];
    offset += 8;

    let res = new TilesOffsets(buffer, offset);
    offset = res[1];
    this.offsets = res[0];
    let end = this.offsets.end_offset();
    this.binary_interests = new Uint8Array(end);
    let binary_interests = Uint8Array(buffer, offset, end);
    for (let i = 0; i < end; i++) {
      this.binary_interests[i] = binary_interests[i];
    }
    offset += end;
    this.points_cache = [];
    return [this, offset];
  }

  display(
    displayed_x,
    displayed_y,
    scale_factor,
    cos_direction,
    sin_direction
  ) {
    let local_x = displayed_x - this.start_coordinates[0];
    let local_y = displayed_y - this.start_coordinates[1];
    let tile_x = Math.floor(local_x / this.side);
    let tile_y = Math.floor(local_y / this.side);
    for (let y = tile_y - 1; y <= tile_y + 1; y++) {
      if (y < 0 || y >= this.grid_size[1]) {
        continue;
      }
      for (let x = tile_x - 1; x <= tile_x + 1; x++) {
        if (x < 0 || x >= this.grid_size[0]) {
          continue;
        }
        this.display_tile(
          x,
          y,
          local_x,
          local_y,
          scale_factor,
          cos_direction,
          sin_direction
        );
      }
    }
  }

  tile_points(tile_num, tile_x, tile_y, scaled_side) {
    let offset = this.offsets.tile_start_offset(tile_num);
    let upper_limit = this.offsets.tile_end_offset(tile_num);

    let tile_interests = [];
    for (let i = offset; i < upper_limit; i += 3) {
      let interest = this.binary_interests[i];
      let x = (tile_x + this.binary_interests[i + 1] / 255) * scaled_side;
      let y = (tile_y + this.binary_interests[i + 2] / 255) * scaled_side;
      if (interest >= interests_colors.length) {
        throw "bad interest" + interest + "at" + tile_num + "offset" + i;
      }
      tile_interests.push(interest);
      tile_interests.push(x);
      tile_interests.push(y);
    }
    return tile_interests;
  }
  fetch_points(tile_x, tile_y, scaled_side) {
    //TODO: factorize with map ?
    let tile_num = tile_x + tile_y * this.grid_size[0];
    for (let i = 0; i < this.points_cache.length; i++) {
      if (this.points_cache[i][0] == tile_num) {
        return this.points_cache[i][1];
      }
    }
    if (this.points_cache.length > 40) {
      this.points_cache.shift();
    }
    let points = this.tile_points(tile_num, tile_x, tile_y, scaled_side);
    this.points_cache.push([tile_num, points]);
    return points;
  }
  invalidate_caches() {
    this.points_cache = [];
  }
  display_tile(
    tile_x,
    tile_y,
    displayed_x,
    displayed_y,
    scale_factor,
    cos_direction,
    sin_direction
  ) {
    let width = g.getWidth();
    let half_width = width / 2;
    let half_height = g.getHeight() / 2 + Y_OFFSET;
    let interests = this.fetch_points(tile_x, tile_y, this.side * scale_factor);

    let scaled_current_x = displayed_x * scale_factor;
    let scaled_current_y = displayed_y * scale_factor;

    for (let i = 0; i < interests.length; i += 3) {
      let type = interests[i];
      let x = interests[i + 1];
      let y = interests[i + 2];

      let scaled_x = x - scaled_current_x;
      let scaled_y = y - scaled_current_y;
      let rotated_x = scaled_x * cos_direction - scaled_y * sin_direction;
      let rotated_y = scaled_x * sin_direction + scaled_y * cos_direction;
      let final_x = half_width - rotated_x;
      let final_y = half_height + rotated_y;

      let color = interests_colors[type];
      if (type == 0) {
        g.setColor(0, 0, 0).fillCircle(final_x, final_y, 6);
      }
      g.setColor(color).fillCircle(final_x, final_y, 5);
    }
  }
}

class Status {
  constructor(path, maps, interests) {
    this.path = path;
    this.maps = maps;
    this.interests = interests;
    let half_screen_width = g.getWidth() / 2;
    let half_screen_height = g.getHeight() / 2;
    let half_screen_diagonal = Math.sqrt(
      half_screen_width * half_screen_width +
        half_screen_height * half_screen_height
    );
    this.scale_factor = half_screen_diagonal / maps[0].side; // multiply geo coordinates by this to get pixels coordinates
    this.on_path = true; // are we on the path or lost ?
    this.position = null; // where we are
    this.adjusted_cos_direction = 1; // cos of where we look at
    this.adjusted_sin_direction = 0; // sin of where we look at
    this.current_segment = null; // which segment is closest
    this.reaching = null; // which waypoint are we reaching ?
    this.distance_to_next_point = null; // how far are we from next point ?
    this.projected_point = null;

    if (this.path !== null) {
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
    }
    this.starting_time = null; // time we start
    this.advanced_distance = 0.0;
    this.gps_coordinates_counter = 0; // how many coordinates did we receive
    this.old_points = []; // record previous points but only when enough distance between them
    this.old_times = []; // the corresponding times
  }
  invalidate_caches() {
    for (let i = 0; i < this.maps.length; i++) {
      this.maps[i].invalidate_caches();
    }
    if (this.interests !== null) {
      this.interests.invalidate_caches();
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
  update_position(new_position, maybe_direction, timestamp) {
    let direction = this.new_position_reached(new_position);
    if (direction === null) {
      if (maybe_direction === null) {
        return;
      } else {
        direction = maybe_direction;
      }
    }
    if (in_menu) {
      return;
    }

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

    // abort if we are late
    // if (timestamp !== null) {
    //   let elapsed = Date.now() - timestamp;
    //   if (elapsed > 1000) {
    //     console.log("we are late");
    //     return;
    //   }
    //     console.log("we are not late");
    // }

    if (this.path !== null) {
      // detect segment we are on now
      let res = this.path.nearest_segment(
        this.displayed_position,
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
          this.displayed_position,
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
    }

    // abort most frames if locked
    if (Bangle.isLocked() && this.gps_coordinates_counter % 5 != 0) {
      return;
    }

    // re-display
    this.display();
  }
  display_direction() {
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
    direction = Math.atan2(diff.lat, diff.lon);

    let full_angle = direction - this.angle;
    // let c = towards.coordinates(p, this.adjusted_cos_direction, this.adjusted_sin_direction, this.scale_factor);
    // g.setColor(1,0,1).fillCircle(c[0], c[1], 5);

    let scale;
    if (zoomed) {
      scale = this.scale_factor;
    } else {
      scale = this.scale_factor / 2;
    }

    c = this.projected_point.coordinates(
      this.displayed_position,
      this.adjusted_cos_direction,
      this.adjusted_sin_direction,
      scale
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
    let remaining_in_correct_orientation =
      this.remaining_distances[this.current_segment + 1] +
      this.position.distance(this.path.point(this.current_segment + 1));

    if (go_backwards) {
      return this.remaining_distances[0] - remaining_in_correct_orientation;
    } else {
      return remaining_in_correct_orientation;
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
  display() {
    if (displaying || in_menu) {
      return; // don't draw on drawings
    }
    displaying = true;
    g.clear();
    let scale_factor = this.scale_factor;
    if (!zoomed) {
      scale_factor /= 2;
    }

    // start_profiling();
    for (let i = 0; i < this.maps.length; i++) {
      this.maps[i].display(
        this.displayed_position.lon,
        this.displayed_position.lat,
        scale_factor,
        this.adjusted_cos_direction,
        this.adjusted_sin_direction
      );
    }
    // end_profiling("map");
    if (this.interests !== null) {
      this.interests.display(
        this.displayed_position.lon,
        this.displayed_position.lat,
        scale_factor,
        this.adjusted_cos_direction,
        this.adjusted_sin_direction
      );
    }
    if (this.position !== null) {
      this.display_path();
    }

    this.display_direction();
    this.display_stats();
    Bangle.drawWidgets();
    displaying = false;
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
      approximate_speed = Math.round(
        (this.advanced_distance * 3.6) / done_in
      );
      let approximate_instant_speed = Math.round(this.instant_speed * 3.6);
      g.setFont("6x8:2")
        .setFontAlign(-1, -1, 0)
        .drawString(
          "" +
            approximate_speed +
            "km/h (in." +
            approximate_instant_speed +
            ")",
          0,
          g.getHeight() - 15
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
    if (!this.on_path) {
      g.setColor(1.0, 0.0, 0.0)
        .setFont("6x15")
        .drawString("lost", g.getWidth() - 55, 35);
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
    if (!zoomed) {
      scale_factor /= 2;
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
        g.setColor(g.theme.fgH).drawLine(half_width, half_height, x, y);
      }

      // display current-segment's projection
      g.setColor(0, 0, 0);
      g.fillCircle(projected_x, projected_y, 4);
    }

    // now display ourselves
    g.setColor(0, 0, 0);
    g.fillCircle(half_width, half_height, 5);
  }
}

function load_gps(filename) {
  // let's display splash screen while loading file
  g.clear();
  g.drawImage(splashscreen, 0, 0);
  g.setFont("6x8:2")
    .setFontAlign(-1, -1, 0)
    .setColor(0xf800)
    .drawString(filename, 0, g.getHeight() - 30);
  g.flip();

  let buffer = s.readArrayBuffer(filename);
  let file_size = buffer.length;
  let offset = 0;

  let path = null;
  let maps = [];
  let interests = null;
  while (offset < file_size) {
    let block_type = Uint8Array(buffer, offset, 1)[0];
    offset += 1;
    if (block_type == 0) {
      // it's a map
      console.log("loading map");
      let res = new Map(buffer, offset, filename);
      let map = res[0];
      offset = res[1];
      maps.push(map);
    } else if (block_type == 2) {
      console.log("loading path");
      let res = new Path(buffer, offset);
      path = res[0];
      offset = res[1];
    } else if (block_type == 3) {
      console.log("loading interests");
      let res = new Interests(buffer, offset);
      interests = res[0];
      offset = res[1];
    } else {
      console.log("todo : block type", block_type);
    }
  }

  // checksum file size
  if (offset != file_size) {
    console.log("invalid file size", file_size, "expected", offset);
    let msg = "invalid file\nsize " + file_size + "\ninstead of" + offset;
    E.showAlert(msg).then(function () {
      E.showAlert();
      start_gipy(path, maps, interests);
    });
  } else {
    start_gipy(path, maps, interests);
  }
}

class Path {
  constructor(buffer, offset) {
    // let p = Uint16Array(buffer, offset, 1);
    // console.log(p);
    let points_number = Uint16Array(buffer, offset, 1)[0];
    offset += 2;

    // path points
    this.points = Float64Array(buffer, offset, points_number * 2);
    offset += 8 * points_number * 2;

    // path waypoints
    let waypoints_len = Math.ceil(points_number / 8.0);
    this.waypoints = Uint8Array(buffer, offset, waypoints_len);
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

let fake_gps_point = 0;
function simulate_gps(status) {
  if (status.path === null) {
    let map = status.maps[0];
    let p1 = new Point(map.start_coordinates[0], map.start_coordinates[1]);
    let p2 = new Point(
      map.start_coordinates[0] + map.side * map.grid_size[0],
      map.start_coordinates[1] + map.side * map.grid_size[1]
    );
    let pos = p1.times(1 - fake_gps_point).plus(p2.times(fake_gps_point));
    if (fake_gps_point < 1) {
      fake_gps_point += 0.01;
    }
    status.update_position(pos, null, null);
  } else {
    if (fake_gps_point > status.path.len - 1 || fake_gps_point < 0) {
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

    if (go_backwards) {
      fake_gps_point -= 0.05; // advance simulation
    } else {
      fake_gps_point += 0.05; // advance simulation
    }
    status.update_position(pos, null, null);
  }
}

function drawMenu() {
  const menu = {
    "": { title: "choose trace" },
  };
  var files = s.list(".gps");
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

  load_gps(fn);
}

function start_gipy(path, maps, interests) {
  console.log("starting");
  status = new Status(path, maps, interests);

  if (status.path !== null) {
    let start = status.path.point(0);
    status.displayed_position = start;
  } else {
    let first_map = maps[0];
    status.displayed_position = new Point(
      first_map.start_coordinates[0] +
      (first_map.side * first_map.grid_size[0]) / 2,
      first_map.start_coordinates[1] +
      (first_map.side * first_map.grid_size[1]) / 2);
  }
  status.display();

  Bangle.on("stroke", (o) => {
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
    status.displayed_position.lon += 1.3 * rotated_x / status.scale_factor;
    status.displayed_position.lat -= 1.3 * rotated_y / status.scale_factor;
    status.display();
  });

  if (simulated) {
    status.starting_time = getTime();
    // let's keep the screen on in simulations
    Bangle.setLCDTimeout(0);
    Bangle.setLCDPower(1);
    setInterval(simulate_gps, 500, status);
  } else {
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
        status.update_position(new Point(data.lon, data.lat), null, data.time);
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
    Bangle.on("lock", function (on) {
      if (!on) {
        Bangle.setGPSPower(true, "gipy"); // activate gps when unlocking
      }
    });
  }
}

setWatch(
  function () {
    if (in_menu) {
      return;
    }
    in_menu = true;
    const menu = {
      "": { title: "choose action" },
      "Go Backward": {
        value: go_backwards,
        format: (v) => (v ? "On" : "Off"),
        onchange: (v) => {
          go_backwards = v;
        },
      },
      Zoom: {
        value: zoomed,
        format: (v) => (v ? "In" : "Out"),
        onchange: (v) => {
          status.invalidate_caches();
          zoomed = v;
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
    E.showMenu(menu);
  },
  BTN1,
  { repeat: true }
);

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
