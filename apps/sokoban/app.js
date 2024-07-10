// basic shapes
const SPACE = 0;
const WALL = 1;
const BOX = 3;
const HOLE = 4;
const FILLED = 5;

// basic directions
const LEFT = 0;
const UP = 1;
const DOWN = 2;
const RIGHT = 3;

function go(line, column, direction) {
    let destination_line = line;
    let destination_column = column;
    if (direction == LEFT) {
        destination_column -= 1;
    } else if (direction == RIGHT) {
        destination_column += 1;
    } else if (direction == UP) {
        destination_line -= 1;
    } else {
        // direction is down
        destination_line += 1;
    }
    return [destination_line, destination_column];
}

Bangle.setOptions({
    lockTimeout: 60000,
    backlightTimeout: 60000,
});

let s = require("Storage");

// parse the levels a bit more to figure offsets delimiting next map.
function next_map_offsets(filename, start_offset) {
    let raw_maps = s.readArrayBuffer(filename);
    let offsets = [];
    // this is a very dumb parser : map starts three chars after the end of a line with a ';'
    // and ends two chars before next ';'
    let comment_line = true;
    for (let i = start_offset; i < raw_maps.length; i++) {
        if (raw_maps[i] == 59) { // ';'
            if (offsets.length != 0) {
                offsets.push(i - 2);
                return offsets;
            }
            comment_line = true;
        } else if (raw_maps[i] == 10) { // '\n'
            if (comment_line) {
                comment_line = false;
                offsets.push(i + 3);
            }
        }
    }
    if (offsets.length == 1) {
        offsets.push(raw_maps.length);
    }
    return offsets;
}

let config = s.readJSON("sokoban.json", true);
if (config === undefined) {
    let initial_offsets = next_map_offsets("sokoban.microban.sok", 0);
    config = {
        levels_sets: ["sokoban.microban.sok"], // all known files containing levels
        levels_set: 0, // which set are we using ?
        current_maps: [0], // what is current map on each set ?
        offsets: [initial_offsets], // known offsets for each levels set (binary positions of maps in each file)
    };
    s.writeJSON("sokoban.json", config);
}

let map = null;
let in_menu = false;
let history = null; // store history to allow undos


function load_map(filename, start_offset, end_offset, name) {
    console.log("loading map in", filename, "between", start_offset, "and", end_offset);
    let raw_map = new Uint8Array(s.readArrayBuffer(filename), start_offset, end_offset - start_offset);
    let dimensions = map_dimensions(raw_map);
    history = [];
    return new Map(dimensions, raw_map, filename, name);
}

function load_current_map() {
    let current_set = config.levels_set;
    let offsets = config.offsets[current_set];
    let set_filename = config.levels_sets[current_set];
    let set_name = set_filename.substring(8, set_filename.length - 4); // remove '.txt' and 'sokoban.'
    let current_map = config.current_maps[current_set];
    map = load_map(set_filename, offsets[2 * current_map], offsets[2 * current_map + 1], set_name + " " + (current_map + 1));
    map.display();
}

function next_map() {
    let current_set = config.levels_set;
    let current_map = config.current_maps[current_set];
    let offsets = config.offsets[current_set];
    let won = false;
    if (2 * (current_map + 1) >= offsets.length) {
        // we parse some new offsets
        let new_offsets = next_map_offsets(config.levels_sets[current_set], offsets[offsets.length - 1] + 2); // +2 since we need to start at ';' (we did -2 from ';' in previous parser call)
        if (new_offsets.length != 2) {
            won = true;
            E.showAlert("You Win", "All levels completed").then(function() {
                load();
            });
        } else {
            config.offsets[current_set].push(new_offsets[0]);
            config.offsets[current_set].push(new_offsets[1]);
        }
    }
    if (!won) {
        config.current_maps[current_set]++;
        s.writeJSON("sokoban.json", config);
        load_current_map();
    }
}

function previous_map() {
    let current_set = config.levels_set;
    let current_map = config.current_maps[current_set];
    if (current_map > 0) {
        current_map--;
        config.current_maps[current_set] = current_map;
        s.writeJSON("sokoban.json", config);
        load_current_map();
    }
}

