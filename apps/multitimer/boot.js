{
  const resetTimer = alarm => {
    if (alarm.timer) alarm.timer = alarm.data.ot;
  };

  Bangle.on("alarmSnooze", resetTimer);
  Bangle.on("alarmDismiss", resetTimer);
}
