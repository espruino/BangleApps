(() => {
  const move = 20 * 60 * 1000; // 20 minutes
  const look = 20 * 1000;      // 20 seconds

  const buzz = _ => {
    const date = new Date();
    const day = date.getDay();
    const hour = date.getHours();
    // buzz at work
    if (day >= 1 && day <= 5 &&
      hour >= 8 && hour <= 17) {
      Bangle.buzz().then(_ => {
        setTimeout(Bangle.buzz, look);
      });
    }
  };

  setInterval(buzz, move); // buzz to stand / sit
})();