function map_dimensions(raw_map) {
    let line_start = 0;
    let width = 0;
    let height = 0;
    for (let i = 0; i < raw_map.length; i++) {
        if (raw_map[i] == 10) {
            height += 1;
            let line_width = i - line_start;
            if (i > 0 && raw_map[i - 1] == 13) {
                line_width -= 1; // remove \r
            }
            width = Math.max(line_width, width);
            line_start = i + 1;
        }
    }
    return [width, height];
}

class Map {
    constructor(dimensions, raw_map, filename, name) {
        this.filename = filename;
        this.name = name;
        this.width = dimensions[0];
        this.height = dimensions[1];
        this.remaining_holes = 0;
        // start by creating an empty map
        this.m = [];
        for (let i = 0; i < this.height; i++) {
            let line = new Uint8Array(this.width);
            for (let j = 0; j < this.width; j++) {
                line[j] = SPACE;
            }
            this.m.push(line);
        }
        // now fill with raw_map's content
        let current_line = 0;
        let line_start = 0;
        for (let i = 0; i < raw_map.length; i++) {
            if (raw_map[i] == 32) {
                this.m[current_line][i - line_start] = SPACE;
            } else if (raw_map[i] == 43) {
                // '+'
                this.remaining_holes += 1;
                this.m[current_line][i - line_start] = HOLE;
                this.player_column = i - line_start;
                this.player_line = current_line;
            } else if (raw_map[i] == 10) {
                current_line += 1;
                line_start = i + 1;
            } else if (raw_map[i] == 35) {
                this.m[current_line][i - line_start] = WALL;
            } else if (raw_map[i] == 36) {
                this.m[current_line][i - line_start] = BOX;
            } else if (raw_map[i] == 46) {
                this.remaining_holes += 1;
                this.m[current_line][i - line_start] = HOLE;
            } else if (raw_map[i] == 64) {
                this.m[current_line][i - line_start] = SPACE;
                this.player_column = i - line_start;
                this.player_line = current_line;
            } else if (raw_map[i] == 42) {
                this.m[current_line][i - line_start] = FILLED;
            } else if (raw_map[i] != 13) {
                console.log("warning unknown map content", raw_map[i]);
            }
        }
        this.steps = 0;
        this.calibrate();
    }
    // compute scale
    calibrate() {
        let r = Bangle.appRect;
        let rwidth = 1 + r.x2 - r.x;
        let rheight = 1 + r.y2 - r.y;
        let cell_width = Math.floor(rwidth / this.width);
        let cell_height = Math.floor(rheight / this.height);
        let cell_scale = Math.min(cell_width, cell_height); // we want square cells
        let real_width = this.width * cell_scale;
        let real_height = this.height * cell_scale;
        let sx = r.x + Math.ceil((rwidth - real_width) / 2);
        let sy = r.y + Math.ceil((rheight - real_height) / 2);
        this.sx = sx;
        this.sy = sy;
        this.cell_scale = cell_scale;
    }
    undo(direction, pushing) {
        this.steps -= 1;

        let previous_position = go(this.player_line, this.player_column, 3 - direction);
        let previous_line = previous_position[0];
        let previous_column = previous_position[1];

        if (pushing) {
            // put the box back on current player position
            let currently_on = this.m[this.player_line][this.player_column];
            if (currently_on == HOLE) {
                this.remaining_holes -= 1;
                this.m[this.player_line][this.player_column] = FILLED;
            } else {
                this.m[this.player_line][this.player_column] = BOX;
            }
            // now, remove the box from its current position
            let current_box_position = go(this.player_line, this.player_column, direction);
            let box_line = current_box_position[0];
            let box_column = current_box_position[1];
            let box_on = this.m[box_line][box_column];
            if (box_on == FILLED) {
                this.remaining_holes += 1;
                this.m[box_line][box_column] = HOLE;
            } else {
                this.m[box_line][box_column] = SPACE;
            }
            this.display_cell(box_line, box_column);
        }
        // cancel player display
        this.display_cell(this.player_line, this.player_column);
        // re-display player at previous position
        this.player_line = previous_line;
        this.player_column = previous_column;
        this.display_player();
    }
    move(direction) {
        let destination_position = go(this.player_line, this.player_column, direction);
        let destination_line = destination_position[0];
        let destination_column = destination_position[1];
        let destination = this.m[destination_line][destination_column];
        let pushing = false;
        if (destination == BOX || destination == SPACE || destination == HOLE || destination == FILLED) {
            if (destination == BOX || destination == FILLED) {
                pushing = true;
                let after_line = 2 * destination_line - this.player_line;
                let after_column = 2 * destination_column - this.player_column;
                let after = this.m[after_line][after_column];
                let will_remain = SPACE;
                if (destination == FILLED) {
                    will_remain = HOLE;
                }
                if (after == SPACE) {
                    if (will_remain == HOLE) {
                        this.remaining_holes += 1;
                    }
                    this.m[destination_line][destination_column] = will_remain;
                    this.m[after_line][after_column] = BOX;
                } else if (after == HOLE) {
                    this.m[destination_line][destination_column] = will_remain;
                    this.m[after_line][after_column] = FILLED;
                    if (will_remain == SPACE) {
                        this.remaining_holes -= 1;
                    }
                    if (this.remaining_holes == 0) {
                        in_menu = true;
                        this.steps += 1;
                        E.showAlert("" + this.steps + "steps", "You Win").then(function() {
                            in_menu = false;
                            next_map();
                        });
                        return;
                    }
                } else {
                    return;
                }
                this.display_cell(after_line, after_column);
                this.display_cell(destination_line, destination_column);
            }
            history.push([direction, pushing]);
            this.display_cell(this.player_line, this.player_column);
            this.steps += 1;
            this.player_line = destination_line;
            this.player_column = destination_column;
            this.display_player();
            // this.display();
        }
    }
    display_player() {
        sx = this.sx;
        sy = this.sy;
        cell_scale = this.cell_scale;
        g.setColor(0.8, 0.8, 0).fillCircle(sx + (0.5 + this.player_column) * cell_scale, sy + (0.5 + this.player_line) * cell_scale, cell_scale / 2 - 1); // -1 because otherwise it overfills
    }
    display_cell(line, column) {
        sx = this.sx;
        sy = this.sy;
        cell_scale = this.cell_scale;
        let shape = this.m[line][column];
        if (shape == WALL) {
            if (cell_scale < 10) {
                g.setColor(1, 0, 0).fillRect(sx + column * cell_scale, sy + line * cell_scale, sx + (column + 1) * cell_scale, sy + (line + 1) * cell_scale);
            } else {
                g.setColor(0.5, 0.5, 0.5).fillRect(sx + column * cell_scale, sy + line * cell_scale, sx + (column + 1) * cell_scale, sy + (line + 1) * cell_scale);
                g.setColor(1, 0, 0).fillRect(sx + column * cell_scale, sy + (line + 0.15) * cell_scale, sx + (column + 0.35) * cell_scale, sy + (line + 0.45) * cell_scale);
                g.fillRect(sx + (column + 0.55) * cell_scale, sy + (line + 0.15) * cell_scale, sx + (column + 1) * cell_scale, sy + (line + 0.45) * cell_scale);
                g.fillRect(sx + column * cell_scale, sy + (line + 0.65) * cell_scale, sx + (column + 0.65) * cell_scale, sy + (line + 0.95) * cell_scale);
                g.fillRect(sx + (column + 0.85) * cell_scale, sy + (line + 0.65) * cell_scale, sx + (column + 1) * cell_scale, sy + (line + 0.95) * cell_scale);
            }
        } else if (shape == BOX) {
            let border = Math.floor((cell_scale - 2) / 4);
            if (border > 0) {
                g.setColor(0.6, 0.4, 0.3).fillRect(sx + column * cell_scale + 1, sy + line * cell_scale + 1, sx + (column + 1) * cell_scale - 1, sy + (line + 1) * cell_scale - 1);
                g.setColor(0.7, 0.5, 0.5).fillRect(sx + column * cell_scale + 1 + border, sy + line * cell_scale + 1 + border, sx + (column + 1) * cell_scale - 1 - border, sy + (line + 1) * cell_scale - 1 - border);
            } else {
                g.setColor(0.7, 0.5, 0.5).fillRect(sx + column * cell_scale + 1, sy + line * cell_scale + 1, sx + (column + 1) * cell_scale - 1, sy + (line + 1) * cell_scale - 1);
            }
        } else if (shape == HOLE) {
            g.setColor(1, 1, 1).fillRect(sx + column * cell_scale, sy + line * cell_scale, sx + (column + 1) * cell_scale - 1, sy + (line + 1) * cell_scale - 1);
            g.setColor(0, 0, 1).drawRect(sx + column * cell_scale, sy + line * cell_scale, sx + (column + 1) * cell_scale - 1, sy + (line + 1) * cell_scale - 1);
        } else if (shape == FILLED) {
            let border = Math.floor((cell_scale - 2) / 4);
            if (border > 0) {
                g.setColor(0.6, 0.4, 0.3).fillRect(sx + column * cell_scale + 1, sy + line * cell_scale + 1, sx + (column + 1) * cell_scale - 1, sy + (line + 1) * cell_scale - 1);
                g.setColor(0, 0, 1).fillRect(sx + column * cell_scale + 1 + border, sy + line * cell_scale + 1 + border, sx + (column + 1) * cell_scale - 1 - border, sy + (line + 1) * cell_scale - 1 - border);
            } else {
                g.setColor(0, 0, 1).fillRect(sx + column * cell_scale + 1 + border, sy + line * cell_scale + 1 + border, sx + (column + 1) * cell_scale - 1 - border, sy + (line + 1) * cell_scale - 1 - border);
                
            }
        } else if (shape == SPACE) {
            g.setColor(1, 1, 1).fillRect(sx + column * cell_scale, sy + line * cell_scale, sx + (column + 1) * cell_scale - 1, sy + (line + 1) * cell_scale - 1);
        }

    }
    display() {
        g.clear();
        for (let line = 0; line < this.height; line++) {
            for (let column = 0; column < this.width; column++) {
                this.display_cell(line, column);
            }
        }
        this.display_player();
        g.setColor(0, 0, 0).setFont("6x8:2")
            .setFontAlign(0, -1, 0)
            .drawString(map.name, g.getWidth() / 2, 0);
    }
}


