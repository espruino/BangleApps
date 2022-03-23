WIDGETS.bluetooth = {
    area: "tr",
    width: 15,
    draw: function() {
        g.reset();
        if (NRF.getSecurityStatus().connected) {
            g.setColor((g.getBPP() > 8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
        } else {
            g.setColor(g.theme.dark ? "#666" : "#999");
        }
        g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 2 + this.x, 2 + this.y);
    },
    connect: function() {
        WIDGETS.bluetooth.draw();
    },
    diconnect: function() {
        Bangle.buzz(1000, 1); // buzz on connection loss
        WIDGETS.bluetooth.draw();
    }
};

NRF.on('connect', WIDGETS.bluetooth.connect);
NRF.on('disconnect', WIDGETS.bluetooth.diconnect);
