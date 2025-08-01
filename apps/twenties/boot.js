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

  scheduleNext();
})();
