(function () {
  function getDayString() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split("T")[0];
  }

  var newScoreImg = atob(
    "GBiBAAAAMAAA/AAB/gAB/gAD/2AD/+AB/u4B/u74/O74MO/8AP//AP//+P///P///P///GAAHEAACAAAAD//8D//8D//8AAAAAAAAA=="
  );
  var regImage = atob(
    "GBiBAAAAAGAAAGAAAGYAAG8gAG9//29//3///3///3///3///3///3///3AAB2AABgAAAAAAAH///n///n///gAAAAAAAA//8B//+A=="
  );

  // In-memory cache — only re-read storage when the day changes
  var cachedDay = "";
  var cachedSumData;

  function getSumData() {
    var today = getDayString();
    if (cachedDay !== today) {
      try {
        cachedSumData = require("sleepsummary").getSummaryData();
        cachedDay = today;
      } catch (e) {
        return { overallSleepScore: "--", scoreLastUpdated: "", wakeUpTime: 0 };
      }
    }
    return cachedSumData;
  }

  function get() {
    var sumData = getSumData();
    var isNewScore = false;
    var txt = sumData.overallSleepScore + "/100";
    if ((sumData.scoreLastUpdated || "") === getDayString()) {
      var now = new Date();
      var msSinceMidnight = now - new Date().setHours(0, 0, 0, 0);
      if (msSinceMidnight - sumData.wakeUpTime < 60000 * 60 * 2 /*hours*/) {
        isNewScore = true;
      }
    }
    if (!isNewScore && (sumData.scoreLastUpdated || "") !== getDayString()) {
      // new day, but no score yet
      txt = "--/100";
    }
    return {
      text: txt,
      img: isNewScore ? newScoreImg : regImage
    };
  }

  return {
    name: "Health",
    items: [
      {
        name: "Sleep Score",
        get: get,
        show: function () {
          // Invalidate memory cache on show so first render is always fresh
          cachedDay = "";
          this.interval = setInterval(() => {
            this.emit("redraw");
          }, 60000);
        },
        hide: function () {
          clearInterval(this.interval);
          this.interval = undefined;
        },
        run: function () {
          load("sleepsummary.app.js");
        }
      }
    ]
  };
});
