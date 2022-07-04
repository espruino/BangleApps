WIDGETS.bluetooth_notify = {
    area: "tr",
    width: 15,
    warningEnabled: 1,

     // ------------ Settings -------- very lame - need to improve
     readshowWidget: function() {
        var showWidget;
        const SETTINGSFILE = "widbt_notify.json";
        function def (value, def) {return value !== undefined ? value : def;}
        var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
        showWidget = def(settings.showWidget, true);
        return showWidget;
    },        
    
     readBuzzOnConnect: function() {
        var buzzOnConnect;
        const SETTINGSFILE = "widbt_notify.json";
        function def (value, def) {return value !== undefined ? value : def;}
        var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
        buzzOnConnect = def(settings.buzzOnConnect, true);
        return buzzOnConnect;
    },        

     readBuzzOnLoss: function() {
        var buzzOnLoss;
        const SETTINGSFILE = "widbt_notify.json";
        function def (value, def) {return value !== undefined ? value : def;}
        var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
        buzzOnLoss = def(settings.buzzOnLoss, true);
        return buzzOnLoss;
    },            
	
     readHideConnected: function() {
        var hideConnected;
        const SETTINGSFILE = "widbt_notify.json";
        function def (value, def) {return value !== undefined ? value : def;}
        var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
        hideConnected = def(settings.hideConnected, true);
        return hideConnected;
    },  	
	
	
     // ------------ Settings --------

    draw: function() {
        if (WIDGETS.bluetooth_notify.readshowWidget()){
            g.reset();
            if (NRF.getSecurityStatus().connected) {
				if (!WIDGETS.bluetooth_notify.readHideConnected()) {
                   g.setColor((g.getBPP() > 8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
                   g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 2 + this.x, 2 + this.y);
                }
            } else {
                // g.setColor(g.theme.dark ? "#666" : "#999"); 
                g.setColor("#f00"); // red is easier to distinguish from blue
                g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 2 + this.x, 2 + this.y);
            }
        }
    },
    
    redrawCurrentApp: function(){
        if(typeof(draw)=='function'){
            g.clear();
            draw();
            Bangle.loadWidgets();
            Bangle.drawWidgets();
        }else{
            load(); // fallback. This might reset some variables
        }
    },
    
    connect: function() {

            if(WIDGETS.bluetooth_notify.warningEnabled == 1){
                E.showMessage(/*LANG*/'Connection\nrestored.', 'Bluetooth');
                setTimeout(()=>{WIDGETS.bluetooth_notify.redrawCurrentApp();}, 3000); // clear message - this will reload the widget, resetting 'warningEnabled'.
                
                WIDGETS.bluetooth_notify.warningEnabled = 0;
                setTimeout('WIDGETS.bluetooth_notify.warningEnabled = 1;', 30000); // don't buzz for the next 30 seconds.
                
                var quiet       = (require('Storage').readJSON('setting.json',1)||{}).quiet;
                if(!quiet && WIDGETS.bluetooth_notify.readBuzzOnConnect()){
                    Bangle.buzz(700, 1); // buzz on connection resume
                }
            }        
            WIDGETS.bluetooth_notify.draw();

    },
    
    disconnect: function() {
            if(WIDGETS.bluetooth_notify.warningEnabled == 1){
                E.showMessage(/*LANG*/ 'Connection\nlost.', 'Bluetooth');
                setTimeout(()=>{WIDGETS.bluetooth_notify.redrawCurrentApp();}, 3000); // clear message - this will reload the widget, resetting 'warningEnabled'.
                
                WIDGETS.bluetooth_notify.warningEnabled = 0;
                setTimeout('WIDGETS.bluetooth_notify.warningEnabled = 1;', 30000); // don't buzz for the next 30 seconds.
                
                var quiet       = (require('Storage').readJSON('setting.json',1)||{}).quiet;
                if(!quiet && WIDGETS.bluetooth_notify.readBuzzOnLoss()){
                    Bangle.buzz(700, 1); // buzz on connection loss
                }
            }
        
        WIDGETS.bluetooth_notify.draw();
    }
};

NRF.on('connect', WIDGETS.bluetooth_notify.connect);
NRF.on('disconnect', WIDGETS.bluetooth_notify.disconnect);
