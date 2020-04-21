exports = class Set {
  constructor(maxReps) {
    this.minReps = 0;
    this.maxReps = maxReps;
    this.reps = 0;
    this.completed = false;
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
}