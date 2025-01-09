let h = require("heatshrink");

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

// number of movements or duration required for each activity
const DEFAULTS = [7, 10, 10, 30, 15, 30];

// detector sensitivity for each activity
// (less is more reactive but more sensitive to noise)
const COUNTS = [6, 10, 6, 6, 6, 5];

function default_config() {
  return {duration: 10*60, routine: default_routine()};
}

function default_routine() {
  let routine = [];
  DEFAULTS.forEach((d, i) => {
    routine.push([i, d]);
  });
  return routine;
}

const DETECTORS = [
  (xyz) => {
    "ram"
    if (xyz.y > 0.15) {
      return 1;
    } else if (xyz.y < 0.1) {
      return 0;
    } else {
      return null;
    }
  },
  (xyz) => {
    "ram"
    if (xyz.x > 0.075) {
      return 1;
    } else if (xyz.x < -0.075) {
      return 0;
    } else {
      return null;
    }
    // return xyz.x > 0 ? 1 : 0;
  },
  (xyz) => {
    "ram"
    if (xyz.z > -0.4) {
      return 0;
    } else if (xyz.z < -0.6) {
      return 1;
    } else {
      return null;
    }
  },
  null,
  (xyz) => {
    "ram"
    if (xyz.x < -0.8) {
      return 0;
    }
    if (xyz.x > 0.3) {
      return 1;
    }
    return null;
  },
  null
];

class FitnessStatus {
  constructor(config) {
    this.routine = config.routine;
    this.routine_step = 0;
    this.current_status = 0;
    this.buzzing = false;

    // to get rid of noise we'll need to count how many measures confirm where we think we are
    this.counts_in_opposite_status = 0;
    this.remaining = this.routine[this.routine_step][1];
    this.activity_start = getTime();
    this.starting_time = this.activity_start;
    this.duration = config.duration;
    this.completed = false;
  }

