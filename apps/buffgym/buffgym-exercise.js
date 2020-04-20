const STARTED = 1;
const RESTING = 2;
const COMPLETED = 3;
const ONE_SECOND = 1000;
const INCREMENT = "increment";
const DECREMENT = "decrement";

class Exercise {
  constructor(params /*{title, weight, unit, restPeriod}*/) {
    const DEFAULTS = {
      title: "Unknown",
      weight: 0,
      unit: "Kg",
      restPeriod: 90,
      weightIncrement: 2.5,
    };
    const p = Object.assign({}, DEFAULTS, params);

    this._title = p.title;
    this._weight = p.weight;
    this._unit = p.unit;
    this._originalRestPeriod = p.restPeriod; // Used when reseting _restPeriod
    this._restPeriod = p.restPeriod;
    this._weightIncrement = p.weightIncrement;
    this._started = new Date();
    this._completed = false;
    this._sets = [];
    this._restTimeout = null;
    this._restInterval = null;
    this._state = null;
  }

  get title() {
    return this._title;
  }

  get humanTitle() {
    return `${this._title} ${this._weight}${this._unit}`;
  }

  get subTitle() {
    const totalSets = this._sets.length;
    const uncompletedSets = this._sets.filter((set) => !set.isCompleted()).length;
    const currentSet = (totalSets - uncompletedSets) + 1;
    return `Set ${currentSet} of ${totalSets}`;
  }

  get restPeriod() {
    return this._restPeriod;
  }

  decRestPeriod() {
    this._restPeriod--;
  }

  get weight() {
    return this._weight;
  }

  get unit() {
    return this._unit;
  }

  get started() {
    return this._started;
  }

  addSet(set) {
    this._sets.push(set);
  }

  addSets(sets) {
    sets.forEach(set => this.addSet(set));
  }

  get currentSet() {
    return this._sets.filter(set => !set.isCompleted())[0];
  }

  isLastSet() {
    return this._sets.filter(set => !set.isCompleted()).length === 1;
  }

  isCompleted() {
    return !!this._completed;
  }

  canSetCompleted() {
    return this._sets.filter(set => set.isCompleted()).length === this._sets.length;
  }

  setCompleted() {
    if (!this.canSetCompleted()) throw "All sets must be completed";
    if (this.canProgress) this._weight += this._weightIncrement;
    this._completed = true;
  }

  get canProgress() {
    let completedRepsTotalSum = 0;
    let targetRepsTotalSum = 0;

    const completedRepsTotal = this._sets.forEach(set => completedRepsTotalSum += set.reps);
    const targetRepsTotal = this._sets.forEach(set => targetRepsTotalSum += set.maxReps);

    return (targetRepsTotalSum - completedRepsTotalSum) === 0;
  }

  startRestTimer(program) {
    this._restTimeout = setTimeout(() => {
      this.next();
    }, ONE_SECOND * this._restPeriod);

    this._restInterval = setInterval(() => {
      program.emit("redraw");
    }, ONE_SECOND);
  }

  resetRestTimer() {
    clearTimeout(this._restTimeout);
    clearInterval(this._restInterval);
    this._restTimeout = null;
    this._restInterval = null;
    this._restPeriod = this._originalRestPeriod;
  }

  isRestTimerRunning() {
    return this._restTimeout != null;
  }

  setupStartedButtons(program) {
    clearWatch();

    setWatch(() => {
      this.currentSet.incReps();
      program.emit("redraw");
    }, BTN1, {repeat: true});

    setWatch(program.next.bind(program), BTN2, {repeat: false});

    setWatch(() => {
      this.currentSet.decReps();
      program.emit("redraw");
    }, BTN3, {repeat: true});
  }

  setupRestingButtons(program) {
    clearWatch();
    setWatch(program.next.bind(program), BTN2, {repeat: true});
  }

  next(program) {
    global.poo = this;
    switch(this._state) {
      case null:
        console.log("XXX 1 moving null -> STARTED");
        this._state = STARTED;
        this.setupStartedButtons(program);
        break;
      case STARTED:
        console.log("XXX 2 moving STARTED -> RESTING");
        this._state = RESTING;
        this.startRestTimer(program);
        this.setupRestingButtons(program);
        break;
      case RESTING:
        this.resetRestTimer();
        this.currentSet.setCompleted();

        if (this.canSetCompleted()) {
          console.log("XXX 3b moving RESTING -> COMPLETED");
          this._state = COMPLETED;
          this.setCompleted();
        } else {
          console.log("XXX 3a moving RESTING -> null");
          this._state = null;
        }
        // As we are changing state and require it to be reprocessed
        // invoke the next step of program
        program.next(program);
        break;
      default:
        throw "Exercise: Attempting to move to an unknown state";
    }

    program.emit("redraw");
  }
}