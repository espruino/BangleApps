const keytimer_common = require("keytimer-com.js");

//Only start the timeout if the timer is running
if (keytimer_common.state.running) {
    setTimeout(() => {
        //Check now to avoid race condition
        if (Bangle.keytimer_ACTIVE === undefined) {
            load('keytimer-ring.js');
        }
    }, keytimer_common.getTimeLeft());
}