exports = class Program {
  constructor(params) {
    const DEFAULTS = {
      title: "Unknown",
      trainDay: "", // Day of week
    };
    const p = Object.assign({}, DEFAULTS, params);

    this._title = p.title;
    this._trainDay = p.trainDay;
    this._exercises = [];

    this.on("redraw", redraw.bind(null, this));
  }

  get title() {
    return `${this._title} - ${this._trainDay}`;
  }

  addExercise(exercise) {
    this._exercises.push(exercise);
  }

  addExercises(exercises) {
    exercises.forEach(exercise => this.addExercise(exercise));
  }

  currentExercise() {
    return (
      this._exercises
      .filter(exercise => !exercise.isCompleted())[0]
    );
  }

  canComplete() {
    return (
      this._exercises
      .filter(exercise => exercise.isCompleted())
      .length === this._exercises.length
    );
  }

  setCompleted() {
    if (!this.canComplete()) throw "All exercises must be completed";
    this._completed = true;
  }

  isCompleted() {
    return !!this._completed;
  }

  // State machine
  next() {
    console.log("XXX Program.next");
    const exercise = this.currentExercise();

    // All exercises are completed so mark the
    // Program as comleted
    if (this.canComplete()) {
      this.setCompleted();
      this.emit("redraw");

      return;
    }

    exercise.next(this);
  }
}