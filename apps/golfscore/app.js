const menu = require("graphical_menu");

let holes_count = 18;
let course = new Array(holes_count).fill(0);
let total_strokes = 0;

const mainmenu = {
  "": {
    "title": "-- Golf --"
  },
  "Holes": {
    value: holes_count,
    min: 1, max: 20, step: 1, wrap: true,
    onchange: v => { holes_count = v; add_holes(); }
  },
  "Total Strokes": {
    value: total_strokes,
  },
};

function updateTotalStrokes() {
  total_strokes = course.reduce((acc, strokes) => acc + strokes, 0);
  mainmenu["Total Strokes"].value = total_strokes;
}

function inc_hole(i) { return function (v) { course[i] = v; updateTotalStrokes(); }; }

function add_holes() {
  for (let j = 0; j < 100; j++) {
    delete mainmenu["Hole - " + (j + 1)];
  }
  for (let i = 0; i < holes_count; i++) {
    course[i] = 0;
    mainmenu["Hole - " + (i + 1)] = hole_menu(i);
  }
  E.showMenu(mainmenu);
}

function hole_menu(i) {
  return function () {
    E.showMenu(submenu(i));
  };
}

function submenu(i) {
  return {
    "": {
      "title": `-- Hole ${i + 1}--`
    },
    "strokes:": {
      value: course[i],
      min: 1, max: 20, step: 1, wrap: true,
      onchange: inc_hole(i)
    },
    "Next hole": hole_menu(i + 1),
    "< Back": function () { E.showMenu(mainmenu); },
  };
}

g.clear();
add_holes();
E.showMenu(mainmenu);