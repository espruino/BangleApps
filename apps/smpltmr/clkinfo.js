(function() {
  const TIMER_IDX = "smpltmr", alarm = require('sched');

  function getAlarm() {
    var alarmObj =  alarm.getAlarm(TIMER_IDX),
        min = (alarmObj && alarmObj.on) ? alarm.getTimeToAlarm(alarmObj)/(60*1000) : 0;
    return {
      minutes : min,
      text : min ? ((min<1) ? "<1" : Math.round(min)) + /*LANG*/" min" : /*LANG*/"OFF",
      max : alarmObj?alarmObj.timer/60000:1
    };
  }

  function changeAlarm(t) {
    var minutes = Math.round(getAlarm().minutes) + t;
    alarm.setAlarm(TIMER_IDX, undefined);
    if(minutes > 0)
      alarm.setAlarm(TIMER_IDX, { timer : minutes*60000 });
    alarm.reload();
    return true;
  }

  var smpltmrItems = {
    name: "Timer",
    img: atob("GBiBAAB+AAB+AAAYAAAYAAB+AA3/sA+B8A4AcAwMMBgPGBgPmDAPjDAPzDAPzDP/zDP/zDH/jBn/mBj/GAw8MA4AcAeB4AH/gAB+AA=="),
    items: [
      {
        name: null,
        get: function() {
          var alm = getAlarm();
          if (alm.minutes > 0) { // draw an icon showing actual progress (don't ever go 100% as looks odd)
            if (this.uses) {
              if (this.timeout) clearTimeout(this.timeout);
              this.timeout = setTimeout(()=>{
                this.emit('redraw');
                delete this.timeout;
              }, alm.minutes<3 ? 2000 : (alm.minutes < 30 ? 30000 : 60000));
            }
            var gr = Graphics.createArrayBuffer(24,24,1), poly = [11.5,13.5], s=Math.sin,c=Math.cos, a = Math.min(alm.minutes * Math.PI*2 / alm.max,5.5);
            for (var i=0;i<a;i+=0.5) poly.push(11.5+6*s(i), 13.5-6*c(i));
            poly.push(11.5+6*s(a), 13.5-6*c(a));
            gr.drawImage(atob("GBgBAH4AAH4AABgAABgAAH4ADf+wD4HwDgBwDAAwGAAYGAAYMAAMMAAMMAAMMAAMMAAMMAAMGAAYGAAYDAAwDgBwB4HgAf+AAH4A")).fillPoly(poly);
            return { text: alm.text, img: gr.asImage("string") };
          } else
            return { text: alm.text, img: smpltmrItems.img };
        },
        show: function() { },
        hide: function() { if (this.timeout) clearTimeout(this.timeout); delete this.timeout; },
        run: function() { changeAlarm(1); this.emit('redraw'); return true; } // tapping adds 1 minute
      },
    ]
  };

  let onBlur = function(clkinfo) { clkinfo.setItem(clkinfo.menuA,0); }; // change back to menu
  [-5,-30].forEach(o => {
    smpltmrItems.items = smpltmrItems.items.concat({
      name: null,
      get: () => ({ text: o + /*LANG*/" min", img: atob("GBiBAAB+AAB+AAAYAAAYAAB+AA3/sA+B8A4AcAwAMBgAGBgAGDAADDAADDH/jDH/jDAADDAADBgAGBgAGAwAMA4AcAeB4AH/gAB+AA==") }),
      show: function() {},
      hide: function() {},
      blur: onBlur, run: changeAlarm.bind(null,o)
    });
  });
  [+30,+5].forEach(o => {
    smpltmrItems.items = smpltmrItems.items.concat({
      name: null,
      get: () => ({ text: "+" + o + /*LANG*/" min", img: atob("GBiBAAB+AAB+AAAYAAAYAAB+AA3/sA+B8A4AcAwAMBgYGBgYGDAYDDAYDDH/jDH/jDAYDDAYDBgYGBgYGAwAMA4AcAeB4AH/gAB+AA==") }),
      show: function() {},
      hide: function() {},
      blur: onBlur, run: changeAlarm.bind(null,o)
    });
  });

  return smpltmrItems;
})