  display() {
    g.setBgColor(g.theme.bg);
    g.clear();
    g.setColor(g.theme.fg);
    if (this.completed) {
      g.setFont("Vector:32")
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
        Bangle.setPollInterval(80); // default poll interval
        Bangle.accelWr(0x18, 0b01101100); // off, +-4g
        Bangle.accelWr(0x1B, 0x0); // default 12.5hz output
        Bangle.accelWr(0x18, 0b11101100); // +-4g
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
    this.buzzing = false;
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
    if (this.buzzing) {
      return;
    }
    let activity = this.routine[this.routine_step][0];
    let detector = DETECTORS[activity];
    let status = this;
    if (detector === null) {
      // it's time based
      let activity_duration = getTime() - this.activity_start;
      if (activity_duration > this.remaining) {
        this.buzzing = true;
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

      if (this.counts_in_opposite_status == COUNTS[activity]) {
        this.current_status = 1 - this.current_status;
        this.counts_in_opposite_status = 0;
        if (this.current_status == 0) {
          this.remaining -= 1;
          // this.display();
          if (this.remaining == 0) {
            this.buzzing = true;
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


function start_routine(config) {
  let status = new FitnessStatus(config);

  Bangle.accelWr(0x18,0b01110100); // off, +-8g // NOTE: this code is taken from 'accelrec' app
  Bangle.accelWr(0x1B,0x03 | 0x40); // 100hz output, ODR/2 filter
  Bangle.accelWr(0x18,0b11110100); // +-8g
  Bangle.setPollInterval(10);

  status.remaining = status.routine[status.routine_step][1];
  Bangle.loadWidgets();
  
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
  }, 350);

}


function edit_menu(config) {
  let routine = config.routine;

  E.showScroller({
  h : 60,
  c : routine.length+2,
  draw : function(idx, r) { 
    g.setColor(g.theme.fg).drawRect(r.x, r.y, r.w, r.h);
    if (idx == routine.length + 1) {
      g.setFont("Vector:28").setFontAlign(0, 0).drawString("Ok", r.x+r.w/2, r.y+r.h/2);
    } else if (idx == routine.length) {
      g.setFont("Vector:28").setFontAlign(0, 0).drawString("Add", r.x+r.w/2, r.y+r.h/2);
    } else {
      let activity = routine[idx][0];
      let count = routine[idx][1];
      let img = IMAGES[activity];
      g.drawImage(img, r.x + r.w / 5, r.y + 10);
      g.setFont("6x8:2").setFontAlign(0, 0).drawString(""+count, r.x+r.w*4/5, r.y+r.h/2);
    }
  },
  select : function(idx) {
    if (idx == routine.length + 1) {
      E.showScroller();    
      set_duration(config);
    } else if (idx == routine.length) {
      E.showScroller();    
      add_activity(config);
    } else {
      E.showScroller();    
      set_counter(config, idx);
    }
  }
  });
}


function add_activity(config) {
  E.showScroller({
  h : 60,
  c : IMAGES.length,
  draw : function(idx, r) { 
    g.setColor(g.theme.fg).drawRect(r.x, r.y, r.w, r.h);
    let img = IMAGES[idx];
    g.drawImage(img, r.x + r.w / 3, r.y + 10);
  },
  select : function(idx) {
    let new_index = config.routine.length;
    config.routine.push([idx, 10]);
    E.showScroller();    
    set_counter(config, new_index);
  }
  });
}


function set_counter(config, index) {
  let w = g.getWidth();
  let h = g.getHeight();
  let counter = config.routine[index][1];
  function display() {
    g.clear();
    g.setFont("6x8:2")
     .setFontAlign(1, 0)
     .drawString("+1", w, h/2);
    g.setFontAlign(-1, 0)
     .drawString("-1", 0, h/2);
    g.setFontAlign(0, -1)
     .drawString("+5", w/2, 0);
    g.setFontAlign(0, 1)
     .drawString("-5", w/2, h);
    g.setFont("Vector:64")
     .setFontAlign(0, 0)
     .drawString(""+counter, w/2, h/2);
  }
  display();
  Bangle.on("swipe", function (directionLR, directionUD) {
    if (directionUD == -1) {
      counter += 5;
    } else if (directionUD == 1) {
      counter -= 5;
    } else if (directionLR == -1) {
      counter -= 1;
    } else if (directionLR == 1) {
      counter += 1;
    }
    if (counter < 0) {
      counter = 0;
    }
    display();
  });
  Bangle.on("touch", function(button, xy) {
    if (counter == 0) {
      config.routine.splice(index, 1);
    } else {
      config.routine[index][1] = counter;
    }
    Bangle.removeAllListeners("touch");
    Bangle.removeAllListeners("swipe");
    edit_menu(config);
  });
  
}


//TODO: factorize code with set_counter
function set_duration(config) {
  let w = g.getWidth();
  let h = g.getHeight();
  let duration = config.duration;
  let minutes = Math.floor(duration / 60);
  function display() {
    g.setBgColor(g.theme.bg);
    g.clear();
    g.setColor(g.theme.fg);
    g.setFont("6x8:2")
     .setFontAlign(1, 0)
     .drawString("+1", w, h/2);
    g.setFontAlign(-1, 0)
     .drawString("-1", 0, h/2);
    g.setFontAlign(0, -1)
     .drawString("+5", w/2, 0);
    g.setFontAlign(0, 1)
     .drawString("-5", w/2, h);
    g.drawString("minutes", w/2, h-40);
    g.setFont("Vector:64")
     .setFontAlign(0, 0)
     .drawString(""+minutes, w/2, h/2);
  }
  display();
  Bangle.on("swipe", function (directionLR, directionUD) {
    if (directionUD == -1) {
      minutes += 5;
    } else if (directionUD == 1) {
      minutes -= 5;
    } else if (directionLR == -1) {
      minutes -= 1;
    } else if (directionLR == 1) {
      minutes += 1;
    }
    if (minutes < 1) {
      minutes = 1;
    }
    display();
  });
  Bangle.on("touch", function(button, xy) {
    Bangle.removeAllListeners("touch");
    Bangle.removeAllListeners("swipe");
    config.duration = minutes * 60;
    //TODO: don't write if no change
    require("Storage").writeJSON("pushups.cfg", config);
    start_routine(config);
  });
  
}

function main_menu(config) {
  let w = g.getWidth();
  let h = g.getHeight();
  g.setBgColor(g.theme.bg);
  g.clear();
  g.setColor(g.theme.fg);
  g.drawRect(10, 10, w-10, h/2-10);
  g.drawRect(10, h/2+10, w-10, h-10);
  g.setFont("Vector:32")
   .setFontAlign(0, 0)
   .drawString("Start", w/2, h/4);
  g.drawString("Edit", w/2, 3*h/4);
  Bangle.setLocked(false);
  Bangle.on("touch", function(button, xy) {
    if (xy.y > h/2+10) {
      g.setColor(g.theme.fg);
      g.fillRect(10, h/2+10, w-10, h-10);
      g.setColor(g.theme.bg)
       .setFont("Vector:32")
       .setFontAlign(0, 0)
       .drawString("Edit", w/2, 3*h/4);
      Bangle.removeAllListeners("touch");
      edit_menu(config);
    } else if (xy.y < h/2-10) {
      g.setColor(g.theme.fg);
      g.fillRect(10, 10, w-10, h/2-10);
      g.setColor(g.theme.bg)
       .setFont("Vector:32")
       .setFontAlign(0, 0)
       .drawString("Start", w/2, h/4);
      Bangle.removeAllListeners("touch");
      set_duration(config);
    }
  })
}


let config = require("Storage").readJSON("pushups.cfg", true);

if (config === undefined) {
  config = default_config();
}

main_menu(config);
