const BGTIMER_common = require("bgtimer-com.js");

//Only start the timeout if the timer is running
if (BGTIMER_common.state.running) {
    setTimeout(() => {
        //Check now to avoid race condition
        if (Bangle.BGTIMER_ACTIVE === undefined) {
            load('bgtimer-ring.js');
        }
    }, BGTIMER_common.getTimeLeft());
}