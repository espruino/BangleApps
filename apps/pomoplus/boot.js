const POMOPLUS_storage = require("Storage");
const POMOPLUS_common = require("pomoplus-com.js");

function setNextTimeout() {
    setTimeout(() => {
        //Make sure that the pomoplus app isn't in the foreground. The pomoplus app handles the vibrations when it is in the foreground in order to avoid having to reload every time the user changes state. That means that when the app is in the foreground, we shouldn't do anything here.
        //We do this after the timer rather than before because the timer will start before the app executes.
        if (Bangle.POMOPLUS_ACTIVE === undefined) {
            POMOPLUS_common.nextPhase(true);
            setNextTimeout();
            POMOPLUS_storage.writeJSON(POMOPLUS_common.STATE_PATH, POMOPLUS_common.state)
        }
    }, POMOPLUS_common.getTimeLeft());
}

//Only start the timeout if the timer is running
if (POMOPLUS_common.state.running) {
    setNextTimeout();
}