// @ts-check
// @ts-ignore
const menu = require("graphical_menu");
/**
 * @type {{showMenu: (config) => void}}
 */
let E;
/**
 * @type {{clear: () => void}}
 */
let g;

let holes_count = 18;
let player_count = 4;
/**
 * @type {number[][]}
 */
let course = new Array(holes_count).map(() => new Array(player_count).fill(0));

const main_menu = {
  "": {
    "title": "-- Golf --"
  },
  "Setup": function () { E.showMenu(setup_menu); },
  "Score Card": function () {
    calculate_score();
    E.showMenu(score_card);
  },
};

function calculate_score() {
  let scores = course.reduce((acc, hole) => {
    hole.forEach((stroke_count, player) => {
      acc[player] = acc[player]+stroke_count;
    });
    return acc;
  }, new Array(player_count).fill(0));

  score_card = {
    "": {
      "title": "score card"
    },
    "< Back": function () { E.showMenu(main_menu); },
  };

  for (let player = 0; player < player_count; player++) {
    score_card["Player - " + (player + 1)] = {
      value: scores[player]
    };
  }
}

let score_card = {};

const setup_menu = {
  "": {
    "title": "-- Golf Setup --"
  },
  "Holes": {
    value: holes_count,
    min: 1, max: 20, step: 1, wrap: true,
    onchange: v => { holes_count = v; add_holes(); }
  },
  "Players": {
    value: player_count,
    min: 1, max: 10, step: 1, wrap: true,
    onchange: v => { player_count = v; }
  },
  "< Back": function () { E.showMenu(main_menu); },
};

function inc_hole(i, player) { return function (v) { course[i][player] = v; }; }

function add_holes() {
  for (let j = 0; j < 20; j++) {
    delete main_menu["Hole - " + (j + 1)];
  }
  for (let i = 0; i < holes_count; i++) {
    course[i] = new Array(player_count).fill(0);
    main_menu["Hole - " + (i + 1)] = goto_hole_menu(i);
  }
  E.showMenu(main_menu);
}

function goto_hole_menu(i) {
  return function () {
    E.showMenu(hole_menu(i));
  };
}

function hole_menu(i) {
  let menu = {
    "": {
      "title": `-- Hole ${i + 1}--`
    },
    "Next hole": goto_hole_menu(i + 1),
    "< Back": function () { E.showMenu(main_menu); },
  };

  for (let player = 0; player < player_count; player++) {
    menu[`player - ${player + 1}`] = {
      value: course[i][player],
      min: 1, max: 20, step: 1, wrap: true,
      onchange: inc_hole(i, player)
    };
  }

  return menu;
}

// @ts-ignore
g.clear();
add_holes();