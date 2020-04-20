exports = class Set {
  constructor(maxReps) {
    this._minReps = 0;
    this._maxReps = maxReps;
    this._reps = 0;
    this._completed = false;
  }

  get title() {
    return this._title;
  }

  get weight() {
    return this._weight;
  }

  isCompleted() {
    return !!this._completed;
  }

  setCompleted() {
    this._completed = true;
  }

  get reps() {
    return this._reps;
  }

  get maxReps() {
    return this._maxReps;
  }

  incReps() {
    if (this._completed) return;
    if (this._reps >= this._maxReps) return;

    this._reps++;
  }

  decReps() {
    if (this._completed) return;
    if (this._reps <= this._minReps) return;

    this._reps--;
  }
}