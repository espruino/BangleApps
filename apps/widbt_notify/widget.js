WIDGETS.bluetooth_notify = {
    area: "tr",
    width: 15,
    warningEnabled: 1,
    draw: function() {
        g.reset();
        if (NRF.getSecurityStatus().connected) {
            g.setColor((g.getBPP() > 8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
        } else {
            // g.setColor(g.theme.dark ? "#666" : "#999");
            g.setColor("#f00"); // red is easier to distinguish from blue
        }
        g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 2 + this.x, 2 + this.y);
    },
    
    redrawCurrentApp: function(){
            load(); // there should be a better way to dismiss a message box IMO.
    },
    
    connect: function() {
        WIDGETS.bluetooth_notify.draw();
    },
    
    disconnect: function() {
        if(WIDGETS.bluetooth_notify.warningEnabled == 1){
            E.showAlert(/*LANG*/'BLUETOOTH\nConnection\nlost.', 'BLUETOOH');
            setTimeout(()=>{
                E.showAlert();
                WIDGETS.bluetooth_notify.redrawCurrentApp();
            }, 3000); // clear message
            
            WIDGETS.bluetooth_notify.warningEnabled = 0;
            setTimeout('WIDGETS.bluetooth_notify.warningEnabled = 1;', 30000); // don't buzz for the next 30 seconds.
            
            var quiet       = (require('Storage').readJSON('setting.json',1)||{}).quiet;
            if(!quiet){
                Bangle.buzz(700, 1); // buzz on connection loss
            }
        }
        WIDGETS.bluetooth_notify.draw();
    }
};

NRF.on('connect', WIDGETS.bluetooth_notify.connect);
NRF.on('disconnect', WIDGETS.bluetooth_notify.disconnect);
