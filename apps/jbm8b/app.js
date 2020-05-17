const affirmative = [
  'It is\ncertain.',
  'It is\ndicededly\nso.',
  'Without\na doubt.',
  'Yes\ndefinitely.',
  'You may\nrely\non it.',
  'As I see,\nit yes.',
  'Most\nlikely.',
  'Outlook\ngood.',
  'Yes.',
  'Signs point\nto yes.'
];
const nonCommittal = [
  'Reply hazy,\ntry again.',
  'Ask again\nlater.',
  'Better not\ntell you\nnow.',
  'Cannot\npredict\nnow.',
  'Concentrate\nand\nask again.'
];
const negative = [
  'Don\'t\ncount on it.',
  'My reply\nis no.',
  'My sources\nsay no.',
  'Outlook\nis not\nso\ngood.',
  'Very\ndoubtful.'
];

const title = 'Magic 8 Ball';

const answers = [affirmative, nonCommittal, negative];

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function predict() {
  // affirmative, negative or non-committal
  let max = answers.length;
  const a = Math.floor(getRandomArbitrary(0, max));
  // sets max compared to answer category
  max = answers[a].length;
  const b = Math.floor(getRandomArbitrary(0, max));
  // get the answer
  const response = answers[a][b];
  return response;
}

function draw(msg) {
  // console.log(msg);
  g.clear();
  E.showMessage(msg, title);
}

function reply(button) {
  const theButton = (typeof button === 'undefined' || isNaN(button)) ? 1 : button;
  const timer = Math.floor(getRandomArbitrary(0, theButton) * 1000);
  // Thinking...
  draw('...');
  setTimeout('draw(predict());', timer);
}

function ask() {
  draw('Ask me a\nYes or No\nquestion\nand\ntouch the\nscreen');
}

g.clear();

Bangle.loadWidgets();
Bangle.drawWidgets();
ask();

// Event Handlers

Bangle.on('touch', (button) => reply(button));

setWatch(ask, BTN1, { repeat: true, edge: "falling" });
setWatch(reply, BTN3, { repeat: true, edge: "falling" });

// Back to launcher
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });