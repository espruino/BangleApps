// Chances are boot0.js got run already and scheduled *another*
// 'load(sched.js)' - so let's remove it first!
if (Bangle.SCHED) {
    clearInterval(Bangle.SCHED);
    delete Bangle.SCHED;
}

function showAlarm(alarm) {
    const alarmIndex = alarms.indexOf(alarm);
    const settings = require("sched").getSettings();

    let message = "";
    if (alarm.msg) {
        message += alarm.msg;
    } else {
        message = (alarm.timer
            ? atob("ACQswgD//33vRcGHIQAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAAAP/wAAAAAAAAAP/wAAAAAAAAAqqoAPAAAAAAqqqqoP8AAAAKqqqqqv/AAACqqqqqqq/wAAKqqqlWqqvwAAqqqqlVaqrAACqqqqlVVqqAAKqqqqlVVaqgAKqaqqlVVWqgAqpWqqlVVVqoAqlWqqlVVVaoCqlV6qlVVVaqCqVVfqlVVVWqCqVVf6lVVVWqKpVVX/lVVVVqqpVVV/+VVVVqqpVVV//lVVVqqpVVVfr1VVVqqpVVVfr1VVVqqpVVVb/lVVVqqpVVVW+VVVVqqpVVVVVVVVVqiqVVVVVVVVWqCqVVVVVVVVWqCqlVVVVVVVaqAqlVVVVVVVaoAqpVVVVVVVqoAKqVVVVVVWqgAKqlVVVVVaqgACqpVVVVVqqAAAqqlVVVaqoAAAKqqVVWqqgAAACqqqqqqqAAAAAKqqqqqgAAAAAAqqqqoAAAAAAAAqqoAAAAA==")
            : atob("AC0swgF97///RcEpMlVVVVVVf9VVVVVVVVX/9VVf9VVf/1VVV///1Vf9VX///VVX///VWqqlV///1Vf//9aqqqqpf//9V///2qqqqqqn///V///6qqqqqqr///X//+qqoAAKqqv//3//6qoAAAAKqr//3//qqAAAAAAqq//3/+qoAADwAAKqv/3/+qgAADwAACqv/3/aqAAADwAAAqp/19qoAAADwAAAKqfV1qgAAADwAAACqXVWqgAAADwAAACqlVWqAAAADwAAAAqlVWqAAAADwAAAAqlVWqAAAADwAAAAqlVaoAAAADwAAAAKpVaoAAAADwAAAAKpVaoAAAADwAAAAKpVaoAAAAOsAAAAKpVaoAAAAOsAAAAKpVaoAAAAL/AAAAKpVaoAAAAgPwAAAKpVaoAAACAD8AAAKpVWqAAAIAA/AAAqlVWqAAAgAAPwAAqlVWqAACAAADwAAqlVWqgAIAAAAAACqlVVqgAgAAAAAACqVVVqoAAAAAAAAKqVVVaqAAAAAAAAqpVVVWqgAAAAAACqlVVVWqoAAAAAAKqlVVVVqqAAAAAAqqVVVVVaqoAAAAKqpVVVVVeqqoAAKqqtVVVVV/6qqqqqqr/VVVVX/2qqqqqqn/1VVVf/VaqqqqpV/9VVVf9VVWqqlVVf9VVVf1VVVVVVVVX9VQ==")
        ) + /*LANG*/" TIMER"
    }

    Bangle.loadWidgets();
    Bangle.drawWidgets();

    let buzzCount = settings.buzzCount;

    E.showPrompt(message, {
        title: alarm.timer ? /*LANG*/"TIMER!" : /*LANG*/"ALARM!",
        buttons: { /*LANG*/"Snooze": true, /*LANG*/"Stop": false } // default is sleep so it'll come back in some mins
    }).then(function (sleep) {
        buzzCount = 0;

        if (sleep) {
            if (alarm.ot === undefined) {
                alarm.ot = alarm.t;
            }
            alarm.t += settings.defaultSnoozeMillis;
        } else {
            let del = alarm.del === undefined ? settings.defaultDeleteExpiredTimers : alarm.del;
            if (del) {
                alarms.splice(alarmIndex, 1);
                let state = require('Storage').readJSON('keytimer.json');
                state.timeLeft = 0;
                require('Storage').writeJSON('keytimer.json', state);
            } else {
                if (!alarm.timer) {
                    alarm.last = new Date().getDate();
                }
                if (alarm.ot !== undefined) {
                    alarm.t = alarm.ot;
                    delete alarm.ot;
                }
                if (!alarm.rp) {
                    alarm.on = false;
                }
            }
        }

        // The updated alarm is still a member of 'alarms'
        // so writing to array writes changes back directly
        require("sched").setAlarms(alarms);
        load();
    });

    function buzz() {
        if (settings.unlockAtBuzz) {
            Bangle.setLocked(false);
        }

        const pattern = alarm.vibrate || (alarm.timer ? settings.defaultTimerPattern : settings.defaultAlarmPattern);
        require("buzz").pattern(pattern).then(() => {
            if (buzzCount--) {
                setTimeout(buzz, settings.buzzIntervalMillis);
            } else if (alarm.as) { // auto-snooze
                buzzCount = settings.buzzCount;
                setTimeout(buzz, settings.defaultSnoozeMillis);
            }
        });
    }

    if ((require("Storage").readJSON("setting.json", 1) || {}).quiet > 1)
        return;

    buzz();
}

let alarms = require("sched").getAlarms();
let active = require("sched").getActiveAlarms(alarms);
if (active.length) {
    // if there's an alarm, show it
    showAlarm(active[0]);
} else {
    // otherwise just go back to default app
    setTimeout(load, 100);
}