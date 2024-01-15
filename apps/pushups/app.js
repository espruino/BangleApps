
Bangle.loadWidgets();

const ACTIVITIES = ["pushups", "situps"];
const POSITIONS = [2, 2];
const GOALS = [10, 10];
const DETECTORS = [
  (xyz) => {
    return (xyz.y > 0.4)?1:0;
  },
  (xyz) => {
    if (xyz.x > 0.8 && xyz.z > -0.5) {
      return 1;
    } else if (xyz.x < 0.8 && xyz.z < -0.5) {
      return 0;
    } else {
      return null;
    }
  }
];

let current_activity = 0;
let current_status = 0;

 // to get rid of noise we'll need to count how many measures confirm where we think we are
let counts_in_opposite_status = 0;
let remaining = 10;


function display() {
  g.clear();
  g.setColor(0, 0, 0);
  g.setFont("Vector:80").setFontAlign(0, 0).drawString(""+remaining, g.getWidth()/2, g.getHeight()/2);
  g.setFont("6x8:2").setFontAlign(0, 1).drawString(ACTIVITIES[current_activity], g.getWidth()/2, g.getHeight());
  Bangle.drawWidgets();
  g.flip();
}

display();

Bangle.setPollInterval(80);


setWatch(
  function () {
    load();
  },
  BTN1,
  {
    repeat: true,
  }
);

Bangle.on('swipe', function(directionLR, directionUD) { 
  if (directionUD == -1) {
    remaining += 1;
  } else if (directionUD == 1) {
    remaining = Math.max(remaining-1, 1);
  } else if (directionLR == -1) {
    remaining += 5;
  } else if (directionLR == 1) {
    remaining = Math.max(remaining-5, 1);
  }
  display();
});

Bangle.on('accel', function(xyz) { 
  let new_status = DETECTORS[current_activity](xyz);
  if (new_status === null) {
    return;
  }
  if (new_status != current_status) {
    counts_in_opposite_status += 1;

    if (counts_in_opposite_status == 6) {
      current_status = 1-current_status;
      counts_in_opposite_status = 0;
      if (current_status == 0) {
        remaining -= 1;
        display();
        if (remaining == 0) {
          Bangle.buzz(500);
        }
      }
      Bangle.buzz(100);
    }
  } else {
    counts_in_opposite_status = 0;
  }
});
