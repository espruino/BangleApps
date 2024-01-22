let h = require("heatshrink");

Bangle.loadWidgets();

//TODO: should we force not moving for planks and rests

const ACTIVITIES = ["pushups", "situps", "squats", "plank", "jacks", "rest"];
const IMAGES = [
  h.decompress(
    atob(
      "mEwwhC/AH4A/AH4A/ACcEogXVolEoAuVAAIXYhvdC6vdAAPQL6QuBAAaPRhtNDAgyQDQIXE7qYPC48iMaFM5gWC6kikAXPpvMDAXSC6BIBhoYB5oXBJB4XBOQPc5lCC4IYPC4StBCwUikgvQAAMCC4TlCeZgHFC4YYKFwoADkgXCDBIuHEQgACOpZTKC6oNGiIASC7YA/AH4A/AH4AdA"
    )
  ),
  h.decompress(
    atob(
      "mEwwhC/AH4A/ADlEogWUggXBoAuVAAQXXDKQXGJaAXXO4RhVCYSSWGQTZWFy8wC6c0olDmYXTmdEmYXVAARITC4YwTgYXHkUgC6JICgUiDBxIFCwQwTIoIADC6MyC4hIRCwgwRFggwPC4JFESKRbGJB4uFYSMDLI5IPIA7aQkUwA4hIBE5AASC7IA/AH4A/ACwA="
    )
  ),
  h.decompress(
    atob(
      "mEwwhC/AFUN7vQC6ndAAIuVAAIwTC/53fU7AAugUjmczmRjCPp4VBAAM9C4h+MgYXDloXRCwczCwpHMCoU4u51RIwc3uAXVw4XSLoZGSL35e/AB0IxAADxvdAAIXX6AX8gBfWGAcikgWCC54ADhpGRAAguDC65GWL35eyF4ZGTC7BJCCygA+"
    )
  ),
  h.decompress(
    atob(
      "mEwwhC/AH4A/AH4A/AHkEolAC6lEAAIuVAAIwTC6nd7oXTCoIAB6AXPgVNCwYwCO5siCopIEFxUCkUtC44AMkQX/CowACUogXLQAIXHbAgAHV4QXFTwa7IbwdEoQWCEg4sIC4kgHhAtJC4RULAAJQBC4qZKE4oXENwYXPP5KGLFJgA/AH4A/AH4AUA=="
    )
  ),
  h.decompress(
    atob(
      "mEwwhC/AFdEogWUggXBoAuVC7BIUC7RHPE4h3GAwKJPIwiVLBYQMHMgZNJBoY+EBBAYKoUikUkSaAXJSRxjBCwIXCeKMEC4UiCyIABC4bvTC/4AGhvdAAQXX6AXRCwYwSFwgwSCwoXQFwfQAgYXSGggwOFIowQCAQoEGB4nHD44XJBwxINEwRQOBo4MIJBouDmYACBQwAKgYWDAAMwa5wXCAoYXRADBIEIyQAGDJoWCCAgHHCxANIDBkDBawA/ADQA=="
    )
  ),
  h.decompress(
    atob(
      "mEwwhC/AH4AU1QAGC/4XXAAkKC6wWB0Au/F3KvPFw4XOLpAXOLpaBKRhgMBEZAKKHYYKKK5IjLC5alNC5BSOC5AuLe5guKABQuWd54XYgUiAAUgC7IAPC64ACC4IWUGIIu/F2a/va7QA/AH4AGA="
    )
  )
];

const DETECTORS = [
  (xyz) => {
    return xyz.y > 0.4 ? 1 : 0;
  },
  (xyz) => {
    return xyz.x > 0 ? 1 : 0;
  },
  (xyz) => {
    if (xyz.z > -1) {
      return 0;
    } else if (xyz.z < -1.1) {
      return 1;
    } else {
      return null;
    }
  },
  null,
  (xyz) => {
    if ((xyz.x > 0) && (xyz.y < 0) && xyz.z < -0.25) {
      return 0;
    }
    if ((xyz.x < 0) && (xyz.y > 0) && xyz.z > -0.25) {
      return 1;
    }
    return null;
  },
  null
];

class FitnessStatus {
  constructor(duration) {
    this.routine = [
      [0, 10],
      [1, 10],
      [2, 10],
      [3, 30],
      [4, 10],
      [5, 30],
    ];
    this.routine_step = 0;
    this.current_status = 0;

    // to get rid of noise we'll need to count how many measures confirm where we think we are
    this.counts_in_opposite_status = 0;
    this.remaining = this.routine[this.routine_step][1];
    this.activity_start = getTime();
    this.starting_time = this.activity_start;
    this.duration = duration;
    this.completed = false;
  }

