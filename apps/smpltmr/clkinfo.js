(function() {
  const TIMER_IDX = "smpltmr";
  var alarm = require('sched');

  function isAlarmEnabled(){
    try{

      var alarmObj = alarm.getAlarm(TIMER_IDX);
      if(alarmObj===undefined || !alarmObj.on){
        return false;
      }

      return true;

    } catch(ex){ }
    return false;
  }

  function getAlarmMinutes(){
    if(!isAlarmEnabled()){
        return -1;
    }
    var alarmObj =  alarm.getAlarm(TIMER_IDX);
    return Math.round(alarm.getTimeToAlarm(alarmObj)/(60*1000));
  }

  function getAlarmMinutesText(){
    var min = getAlarmMinutes();
    if(min < 0)
      return "OFF";
    return min + " min";
  }

  function increaseAlarm(t){
    try{
        var minutes = isAlarmEnabled() ? getAlarmMinutes() : 0;
        alarm.setAlarm(TIMER_IDX, {
          timer : (minutes+t)*60*1000,
        });
        alarm.reload();
    } catch(ex){ }
  }

  function decreaseAlarm(t){
    try{
        var minutes = getAlarmMinutes();
        minutes -= t;

        alarm.setAlarm(TIMER_IDX, undefined);
        if(minutes > 0){
          alarm.setAlarm(TIMER_IDX, {
              timer : minutes*60*1000,
          });
        }

        alarm.reload();
    } catch(ex){ }
  }

  var smpltmrItems = {
    name: "Timer",
    img: atob("GBiBAAB+AAB+AAAYAAAYAAB+AA3/sA+B8A4AcAwMMBgPGBgPmDAPjDAPzDAPzDP/zDP/zDH/jBn/mBj/GAw8MA4AcAeB4AH/gAB+AA=="),
    items: [
      {
        name: null,
        get: () => ({ text: getAlarmMinutesText(), img: smpltmrItems.img } ),
        show: function() { this.interval = setInterval(()=>this.emit('redraw'), 60000); },
        hide: function () { clearInterval(this.interval); delete this.interval; },
        //run: function() { } // should tapping do something?
      },
    ]
  };

  const restoreMainItem = function(clkinfo) {
    clkinfo.menuB = 0;
    // clock info redraws after this
  };

  var offsets = [+5,-5];
  offsets.forEach((o, i) => {
    smpltmrItems.items = smpltmrItems.items.concat({
      name: null,
      get: () => ({ text: (o > 0 ? "+" : "") + o + " min", img: (o>0)?atob("GBiBAAB+AAB+AAAYAAAYAAB+AA3/sA+B8A4AcAwAMBgYGBgYGDAYDDAYDDH/jDH/jDAYDDAYDBgYGBgYGAwAMA4AcAeB4AH/gAB+AA=="):atob("GBiBAAB+AAB+AAAYAAAYAAB+AA3/sA+B8A4AcAwAMBgAGBgAGDAADDAADDH/jDH/jDAADDAADBgAGBgAGAwAMA4AcAeB4AH/gAB+AA==") }),
      show: function() { },
      hide: function() { },
      blur: restoreMainItem,
      run: function() {
        if(o > 0) increaseAlarm(o);
        else decreaseAlarm(Math.abs(o));
        this.show();
        return true;
      }
    });
  });

  return smpltmrItems;
})
