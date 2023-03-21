(function() {
  const TIMER_IDX = "smpltmr";

  function isAlarmEnabled(){
    try{
      var alarm = require('sched');
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

    var alarm = require('sched');
    var alarmObj =  alarm.getAlarm(TIMER_IDX);
    return Math.round(alarm.getTimeToAlarm(alarmObj)/(60*1000));
  }

  function getAlarmMinutesText(){
    var min = getAlarmMinutes();
    if(min < 0){
      return "OFF";
    }

    return "T-" + String(min);
  }

  function increaseAlarm(t){
    try{
        var minutes = isAlarmEnabled() ? getAlarmMinutes() : 0;
        var alarm = require('sched')
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

        var alarm = require('sched')
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
        get: () => ({ text: getAlarmMinutesText() + (isAlarmEnabled() ? " min" : ""), img: smpltmrItems.img }),
        show: function() {},
        hide: function () {},
        run: function() { }
      },
    ]
  };

  var offsets = [+5,-5];
  offsets.forEach((o, i) => {
    smpltmrItems.items = smpltmrItems.items.concat({
      name: null,
      get: () => ({ text: (o > 0 ? "+" : "") + o + " min.", img: smpltmrItems.img }),
      show: function() {},
      hide: function () {},
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
