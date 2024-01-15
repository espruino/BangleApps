
Bangle.loadWidgets();

const UP = 0;
const DOWN = 1;

let status = UP;

 // to get rid of noise we'll need to count how many measures confirm where we think we are
let counts_in_opposite_status = 0;
let remaining_pushups = 10;

function display() {
  g.clear();
  g.setColor(0, 0, 0);
  g.setFont("Vector:80").setFontAlign(0, 0).drawString(""+remaining_pushups, g.getWidth()/2, g.getHeight()/2);
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
    remaining_pushups += 1;
  } else if (directionUD == 1) {
    remaining_pushups = Math.max(remaining_pushups-1, 1);
  } else if (directionLR == -1) {
    remaining_pushups += 5;
  } else if (directionLR == 1) {
    remaining_pushups = Math.max(remaining_pushups-5, 1);
  }
  display();
});

Bangle.on('accel', function(xyz) { 
  let new_status = (xyz.y > 0.4)?DOWN:UP;
  if (new_status != status) {
    counts_in_opposite_status += 1;

    if (counts_in_opposite_status == 6) {
      status = 1-status;
      counts_in_opposite_status = 0;
      if (status == UP) {
        remaining_pushups -= 1;
        display();
        if (remaining_pushups == 0) {
          Bangle.buzz(500);
        }
      }
      Bangle.buzz(100);
    }
  } else {
    counts_in_opposite_status = 0;
  }
});
