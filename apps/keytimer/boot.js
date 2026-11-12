Bangle.on('alarmDismiss', alarm => {
  if (alarm.appid === 'keytimer') {
    console.debug('keytimer: alarmDismiss for keytimer alarm');
    let state = require('Storage').readJSON('keytimer.json');
    state.timeLeft = 0;
    state.inputString = '0';
    require('Storage').writeJSON('keytimer.json', state);
  }
});