Bangle.on('touch', function(button, xy) {
    if (in_menu) {
        return;
    }
    let half_width = g.getWidth() / 2;
    let half_height = g.getHeight() / 2;
    let directions_amplitudes = [0, 0, 0, 0];
    directions_amplitudes[LEFT] = half_width - xy.x;
    directions_amplitudes[RIGHT] = xy.x - half_width;
    directions_amplitudes[UP] = half_height - xy.y;
    directions_amplitudes[DOWN] = xy.y - half_height;

    let max_direction;
    let second_max_direction;
    if (directions_amplitudes[0] > directions_amplitudes[1]) {
        max_direction = 0;
        second_max_direction = 1;
    } else {
        max_direction = 1;
        second_max_direction = 0;
    }
    for (let direction = 2; direction < 4; direction++) {
        if (directions_amplitudes[direction] > directions_amplitudes[max_direction]) {
            second_max_direction = max_direction;
            max_direction = direction;
        } else if (directions_amplitudes[direction] >= directions_amplitudes[second_max_direction]) {
            second_max_direction = direction;
        }
    }
    if (directions_amplitudes[max_direction] - directions_amplitudes[second_max_direction] > 10) {
        // if there is little possible confusions between two candidate moves let's move.
        // basically we forbid diagonals of 10 pixels wide
        map.move(max_direction);
    }

});

