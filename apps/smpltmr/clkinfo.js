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

  var img = atob("GBiBAeAAB+AAB/v/3/v/3/v/3/v/3/v/n/n/H/z+P/48//85//+b//+b//8p//4E//yCP/kBH/oAn/oAX/oAX/oAX/oAX+AAB+AABw==")
  var smpltmrItems = {
    name: "Timer",
    img: img,
    items: [
      {
        name: "Timer",
        get: () => ({ text: getAlarmMinutesText() + (isAlarmEnabled() ? " min" : ""), img: null}),
        show: function() { smpltmrItems.items[0].emit("redraw"); },
        hide: function () {},
        run: function() { }
      },
    ]
  };

  var offsets = [+1,+5,-1,-5];
  offsets.forEach((o, i) => {
    smpltmrItems.items = smpltmrItems.items.concat({
      name: String(o),
      get: () => ({ text: getAlarmMinutesText() + " (" + (o > 0 ? "+" : "") + o + ")", img: null}),
      show: function() { smpltmrItems.items[i+1].emit("redraw"); },
      hide: function () {},
      run: function() {
        if(o > 0) increaseAlarm(o);
        else decreaseAlarm(Math.abs(o));
        this.show();
      }
    });
  });

  return smpltmrItems;
})