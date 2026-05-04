{
  let storage = require("Storage");
  let settings = require("sleepsummary").getSettings();
  let savedData = storage.readJSON("sleepsummary.bootdata.json", 1) || {
    isCheckingForAwake: false,
    checkStartTime: 0,
    promptPending: false,
    promptDayShown: "",
    lastStatus: 0
  };

  function logNow(msg) {
    let log = storage.readJSON("sleepsummarylog.json", 1) || [];
    let d = new Date();
    log.push(
      d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
      ("0"+d.getDate()).slice(-2) + " " +
      ("0"+d.getHours()).slice(-2) + ":" + ("0"+d.getMinutes()).slice(-2) + ":" +
      ("0"+d.getSeconds()).slice(-2) + " | " + msg
    );
    if (log.length > 200) log = log.slice(-200);
    storage.writeJSON("sleepsummarylog.json", log);
  }

  function savePersistent() {
    storage.writeJSON("sleepsummary.bootdata.json", savedData);
  }

  function getDayString() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().split('T')[0];
  }

  let wakeConfirmInterval = null;

  function showSummary() {
    // Use savedData.lastStatus — global.sleeplog.info.status is unreliable outside trigger
    if (savedData.lastStatus !== 2) {
      logNow("showSummary: not awake (lastStatus=" + savedData.lastStatus + ") — resetting");
      savedData.promptPending = false;
      savedData.isCheckingForAwake = false;
      savePersistent();
      return;
    }

    logNow("prompt shown");
    savedData.promptPending = true;
    savePersistent();

    require("sleepsummary").recordData();

    let summaryData = require("sleepsummary").getSummaryData();
    let score = summaryData.overallSleepScore;
    let message = "";
    if (summaryData.avgWakeUpTime - summaryData.wakeUpTime > 20) {
      message += "You woke up earlier than usual today";
    } else if (summaryData.avgWakeUpTime - summaryData.wakeUpTime < -20) {
      message += "You woke up later than usual today";
    } else {
      message += "You woke up around the same time as usual today";
    }
    message += ", with a sleep score of " + score + ".";

    E.showPrompt(message, {
      title: "Good Morning!",
      buttons: { "Dismiss": 1, "Open App": 2 },
    }).then(function(answer) {
      savedData.promptDayShown = getDayString();
      savedData.promptPending = false;
      savePersistent();
      if (answer === 1) {
        Bangle.load();
      } else {
        Bangle.load("sleepsummary.app.js");
      }
    });
  }

  function confirmWakeAndShow() {
    if (wakeConfirmInterval !== null) {
      clearInterval(wakeConfirmInterval);
      wakeConfirmInterval = null;
    }
    savedData.isCheckingForAwake = false;
    savePersistent();

    // Use savedData.lastStatus — reliable across reloads, unlike global.sleeplog.info
    logNow("wake confirm check, lastStatus: " + savedData.lastStatus);
    if (savedData.lastStatus !== 2) {
      logNow("went back to sleep — cancelled");
      return;
    }
    if (savedData.promptDayShown == getDayString()) {
      logNow("already shown today — skipped");
      return;
    }
    if (settings.showMessage) {
      setTimeout(showSummary, 0);
    }
  }

  function checkWithSavedData() {
    if (Date.now() - savedData.checkStartTime > settings.messageDelay) {
      confirmWakeAndShow();
    }
  }

  function checkIfAwake(data) {
    // Track last known status before any returns so it's always up to date
    savedData.lastStatus = data.status;

    logNow("trigger: status=" + data.status + " prevStatus=" + data.prevStatus);

    if (data.status !== 2) {
      if (wakeConfirmInterval !== null) {
        clearInterval(wakeConfirmInterval);
        wakeConfirmInterval = null;
        logNow("went back to sleep — confirm interval cleared");
      }
      if (savedData.isCheckingForAwake) {
        savedData.isCheckingForAwake = false;
        savePersistent();
      }
      if (savedData.promptPending) {
        logNow("went back to sleep with prompt pending — resetting");
        savedData.promptPending = false;
        savePersistent();
      }
      return;
    }

    // prevStatus=undefined means sleeplog just restarted with no prior state — not a real transition
    if (data.prevStatus === undefined) {
      logNow("sleeplog init call — ignored");
      savePersistent(); // still save lastStatus=2
      return;
    }

    if (data.prevStatus !== 3 && data.prevStatus !== 4) {
      logNow("not waking from sleep (prevStatus=" + data.prevStatus + ") — ignored");
      return;
    }

    if (savedData.promptDayShown == getDayString()) {
      logNow("already shown today — skipped");
      return;
    }

    let sleepData = require("sleepsummary").getSleepData();
    logNow("consecSleep: " + sleepData.consecSleep + " mins");
    if (sleepData.consecSleep < settings.minConsecSleep) {
      logNow("not enough consecutive sleep — ignored");
      return;
    }

    if (wakeConfirmInterval !== null) {
      logNow("confirm interval already running — ignored");
      return;
    }

    logNow("wake detected — waiting " + (settings.messageDelay/60000) + " min to confirm");
    savedData.isCheckingForAwake = true;
    savedData.checkStartTime = Date.now();
    savePersistent();
    wakeConfirmInterval = setInterval(checkWithSavedData, 60000);
  }

  // On boot: re-show prompt if interrupted, or resume interval check
  if (savedData.promptPending) {
    logNow("boot: prompt was pending — re-showing");
    setTimeout(showSummary, 1000);
  } else if (savedData.isCheckingForAwake) {
    logNow("boot: resuming pending wake check");
    wakeConfirmInterval = setInterval(checkWithSavedData, 60000);
    checkWithSavedData();
  }

  E.on("kill", function() {
    storage.writeJSON("sleepsummary.bootdata.json", savedData);
  });

  require("sleeplog");
  if (typeof (global.sleeplog || {}).trigger === "object") {
    sleeplog.trigger["sleepsummary"] = {
      onChange: true,
      from: 0,
      to: 24 * 60 * 60 * 1000,
      fn: function(data) { checkIfAwake(data); }
    };
  }
}