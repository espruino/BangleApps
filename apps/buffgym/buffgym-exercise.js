exports = class Exercise {
  constructor(params) {
    this.title = params.title;
    this.weight = params.weight;
    this.unit = params.unit;
    this.restPeriod = params.restPeriod;
    this.completed = false;
    this.sets = [];
    this._restTimeout = null;
    this._restInterval = null;
    this._state = null;
    this._originalRestPeriod = params.restPeriod;
    this._weightIncrement = params.weightIncrement || 2.5;
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
    if (this.canProgress()) this.weight += this._weightIncrement;
    this.completed = true;
  }

  canProgress() {
    let completedRepsTotalSum = 0;
    let targetRepsTotalSum = 0;
    this.sets.forEach(set => completedRepsTotalSum += set.reps);
    this.sets.forEach(set => targetRepsTotalSum += set.maxReps);

    return (targetRepsTotalSum - completedRepsTotalSum) === 0;
  }

  startRestTimer(program) {
    this._restTimeout = setTimeout(() => {
      this.next(program);
    }, 1000 * this.restPeriod);

    this._restInterval = setInterval(() => {
      program.emit("redraw");
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

  setupStartedButtons(program) {
    clearWatch();

    setWatch(() => {
      this.currentSet().incReps();
      program.emit("redraw");
    }, BTN1, {repeat: true});

    setWatch(program.next.bind(program), BTN2, {repeat: false});

    setWatch(() => {
      this.currentSet().decReps();
      program.emit("redraw");
    }, BTN3, {repeat: true});
  }

  setupRestingButtons(program) {
    clearWatch();
    setWatch(program.next.bind(program), BTN2, {repeat: false});
  }

  next(program) {
    const STARTED = 1;
    const RESTING = 2;
    const COMPLETED = 3;

    switch(this._state) {
      case null:
        this._state = STARTED;
        this.setupStartedButtons(program);
        break;
      case STARTED:
        this._state = RESTING;
        this.startRestTimer(program);
        this.setupRestingButtons(program);
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
        // invoke the next step of program
        program.next();
        break;
      default:
        throw "Exercise: Attempting to move to an unknown state";
    }

    program.emit("redraw");
  }
}