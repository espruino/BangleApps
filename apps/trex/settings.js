(function (back) {
  const menu = {
    '': { 'title': 'T-Rex' },
    '< Back': back,
    'Reset Highscore': () => {
      E.showPrompt('Reset Highscore?').then((v) => {
        let delay = 50;
        if (v) {
          delay = 500;
          E.showMessage('Resetting');
          var f = require('Storage').open('trex.score', 'w');
          f.write('0\n');
        }
        setTimeout(() => E.showMenu(menu), delay);
      });
    }
  };
  E.showMenu(menu);
})
