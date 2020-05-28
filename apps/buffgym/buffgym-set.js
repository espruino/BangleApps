exports = class Set {
  constructor(maxReps) {
    this.completed = false;
    this.minReps = 0;
    this.reps = 0;
    this.maxReps = maxReps;
  }

  isCompleted() {
    return !!this.completed;
  }

  setCompleted() {
    this.completed = true;
  }

  incReps() {
    if (this.completed) return;
    if (this.reps >= this.maxReps) return;
    this.reps++;
  }

  decReps() {
    if (this.completed) return;
    if (this.reps <= this.minReps) return;
    this.reps--;
  }
};