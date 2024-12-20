(function () {
    const su = () => require("hasensors").sendUpdate();
    Bangle.on("charging", su);
    NRF.on("connect", () => setTimeout(su, 2000));
    su();
    setInterval(su, 10 * 60 * 1000);
    Bangle.on('HRM', h=>require("hasensors").sendHRM(h));
})();
