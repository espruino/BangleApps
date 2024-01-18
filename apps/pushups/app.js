
Bangle.loadWidgets();

const ACTIVITIES = ["pushups", "situps", "squats"];
let routine = [[0, 10], [1, 10], [2, 10]];

const DETECTORS = [
  (xyz) => {
    return (xyz.y > 0.4)?1:0;
  },
  (xyz) => {
    return (xyz.x > 0)?1:0;
  },
  (xyz) => {
    if (xyz.z > -1) {
      return 0;
    } else if (xyz.z < -1.1) {
      return 1;
    } else {
      return null;
    }
  }
];

let routine_step = 0;
let current_status = 0;

// to get rid of noise we'll need to count how many measures confirm where we think we are
let counts_in_opposite_status = 0;
let remaining = routine[routine_step][1];


function display() {
  g.clear();
  g.setColor(0, 0, 0);
  g.setFont("Vector:80").setFontAlign(0, 0).drawString(""+remaining, g.getWidth()/2, g.getHeight()/2);
  let activity = ACTIVITIES[routine[routine_step][0]];
  g.setFont("6x8:2").setFontAlign(0, 1).drawString(activity, g.getWidth()/2, g.getHeight());
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
    if (routine_step < routine.length -1) {
      routine_step += 1;
      remaining = routine[routine_step][1];
    }
  } else if (directionLR == 1) {
    if (routine_step > 0) {
      routine_step -= 1;
      remaining = routine[routine_step][1];
    }
  }
  display();
});

Bangle.on('accel', function(xyz) { 
  let activity = routine[routine_step][0];
  let new_status = DETECTORS[activity](xyz);
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
          Bangle.buzz(500).then(() => {
            routine_step += 1;
            if (routine_step >= routine.length) {
              load();
            }
            remaining = routine[routine_step][1];
            display();
          })
        }
      }
      Bangle.buzz(100);
    }
  } else {
    counts_in_opposite_status = 0;
  }
});
