{
  const resetTimer = alarm => {
    if (alarm.timer && "ot" in alarm.data) alarm.timer = alarm.data.ot;
  };

  Bangle.on("alarmSnooze", resetTimer);
  Bangle.on("alarmDismiss", resetTimer);
}
