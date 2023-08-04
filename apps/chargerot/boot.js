(() => {
    const chargingRotation = 0 | (require('Storage').readJSON("chargerot.settings.json",1)||{}).rotate;
    const defaultRotation = 0 | require('Storage').readJSON("setting.json").rotate;
    if (Bangle.isCharging()) g.setRotation(chargingRotation&3,chargingRotation>>2).clear();
    Bangle.on('charging', (charging) => {
        if (charging) {
            g.setRotation(chargingRotation&3,chargingRotation>>2).clear();
            Bangle.showClock();
        } else {
            g.setRotation(defaultRotation&3,defaultRotation>>2).clear();
            Bangle.showClock();
        }
    });
})();
