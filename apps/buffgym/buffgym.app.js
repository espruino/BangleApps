/* global g, setWatch, clearWatch, reset, BTN1, BTN2, BTN3 */

(() => {
  const W = g.getWidth();
  const H = g.getHeight();
  const RED = "#d32e29";
  const PINK = "#f05a56";
  const WHITE = "#ffffff";

  const Set = require("set.js");
  const Exercise = require("exercise.js");
  const Program = require("program.js");

  function centerStringX(str) {
    return (W - g.stringWidth(str)) / 2;
  }

  function iconIncrement() {
    const img = require("heatshrink").decompress(atob("ikUxH+AA3XAAgNHCJIVMBYXQ5PC4XJ6AUJCIQQBAAoVCCQwjCAA/JCgglHA4IpJBYwTHA4RMJCY5oDJo4THKIQKET5IMGCaY7TMaKLTWajbTFJIlICgoVBFYXJYQYSGCggAGCRAVIBgw"));
    return img;
  }

  function iconDecrement() {
    const img = require("heatshrink").decompress(atob("ikUxH+AA3XAAgNHCJIVMBYXQ5PC4XJ6AUJCIQQBAAoVCCQwjCAA/JCgglKFJADBCRYABCYQmOFAhNMKIw6FTw4LHCaY7TMaKLTWajbTFJglFCgoVBFYXJYQYSGCggAGCRAVIBgw="));
    return img;
  }

  function iconOk() {
    const img = require("heatshrink").decompress(atob("ikUxH+AA3XAAgNHCJIVMBYXQ5PC4XJ6AUJCIQQBAAoVCCQwjCAA/JCgglKFJADBCJQxCCYQmMIwZoDJpQMCKIg6KBYwTGFQgeHHYouCCRI7EMYTXFRhILEK5SfFRgYSIborbSbpglFCgoVBFYXJYQYSGCggAGCRAVIBgwA=="));
    return img;
  }

  function drawMenu(params) {
    const DEFAULT_PARAMS = {
      showBTN1: false,
      showBTN2: false,
      showBTN3: false,
    };
    const p = Object.assign({}, DEFAULT_PARAMS, params);
    if (p.showBTN1) g.drawImage(iconIncrement(), W - 30, 10);
    if (p.showBTN2) g.drawImage(iconOk(), W - 30, 110);
    if (p.showBTN3) g.drawImage(iconDecrement(), W - 30, 210);
  }

  function clearScreen() {
    g.setColor(RED);
    g.fillRect(0,0,W,H);
  }

  function drawTitle(exercise) {
    const title = exercise.humanTitle;

    g.setFont("Vector",20);
    g.setColor(WHITE);
    g.drawString(title, centerStringX(title), 5);
  }

  function drawReps(exercise) {
    const set = exercise.currentSet;
    if (set.isCompleted()) return;

    g.setColor(PINK);
    g.fillCircle(W / 2, H / 2, 50);
    g.setColor(WHITE);
    g.setFont("Vector", 40);
    g.drawString(set.reps, centerStringX(set.reps), (H - 45) / 2);
    g.setFont("Vector", 15);
    const note = `of ${set.maxReps}`;
    g.drawString(note, centerStringX(note), (H / 2) + 25);
  }

  function drawSets(exercise) {
    const sets = exercise.subTitle;

    g.setColor(WHITE);
    g.setFont("Vector", 15);
    g.drawString(sets, centerStringX(sets), H - 25);
  }

  function drawSetProgress(exercise) {
    drawTitle(exercise);
    drawReps(exercise);
    drawSets(exercise);
    drawMenu({showBTN1: true, showBTN2: true, showBTN3: true});
  }

  function drawStartNextExercise() {
    const title = "Good work";
    const msg = "No need to rest\nmove straight on\nto the next exercise";

    g.setColor(WHITE);
    g.setFont("Vector", 35);
    g.drawString(title, centerStringX(title), 10);
    g.setFont("Vector", 15);
    g.drawString(msg, 30, 150);
    drawMenu({showBTN1: false, showBTN2: true, showBTN3: false});
  }

  function drawProgramCompleted() {
    const title1 = "You did";
    const title2 = "GREAT!";
    const msg = "That's the program\ncompleted. Now eat\nsome food and\nget plenty of rest.";

    clearWatch();
    setWatch(reset, BTN2, {repeat: false});

    g.setColor(WHITE);
    g.setFont("Vector", 35);
    g.drawString(title1, centerStringX(title1), 10);
    g.setFont("Vector", 40);
    g.drawString(title2, centerStringX(title2), 50);
    g.setFont("Vector", 15);
    g.drawString(msg, 30, 150);
    drawMenu({showBTN1: false, showBTN2: true, showBTN3: false});
  }

  /*
  function drawExerciseCompleted(program) {
    const exercise = program.currentExercise();
    const title = exercise.canProgress?
          "WELL DONE!" :
          "NOT BAD!";
    const msg = exercise.canProgress? 
          `You weight is automatically increased\nfor ${exercise.title} to ${exercise.weight}${exercise.unit}` :
          "It looks like you struggled\non a few sets, your weight will\nstay the same";
    const action = "Move straight on to the next exercise";

    clearScreen();
    g.setColor(WHITE);
    g.setFont("Vector", 20);
    g.drawString(title, centerStringX(title), 10);
    g.setFont("Vector", 10);
    g.drawString(msg, centerStringX(msg), 180);
    g.drawString(action, centerStringX(action), 210);
    drawMenu({showBTN2: true});

    clearWatch();
    setWatch(() => {
      init(program);
    }, BTN2, {repeat: false});
  }
  */

  function drawRestTimer(program) {
    const exercise = program.currentExercise();
    const motivation = "Take a breather..";
    clearScreen();
    drawMenu({showBTN2: true});

    g.setColor(PINK);
    g.fillCircle(W / 2, H / 2, 50);
    g.setColor(WHITE);
    g.setFont("Vector", 15);
    g.drawString(motivation, centerStringX(motivation), 25);
    g.setFont("Vector", 40);
    g.drawString(exercise.restPeriod, centerStringX(exercise.restPeriod), (H - 45) / 2);
    exercise.decRestPeriod();

    if (exercise.restPeriod <= 0) {
      exercise.resetRestTimer();
      redraw(program);
    }
  }

  function redraw(program) {
    const exercise = program.currentExercise();

    clearScreen();

    if (program.isCompleted()) {
      drawProgramCompleted(program);
      return;
    }

    if (exercise.isRestTimerRunning()) {
      if (exercise.isLastSet()) {
        drawStartNextExercise(program);
      } else {
        drawRestTimer(program);
      }

      return;
    }

    drawSetProgress(exercise);
  }

  function init(program) {
    clearWatch();
    program.next();
  }

  // Setup training program. This should come from file

  // Squats
  function buildPrograms() {
    const squats = new Exercise({
      title: "Squats",
      weight: 40,
      unit: "Kg",
    });
    squats.addSets([
      new Set(5),
      new Set(5),
      new Set(5),
      new Set(5),
      new Set(5),
    ]);

    const bench = new Exercise({
      title: "Bench press",
      weight: 20,
      unit: "Kg",
    });
    bench.addSets([
      new Set(5),
      new Set(5),
      new Set(5),
      new Set(5),
      new Set(5),
    ]);

    const row = new Exercise({
      title: "Row",
      weight: 20,
      unit: "Kg",
    });
    row.addSets([
      new Set(5),
      new Set(5),
      new Set(5),
      new Set(5),
      new Set(5),
    ]);

    const ohPress = new Exercise({
      title: "Overhead press",
      weight: 20,
      unit: "Kg",
    });
    ohPress.addSets([
      new Set(5),
      new Set(5),
      new Set(5),
      new Set(5),
      new Set(5),
    ]);

    const deadlift = new Exercise({
      title: "Deadlift",
      weight: 20,
      unit: "Kg",
    });
    deadlift.addSets([
      new Set(5),
    ]);

    const pullups = new Exercise({
      title: "Pullups",
      weight: 0,
      unit: "Kg",
    });
    pullups.addSets([
      new Set(10),
      new Set(10),
      new Set(10),
    ]);

    const triceps = new Exercise({
      title: "Tricep extension",
      weight: 20,
      unit: "Kg",
    });
    triceps.addSets([
      new Set(10),
      new Set(10),
      new Set(10),
    ]);

    const programA = new Program({
      title: "Program A",
    });
    programA.addExercises([
      squats,
      ohPress,
      deadlift,
      pullups,
    ]);

    const programB = new Program({
      title: "Program B",
    });
    programB.addExercises([
      squats,
      bench,
      row,
      triceps,
    ]);

    const programs = [
      programA,
      programB,
    ];
    return programs;
  }

  // For this spike, just run the first program, what will
  // really happen is the user picks a program to do from
  // some menu on a start page.
  init(buildPrograms()[0]);
})();