
(function (back) {
  const menu = {
    '': { 'title': 'Car Crazy' },
    '< Back': back,
    'Reset Highscore': () => {
      E.showPrompt('Reset Highscore?').then((v) => {
        let delay = 50;
        if (v) {
          delay = 500;
          E.showMessage('Resetting');
          var f = require('Storage').open('CarCrazy.csv', 'w');
          f.write('0\n');
        }
        setTimeout(() => E.showMenu(menu), delay);
      });
    }
  };
  E.showMenu(menu);
})
