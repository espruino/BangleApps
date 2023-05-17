(function () {
    const sb = () => require("hasensors").sendBattery();
    Bangle.on("charging", sb);
    NRF.on("connect", () => setTimeout(sb, 2000));
    setInterval(sb, 10 * 60 * 1000);
})();