Bangle.on('swipe', function(directionLR, directionUD) {
    if (in_menu) {
        return;
    }
    let last_move = history.pop();
    if (last_move !== undefined) {
        map.undo(last_move[0], last_move[1]);
    }
});

setWatch(
    function() {
        if (in_menu) {
            return;
        }
        in_menu = true;
        const menu = {
            "": {
                title: "choose action"
            },
            "restart": function() {
                E.showMenu();
                load_current_map();
                in_menu = false;
            },
            "current map": {
                value: config.current_maps[config.levels_set] + 1,
                min: 1,
                max: config.offsets[config.levels_set].length / 2,
                onchange: (v) => {
                    config.current_maps[config.levels_set] = v - 1;
                    load_current_map();
                    s.writeJSON("sokoban.json", config);
                }
            },
            "next map": function() {
                E.showMenu();
                next_map();
                in_menu = false;
            },
            "previous map": function() {
                E.showMenu();
                previous_map();
                in_menu = false;
            },
            "back to game": function() {
                E.showMenu();
                g.clear();
                map.display();
                in_menu = false;
            },
        };
        E.showMenu(menu);
    },
    BTN1, {
        repeat: true
    }
);


Bangle.setLocked(false);

current_map = config.current_map;
offsets = config.offsets;
load_current_map();
