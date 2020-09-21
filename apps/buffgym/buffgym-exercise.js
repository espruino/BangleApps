exports = class Exercise {
  constructor(params) {
    this.completed = false;
    this.sets = [];
    this.title = params.title;
    this.weight = params.weight;
    this.weightIncrement = params.weightIncrement;
    this.unit = params.unit;
    this.restPeriod = params.restPeriod;
    this._originalRestPeriod = params.restPeriod;
    this._restTimeout = null;
    this._restInterval = null;
    this._state = null;
  }

  get humanTitle() {
    return `${this.title} ${this.weight}${this.unit}`;
  }

  get subTitle() {
    const totalSets = this.sets.length;
    const uncompletedSets = this.sets.filter((set) => !set.isCompleted()).length;
    const currentSet = (totalSets - uncompletedSets) + 1;
    return `Set ${currentSet} of ${totalSets}`;
  }

  decRestPeriod() {
    this.restPeriod--;
  }

  addSet(set) {
    this.sets.push(set);
  }

  currentSet() {
    return this.sets.filter(set => !set.isCompleted())[0];
  }

  isLastSet() {
    return this.sets.filter(set => !set.isCompleted()).length === 1;
  }

  isCompleted() {
    return !!this.completed;
  }

  canSetCompleted() {
    return this.sets.filter(set => set.isCompleted()).length === this.sets.length;
  }

  setCompleted() {
    if (!this.canSetCompleted()) throw "All sets must be completed";
    if (this.canProgress()) this.weight += this.weightIncrement;
    this.completed = true;
  }

  canProgress() {
    let completedRepsTotalSum = 0;
    let targetRepsTotalSum = 0;
    this.sets.forEach(set => completedRepsTotalSum += set.reps);
    this.sets.forEach(set => targetRepsTotalSum += set.maxReps);

    return (targetRepsTotalSum - completedRepsTotalSum) === 0;
  }

  startRestTimer(workout) {
    this._restTimeout = setTimeout(() => {
      this.next(workout);
    }, 1000 * this.restPeriod);

    this._restInterval = setInterval(() => {
      this.decRestPeriod();

      if (this.restPeriod < 0) {
        this.resetRestTimer();
        this.next();

        return;
      }

      workout.emit("redraw");
    }, 1000 );
  }

  resetRestTimer() {
    clearTimeout(this._restTimeout);
    clearInterval(this._restInterval);
    this._restTimeout = null;
    this._restInterval = null;
    this.restPeriod = this._originalRestPeriod;
  }

  isRestTimerRunning() {
    return this._restTimeout != null;
  }

  setupStartedButtons(workout) {
    clearWatch();

    setWatch(() => {
      this.currentSet().incReps();
      workout.emit("redraw");
    }, BTN1, {repeat: true});

    setWatch(workout.next.bind(workout), BTN2, {repeat: false});

    setWatch(() => {
      this.currentSet().decReps();
      workout.emit("redraw");
    }, BTN3, {repeat: true});
  }

  setupRestingButtons(workout) {
    clearWatch();
    setWatch(workout.next.bind(workout), BTN2, {repeat: false});
  }

  next(workout) {
    const STARTED = 1;
    const RESTING = 2;
    const COMPLETED = 3;

    switch(this._state) {
      case null:
        this._state = STARTED;
        this.setupStartedButtons(workout);
        break;
      case STARTED:
        this._state = RESTING;
        this.startRestTimer(workout);
        this.setupRestingButtons(workout);
        break;
      case RESTING:
        this.resetRestTimer();
        this.currentSet().setCompleted();

        if (this.canSetCompleted()) {
          this._state = COMPLETED;
          this.setCompleted();
        } else {
          this._state = null;
        }
        // As we are changing state and require it to be reprocessed
        // invoke the next step of workout
        workout.next();
        break;
      default:
        throw "Exercise: Attempting to move to an unknown state";
    }

    workout.emit("redraw");
  }
};