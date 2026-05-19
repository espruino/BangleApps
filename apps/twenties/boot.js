(() => {
  const LOOP_INTERVAL = 1.2e6; // 20 minutes
  const BUZZ_INTERVAL = 2e4; // 20 seconds

  const isWorkTime = (d) =>
    d.getDay() % 6 && d.getHours() >= 8 && d.getHours() < 18;

  const scheduleNext = () => {
    const now = new Date();
    if (isWorkTime(now)) {
      Bangle.buzz().then(() => setTimeout(Bangle.buzz, BUZZ_INTERVAL));
      setTimeout(scheduleNext, LOOP_INTERVAL);
    } else {
      const next = new Date(now);
      next.setHours(8, 0, 0, 0);
      while (!isWorkTime(next)) next.setDate(next.getDate() + 1);
      setTimeout(scheduleNext, next - now);
    }
  };

  // Align so we fire at whole hour, 20 min past and 40 min past - not at arbitrary times.
  const TIME_AT_BOOT = new Date();
  const TIME_SINCE_WHOLE_THIRD_OF_HOUR = (TIME_AT_BOOT.getMinutes() % 20) * 6e4 + TIME_AT_BOOT.getSeconds() * 1e3;
  setTimeout(scheduleNext,
    LOOP_INTERVAL - TIME_SINCE_WHOLE_THIRD_OF_HOUR);
  // Make sure we don't miss the 2nd buzz after 20 seconds if we rebooted during that interval.
  if (TIME_SINCE_WHOLE_THIRD_OF_HOUR <= BUZZ_INTERVAL) {
    setTimeout(Bangle.buzz, 
      BUZZ_INTERVAL - TIME_SINCE_WHOLE_THIRD_OF_HOUR);
  }
})();
