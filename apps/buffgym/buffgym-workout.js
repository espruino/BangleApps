exports = class Workout {
  constructor(params) {
    this.title = params.title;
    this.exercises = [];
    this.completed = false;
    this.on("redraw", params.redraw.bind(null, this));
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

  static fromJSON(workoutJSON, redraw) {
    const Set = require("buffgym-set.js");
    const Exercise = require("buffgym-exercise.js");
    const workout = new this({
      title: workoutJSON.title,
      redraw: redraw,
    });
    const exercises = workoutJSON.exercises.map(exerciseJSON => {
      const exercise = new Exercise({
        title: exerciseJSON.title,
        weight: exerciseJSON.weight,
        weightIncrement: exerciseJSON.weightIncrement,
        unit: exerciseJSON.unit,
        restPeriod: exerciseJSON.restPeriod,
      });
      exerciseJSON.sets.forEach(setJSON => {
        exercise.addSet(new Set(setJSON));
      });

      return exercise;
    });

    workout.addExercises(exercises);

    return workout;
  }

  toJSON() {
    return {
      title: this.title,
      exercises: this.exercises.map(exercise => {
        return {
          title: exercise.title,
          weight: exercise.weight,
          weightIncrement: exercise.weightIncrement,
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
};