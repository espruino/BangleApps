import appConfig = require("./app-config");

setInterval(() => {
    const temp = E.getTemperature();
    console.log("Current temp:", temp);
}, appConfig.default.refreshPeriodSec * 1000);

