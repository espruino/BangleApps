/**
 * BangleJS Stronglifts 5x5 training aid
 *
 * Original Author: Paul Cockrell https://github.com/paulcockrell
 * Created: April 2020
 *
 * Inspired by:
 * - Stronglifts 5x5 training workout https://stronglifts.com/5x5/
 * - Stronglifts smart watch app
 */

Bangle.setLCDMode("120x120");

const W = g.getWidth();
const H = g.getHeight();
const RED = "#d32e29";
const PINK = "#f05a56";
const WHITE = "#ffffff";

function drawMenu(params) {
  const hs = require("heatshrink");
  const incImg = hs.decompress(atob("gsFwMAkM+oUA"));
  const decImg = hs.decompress(atob("gsFwIEBnwCBA"));
  const okImg = hs.decompress(atob("gsFwMAhGFo0A"));
  const DEFAULT_PARAMS = {
    showBTN1: false,
    showBTN2: false,
    showBTN3: false,
  };
  const p = Object.assign({}, DEFAULT_PARAMS, params);
  if (p.showBTN1) g.drawImage(incImg, W - 10, 10);
  if (p.showBTN2) g.drawImage(okImg, W - 10, 60);
  if (p.showBTN3) g.drawImage(decImg, W - 10, 110);
}

function drawSet(exercise) {
  const set = exercise.currentSet();
  if (set.isCompleted()) return;

  g.clear();

  // Draw exercise title
  g.setColor(PINK);
  g.fillRect(15, 0, W - 15, 18);
  g.setFontAlign(0, -1);
  g.setFont("6x8", 1);
  g.setColor(WHITE);
  g.drawString(exercise.title, W / 2, 5);
  g.setFont("6x8", 1);
  g.drawString(exercise.weight + " " + exercise.unit, W / 2, 27);
  // Draw completed reps counter
  g.setFontAlign(0, 0);
  g.setColor(PINK);
  g.fillRect(15, 42, W - 15, 80);
  g.setColor(WHITE);
  g.setFont("6x8", 5);
  g.drawString(set.reps, (W / 2) + 2, (H / 2) + 1);
  g.setFont("6x8", 1);
  const note = `Target reps: ${set.maxReps}`;
  g.drawString(note, W / 2, H - 24);
  // Draw sets monitor
  g.drawString(exercise.subTitle, W / 2, H - 12);

  drawMenu({showBTN1: true, showBTN2: true, showBTN3: true});

  g.flip();
}

function drawWorkoutDone() {
  const title1 = "You did";
  const title2 = "GREAT!";
  const msg = "That's the workout\ncompleted. Now eat\nsome food and\nget plenty of rest.";

  clearWatch();
  setWatch(Bangle.showLauncher, BTN2, {repeat: false});
  drawMenu({showBTN2: true});

  g.setFontAlign(0, -1);
  g.setColor(WHITE);
  g.setFont("6x8", 2);
  g.drawString(title1, W / 2, 10);
  g.drawString(title2, W / 2, 30);
  g.setFont("6x8", 1);
  g.drawString(msg, (W / 2) + 3, 70);
  g.flip();
}

function drawSetComp(exercise) {
  const title = "Good work";
  const msg1= "No need to rest\nmove straight on\nto the next\nexercise.";
  const msg2 = exercise.canProgress()?
    "Your\nweight has been\nincreased for\nnext time!":
    "You'll\nsmash it next\ntime!";

  g.clear();
  drawMenu({showBTN2: true});

  g.setFontAlign(0, -1);
  g.setColor(WHITE);
  g.setFont("6x8", 2);
  g.drawString(title, W / 2, 10);
  g.setFont("6x8", 1);
  g.drawString(msg1 + msg2, (W / 2) - 2, 45);

  g.flip();
}

function drawRestTimer(exercise) {
  g.clear();
  drawMenu({showBTN2: true});
  g.setFontAlign(0, -1);
  g.setColor(PINK);
  g.fillRect(15, 42, W - 15, 80);
  g.setColor(WHITE);
  g.setFont("6x8", 1);
  g.drawString("Have a short\nrest period.", W / 2, 10);
  g.setFont("6x8", 5);
  g.drawString(exercise.restPeriod, (W / 2) + 2, (H / 2) - 19);
  g.flip();
}

function redraw(workout) {
  const exercise = workout.currentExercise();
  g.clear();

  if (workout.isCompleted()) {
    saveWorkout(workout);
    drawWorkoutDone();
    return;
  }

  if (exercise.isRestTimerRunning()) {
    if (exercise.isLastSet()) {
      drawSetComp(exercise);
    } else {
      drawRestTimer(exercise);
    }

    return;
  }

  drawSet(exercise);
}

function drawWorkoutMenu(workouts, selWorkoutIdx) {
  g.clear();
  g.setFontAlign(0, -1);
  g.setColor(WHITE);
  g.setFont("6x8", 2);
  g.drawString("BuffGym", W / 2, 10);

  g.setFont("6x8", 1);
  g.setFontAlign(-1, -1);
  let selectedWorkout = workouts[selWorkoutIdx].title;
  let yPos = 50;
  workouts.forEach(workout => {
    g.setColor("#f05a56");
    g.fillRect(0, yPos, W, yPos + 11);
    g.setColor("#ffffff");
    if (selectedWorkout === workout.title) {
      g.drawRect(0, yPos, W - 1, yPos + 11);
    }
    g.drawString(workout.title, 10, yPos + 2);
    yPos += 15;
  });
  g.flip();
}

function setupMenu() {
  clearWatch();
  const workouts = getWorkoutIndex();
  let selWorkoutIdx = 0;
  drawWorkoutMenu(workouts, selWorkoutIdx);

  setWatch(()=>{
    selWorkoutIdx--;
    if (selWorkoutIdx< 0) selWorkoutIdx = 0;
    drawWorkoutMenu(workouts, selWorkoutIdx);
  }, BTN1, {repeat: true});

  setWatch(()=>{
    const workout = buildWorkout(workouts[selWorkoutIdx].file);
    workout.next();
  }, BTN2, {repeat: false});

  setWatch(()=>{
    selWorkoutIdx++;
    if (selWorkoutIdx > workouts.length - 1) selWorkoutIdx = workouts.length - 1;
    drawWorkoutMenu(workouts, selWorkoutIdx);
  }, BTN3, {repeat: true});
}

function drawSplash() {
  g.reset();
  g.setBgColor(RED);
  g.clear();
  g.setColor(WHITE);
  g.setFontAlign(0,-1);
  g.setFont("6x8", 2);
  g.drawString("BuffGym", W / 2, 10);
  g.setFont("6x8", 1);
  g.drawString("5x5", W / 2, 42);
  g.drawString("training app", W / 2, 55);
  g.drawRect(19, 38, 100, 99);
  const img = require("heatshrink").decompress(atob("lkdxH+AB/I5ASQACwpB5vNFkwpBAIfNFdZZkFYwskFZAsiFZBZiVYawEFf6ETFUwsIFUYmB54ADAwIskFYoRKBoIroB4grV58kkgCDFRotWFZwqHFiwYMFZIsTC5wLDFjGlCoWlkgJDRQIABCRAsLCwodCFAIABCwIOCFQYABr4RCCQIrMC4gqEAAwpFFZosFC5ArHFQ4rFNYQrGEgosMBxIrFLQwrLAB4sFSw4rFFjYrQFi4rNbASeEFjIoJFQYsGMAgAPEQgAIGwosCRoorbA="));
  g.drawImage(img, 40, 70);
  g.flip();

  let flasher = false;
  let bgCol, txtCol;
  const i = setInterval(() => {
    if (flasher) {
      bgCol = WHITE;
      txtCol = RED;
    } else {
      bgCol = RED;
      txtCol = WHITE;
    }
    flasher = !flasher;
    g.setColor(bgCol);
    g.fillRect(0, 108, W, 120);
    g.setColor(txtCol);
    g.drawString("Press btn to begin", W / 2, 110);
    g.flip();
  }, 250);

  setWatch(()=>{
    clearInterval(i);
    setupMenu();
  }, BTN1, {repeat: false});

  setWatch(()=>{
    clearInterval(i);
    setupMenu();
  }, BTN2, {repeat: false});

  setWatch(()=>{
    clearInterval(i);
    setupMenu();
  }, BTN3, {repeat: false});
}

function getWorkoutIndex() {
  const workoutIdx = require("Storage").readJSON("buffgym-workout-index.json");
  return workoutIdx;
}

function buildWorkout(fName) {
  const Workout = require("buffgym-workout.js");
  const workoutJSON = require("Storage").readJSON(fName);
  const workout = Workout.fromJSON(workoutJSON, redraw);

  return workout;
}

function saveWorkout(workout) {
  const fName = getWorkoutIndex().find(w => w.title === workout.title).file;
  require("Storage").writeJSON(fName, workout.toJSON());
}

drawSplash();