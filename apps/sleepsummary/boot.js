{
  let storage = require("Storage");
  let settings = require("sleepsummary").getSettings();
  function logNow(msg) {
    
    let log = storage.readJSON("sleepsummarylog.json", 1) || [];
    let d = new Date();
    log.push(
      d.getFullYear() + "-" +
      ("0"+(d.getMonth()+1)).slice(-2) + "-" +
      ("0"+d.getDate()).slice(-2) + " " +
      ("0"+d.getHours()).slice(-2) + ":" +
      ("0"+d.getMinutes()).slice(-2) + ":" +
      ("0"+d.getSeconds()).slice(-2) + " | " + msg
    );
    if (log.length > 200) log = log.slice(-200);
    storage.writeJSON("sleepsummarylog.json", log);
  }

  // Minimum consecutive sleep (minutes) before the prompt can fire.
  // Prevents naps or brief readings from triggering it.
  // After detecting a wake transition, wait this long and confirm
  // the user is *still* awake before showing the prompt.

  let wakeConfirmTimer = null;

  function showSummary() {
    logNow("prompt shown");
    Bangle.load("sleepsummarymsg.app.js");
  }

  function confirmWakeAndShow() {
    wakeConfirmTimer = null;

    // Re-check: still awake?
    let currentStatus = ((global.sleeplog || {}).info || {}).status;
    logNow("wake confirm check, status now: " + currentStatus);
    if (currentStatus !== 2) {
      logNow("went back to sleep — cancelled");
      return;
    }

    // Re-check: not already shown today?
    let today = new Date().getDate();
    if (require("sleepsummary").getSummaryData().promptLastShownDay == today) {
      logNow("already shown today — skipped");
      return;
    }

    let settings = require("sleepsummary").getSettings();
    require("sleepsummary").recordData();

    if (settings.showMessage) {
      // messageDelay is an *additional* delay on top of the confirm delay
      setTimeout(showSummary, settings.messageDelay || 0);
    }
  }

  function checkIfAwake(data) {
    logNow("trigger: status=" + data.status + " prevStatus=" + data.prevStatus);

    // Only act on transitions FROM sleep (3=light, 4=deep) TO awake (2)
    if (data.status !== 2) {
      // If they went back to sleep, cancel any pending confirm timer
      if (wakeConfirmTimer !== null) {
        clearTimeout(wakeConfirmTimer);
        wakeConfirmTimer = null;
        logNow("went back to sleep — confirm timer cleared");
      }
      return;
    }

    if (data.prevStatus !== 3 && data.prevStatus !== 4) {
      logNow("not waking from sleep (prevStatus=" + data.prevStatus + ") — ignored");
      return;
    }

    // Already shown today?
    let today = new Date().getDate();
    if (require("sleepsummary").getSummaryData().promptLastShownDay == today) {
      logNow("already shown today — skipped");
      return;
    }

    // Enough consecutive sleep to count as a real night?
    let sleepData = require("sleepsummary").getSleepData();
    logNow("consecSleep: " + sleepData.consecSleep + " mins");
    if (sleepData.consecSleep < settings.minConsecSleep) {
      logNow("not enough consecutive sleep — ignored");
      return;
    }

    // Only schedule once — ignore repeated status-change calls
    if (wakeConfirmTimer !== null) {
      logNow("confirm timer already running — ignored");
      return;
    }

    logNow("wake detected from sleep — scheduling confirm in " + (settings.messageDelay/60000) + " min");
    wakeConfirmTimer = setTimeout(confirmWakeAndShow, settings.messageDelay);
  }

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