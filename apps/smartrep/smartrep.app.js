const exercises = [
  "Bench Press", "Bicep Curls", "Cable Rows",
  "Lateral Raise", "Pushup", "Shoulder Press",
  "Triceps Pushdown", "Squats"
];


let selected = 0;
let scrollOffset = 0;
const visibleCount = 3;

// ==== Safe wrapped text function ====
function drawWrappedText(text, y, scale, center) {
  scale = scale !== undefined ? scale : 2;
  center = center !== undefined ? center : true;
  g.setFont("6x8", scale);
  const maxWidth = g.getWidth();
  const words = text.split(" ");
  let line = "";
  let lineY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + (line ? " " : "") + words[i];
    if (g.stringWidth(testLine) > maxWidth && line) {
      const x = center ? (maxWidth - g.stringWidth(line)) / 2 : 15;
      g.drawString(line, x, lineY);
      line = words[i];
      lineY += 20 * scale;
    } else {
      line = testLine;
    }
  }
  const x = center ? (maxWidth - g.stringWidth(line)) / 2 : 15;
  g.drawString(line, x, lineY);
}

// ==== Home Page ====
function showHomePage() {
  g.clear();
  g.setBgColor(0, 0, 0);
  g.setColor(0, 255, 0);
  drawWrappedText("SmartRep", 10, 3);

  g.setColor(0, 200, 255);
  drawWrappedText("Use BTN1&3 to move", 50, 2);
  drawWrappedText("BTN2 to select", 75, 2);

  if (selected < scrollOffset) scrollOffset = selected;
  if (selected >= scrollOffset + visibleCount)
    scrollOffset = selected - visibleCount + 1;

  let y = 115;
  for (let i = scrollOffset; i < scrollOffset + visibleCount && i < exercises.length; i++) {
    g.setFont("6x8", i === selected ? 3 : 2);
    g.setColor(i === selected ? 255 : 255, i === selected ? 255 : 255, i === selected ? 0 : 255);
    g.drawString(exercises[i], (g.getWidth() - g.stringWidth(exercises[i])) / 2, y);
    y += (i === selected) ? 38 : 30;
  }
}

// ==== Button Bindings for Home Page ====
function setupHomeButtons() {
  clearWatch();
  setWatch(() => {
    selected = (selected - 1 + exercises.length) % exercises.length;
    showHomePage();
  }, BTN1, { repeat: true, edge: "rising" });

  setWatch(() => {
    selected = (selected + 1) % exercises.length;
    showHomePage();
  }, BTN3, { repeat: true, edge: "rising" });

  setWatch(() => {
    selectTargetReps(exercises[selected]);
  }, BTN2, { repeat: false, edge: "rising" });
}

// ==== Target Repetition Selection Page ====
function selectTargetReps(exerciseName) {
  let targetReps = 5;
  function draw() {
    g.clear();
    g.setColor(0, 255, 0);
    drawWrappedText("Select Target", 20, 3);
    g.setColor(0, 200, 255);
    drawWrappedText("BTN1- / BTN3+", 60, 2);
    drawWrappedText("BTN2 to Start", 85, 2);
    g.setColor(255, 255, 255);
    g.setFont("6x8", 3);
    g.drawString(targetReps, (g.getWidth() - g.stringWidth(targetReps)) / 2, 130);
  }

  draw();
  clearWatch();
  setWatch(() => {
    if (targetReps > 1) targetReps--;
    draw();
  }, BTN1, { repeat: true, edge: "rising" });

  setWatch(() => {
    targetReps++;
    draw();
  }, BTN3, { repeat: true, edge: "rising" });

  setWatch(() => {
    showExerciseSession(exerciseName, targetReps);
  }, BTN2, { repeat: false, edge: "rising" });
}

// ==== Exercise Repetition Session Page ====
function showExerciseSession(exerciseName, targetReps) {
  let reps = 0;
  const cx = g.getWidth() / 2;
  const cy = g.getHeight() / 2;
  const r = 40;
  let completed = false;

  function drawDots() {
    for (let i = 0; i < targetReps; i++) {
      const angle = (2 * Math.PI * i) / targetReps - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i < reps) {
        g.setColor(i === reps - 1 ? 255 : 255, i === reps - 1 ? 255 : 255, i === reps - 1 ? 0 : 0);
      } else {
        g.setColor(255, 255, 255);
      }
      g.fillCircle(x, y, 2);
    }
  }

  function draw() {
    g.clear();
    g.setColor(0, 255, 0);
    drawWrappedText(exerciseName, 10, 3);

    drawDots();

    // Center rep counter
    g.setFont("6x8", 3);
    g.setColor(255, 255, 255);
    const repStr = "" + reps;
    g.drawString(repStr, (g.getWidth() - g.stringWidth(repStr)) / 2, cy - 10);

    // Instructions (stacked)
    g.setFont("6x8", 2);
    g.setColor(0, 200, 255);
    const xInstr = (g.getWidth() - g.stringWidth("BTN1: Reset")) / 2;
    g.drawString("BTN1: Reset", xInstr, 180);
    g.drawString("BTN2: Exit", xInstr, 200);
  }

  function animateDotFill() {
    draw();
    if (reps === targetReps) {
      Bangle.buzz();
      g.setColor(255, 255, 255);
      g.fillRect(0, 0, g.getWidth(), g.getHeight()); // flash
      setTimeout(() => {
        g.setColor(50, 50, 50);
        g.fillRect(0, 0, g.getWidth(), g.getHeight()); // dim screen
        draw();
      }, 200);
    }
  }

  draw();
  clearWatch();

  setWatch(() => {
    if (!completed) {
      if (reps < targetReps) {
        reps++;
        animateDotFill();
      }
      if (reps === targetReps) completed = true;
    }
  }, BTN3, { repeat: true, edge: "rising" });

  setWatch(() => {
    reps = 0;
    completed = false;
    draw();
  }, BTN1, { repeat: true, edge: "rising" });

  setWatch(() => {
    showHomePage();
    setupHomeButtons();
  }, BTN2, { repeat: false, edge: "rising" });
}

// ==== INIT ====
Bangle.setLCDTimeout(0);
Bangle.on('lcdPower', on => {
  if (on) {
    showHomePage();
    setupHomeButtons();
  }
});
showHomePage();
setupHomeButtons();
