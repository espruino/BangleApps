const affirmative = [
  'È certo.',
  'È decisamente\ncosì.',
  'Senza alcun\ndubbio.',
  'Sì,\nsenza dubbio.',
  'Ci puoi\ncontare.',
  'Da quanto\nvedo,\nsì.',
  'Molto\nprobabilmente.',
  'Le prospettive\nsono buone.',
  'Sì.',
  'I segni\nindicano\ndi sì.'
];
const nonCommittal = [
  'È difficile\ndirlo,\nprova di nuovo.',
  'Rifai la domanda\npiù tardi.',
  'Meglio non\nrisponderti\nadesso.',
  'Non posso\npredirlo ora.',
  'Concentrati e\nrifai la\ndomanda.'
];
const negative = [
  'Non ci\ncontare.',
  'La mia\nrisposta\nè no.',
  'Le mie\nfonti dicono\ndi no.',
  'Le prospettive\nnon sono\nbuone.',
  'È molto\ndubbio.'
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
  draw('Ponimi una\ndomanda\nSì/No e\ntocca lo\nschermo');
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