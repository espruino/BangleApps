E.showMessage("Jingle Bells");

var eventEmitter = new Object();

function strofa(notes, times, current, next){
  eventEmitter.on(current, () => {
    if (notes.length == 0) {
      eventEmitter.emit(next);
      return;
    }
    let note = notes.shift();
    let time = times.shift();
    Bangle.beep(time, note).then(() => {
      setTimeout(() => {
        eventEmitter.emit(current);
      }, time);
    });
  });
}

var one = [2637, 2637, 2637, 2637, 2637, 2637, 2637, 3135, 2093, 2349, 2637];
var one_t = [160, 160, 320, 160, 160, 320, 160, 160, 160, 160, 320];

var two = [2793, 2793, 2793, 2637, 2637, 2637, 2349, 2349, 2349, 2637, 2349, 3135];
var two_t = [160, 160, 320, 160, 160, 320, 160, 160, 160, 160, 320, 320];

var three = [2637, 2637, 2637, 2637, 2637, 2637, 2637, 3135, 2093, 2349, 2637];
var three_t = [160, 160, 320, 160, 160, 320, 160, 160, 160, 160, 320];

var four = [2793, 2793, 2793, 2637, 2637, 2637, 3135, 2793, 2637, 2349, 2093];
var four_t = [160, 160, 320, 160, 160, 320, 160, 160, 160, 160, 320];

strofa(one, one_t, "one", "two");
strofa(two, two_t, "two", "three");
strofa(three, three_t, "three", "four");
strofa(four, four_t, "four", "stop");

eventEmitter.emit("one");