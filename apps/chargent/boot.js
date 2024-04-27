(() => {
  const pin = process.env.HWVERSION === 2 ? D3 : D30;

  var id;
  function gent(charging) {
    if (charging) {
      if (!id) {
        var max = 0;
        var cnt = 0;
        var sum = 0;
        var lim = (require('Storage').readJSON('chargent.json', true) || {}).limit || 0;
        id = setInterval(() => {
          var val = analogRead(pin);
          if (max < val) {
            max = val;
            cnt = 1;
            sum = val;
          } else {
            cnt++;
            sum += val;
          }
          if (10 < cnt || (lim && lim <= max)) {  // 10 * 30s == 5 min  // TODO ? customizable
            if (!lim) {
              lim = sum / cnt;
              require('Storage').writeJSON('chargent.json', {limit: lim});
            }
            const onHide = () => { if(id) id = clearInterval(id) };
            require('notify').show({id: 'chargent', title: 'Charged', onHide });
            // TODO ? customizable
            Bangle.buzz(500);
            setTimeout(() => Bangle.buzz(500), 1000);
          }
        }, 3e4);
      }
    } else {
      if (id) {
        id = clearInterval(id);
        require('notify').hide({id: 'chargent'});
      }
    }
  }

  Bangle.on('charging', gent);
  if (Bangle.isCharging()) gent(true);
})();
