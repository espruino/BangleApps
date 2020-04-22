exports = class Program {
  constructor(params) {
    this.title = params.title;
    this.exercises = [];
    this.completed = false;
    this.on("redraw", redraw.bind(null, this));
  }

  addExercises(exercises) {
    exercises.forEach(exercise => this.exercises.push(exercise));
  }

  currentExercise() {
    return this.exercises.filter(exercise => !exercise.isCompleted())[0];
  }

  canComplete() {
    return this.exercises.filter(exercise => exercise.isCompleted()).length === this.exercises.length;
  }

  setCompleted() {
    if (!this.canComplete()) throw "All exercises must be completed";
    this.completed = true;
  }

  isCompleted() {
    return !!this.completed;
  }

  toJSON() {
    return {
      title: this.title,
      exercises: this.exercises.map(exercise => {
        return {
          title: exercise.title,
          weight: exercise.weight,
          unit: exercise.unit,
          sets: exercise.sets.map(set => set.maxReps),
          restPeriod: exercise.restPeriod,
        };
      }),
    };
  }

  // State machine
  next() {
    if (this.canComplete()) {
      this.setCompleted();
      this.emit("redraw");
      return;
    }

    // Call current exercise state machine
    this.currentExercise().next(this);
  }
}