  display() {
    g.clear();
    g.setColor(0, 0, 0);
    if (this.completed) {
      g.setFont("Vector:40")
        .setFontAlign(0, 0)
        .drawString("Good Job!", g.getWidth()/2, g.getHeight()/2);
      return;
    }
    let activity = this.routine[this.routine_step][0];
    let countdown = this.remaining;
    if (DETECTORS[activity] === null) {
      countdown = this.remaining - Math.floor(getTime() - this.activity_start);
    }
    g.setFont("Vector:70")
      .setFontAlign(0, 0)
      .drawString("" + countdown, (g.getWidth() * 3) / 10, g.getHeight() / 2);
    let activity_name = ACTIVITIES[activity];
    g.drawImage(IMAGES[activity], g.getWidth() / 2, (g.getHeight() * 1) / 5, {
      scale: 2,
    });
    let global_countdown = "";
    if (this.duration !== null) {
      let elapsed = getTime() - this.starting_time;
      let remaining = Math.max(0, this.duration - elapsed);
      let seconds = Math.floor(remaining % 60);
      let minutes = Math.floor(remaining / 60) % 60;
      let hours = Math.floor(remaining / 3600);
      if (hours > 0) {
        global_countdown = " / " + hours + "h" + minutes +"m" + seconds + "s";
      } else if (minutes > 0) {
        global_countdown = " / " + minutes +"m" + seconds + "s";
      } else {
        global_countdown = " / " + seconds + "s";
      }
    }
    g.setFont("6x8:2")
      .setFontAlign(0, 1)
      .drawString(activity_name+global_countdown, g.getWidth() / 2, g.getHeight());
    Bangle.drawWidgets();
    g.flip();
  }

  first_activity() {
    return this.routine_step == 0;
  }

  last_activity() {
    return this.routine_step == this.routine.length - 1;
  }

  next_activity() {
    this.routine_step += 1;

    this.completed = (this.duration===null)?(this.routine_step >= this.routine_length):(getTime() - this.starting_time > this.duration);

    if (this.completed) {
      Bangle.buzz(1000).then(() => {
        load();
      });
      return;
    }
    this.routine_step = this.routine_step % this.routine.length;
    this.remaining = this.routine[this.routine_step][1];
    // this.display();
    this.activity_start = getTime();
    this.current_status = 0;
    this.counts_in_opposite_status = 0;
  }

  previous_activity() {
    this.routine_step -= 1;
    this.remaining = this.routine[this.routine_step][1];
    // this.display();
    this.activity_start = getTime();
    this.current_status = 0;
    this.counts_in_opposite_status = 0;
  }

  detect(xyz) {
    let activity = this.routine[this.routine_step][0];
    let detector = DETECTORS[activity];
    if (detector === null) {
      // it's time based
      let activity_duration = getTime() - this.activity_start;
      if (activity_duration > this.remaining) {
        Bangle.buzz(500).then(() => {
          status.next_activity();
        });
      }
      return;
    }
    // it's movement based
    let new_status = DETECTORS[activity](xyz);
    if (new_status === null) {
      return;
    }
    if (new_status != this.current_status) {
      this.counts_in_opposite_status += 1;

      // we consider 6 counts to smooth out noise
      if (this.counts_in_opposite_status == 6) {
        this.current_status = 1 - this.current_status;
        this.counts_in_opposite_status = 0;
        if (this.current_status == 0) {
          this.remaining -= 1;
          // this.display();
          if (this.remaining == 0) {
            Bangle.buzz(500).then(() => {
              status.next_activity();
            });
          }
        }
        Bangle.buzz(100);
      }
    } else {
      this.counts_in_opposite_status = 0;
    }
  }
}

let status = new FitnessStatus(10 * 60);
// status.display();

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

Bangle.on("swipe", function (directionLR, directionUD) {
  if (directionUD == -1) {
    status.remaining += 1;
  } else if (directionUD == 1) {
    status.remaining = Math.max(status.remaining - 1, 1);
  } else if (directionLR == -1) {
    if (!status.last_activity()) {
      status.next_activity();
    }
  } else if (directionLR == 1) {
    if (!status.first_activity()) {
      status.previous_activity();
    }
  }
  // status.display();
});

Bangle.on("accel", function (xyz) {
  status.detect(xyz);
});

setInterval(() => {
  status.display();
}, 250);
