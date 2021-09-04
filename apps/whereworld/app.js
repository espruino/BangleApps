const landColor = 0x8FAB, seaColor= 0x365D, markerColor = 0xF800;
let lastSuccess = true;

const mapImg = {
    width : 240,
    height : 240,
    palette: new Uint16Array([landColor, seaColor]),
    buffer: require("Storage").read("whereworld.worldmap")
};

function getMarkerImg(x, y) {
    const b = Graphics.createArrayBuffer(240, 240, 2, {msb:true});
    b.setColor(1);
    b.drawLine(x, 0, x, b.getHeight());
    b.drawLine(0, y, b.getWidth(), y);
    const pal = new Uint16Array([0, markerColor]);
    return {width: 240, height: 240, bpp: 2, palette: pal, buffer: b.buffer, transparent: 0};
}

function degreesToRadians(deg) {
    return (deg / 180) * Math.PI;
}

function coordsToScreenLocation(lat, lon) {
    const maxMapHeight = g.getHeight() - 1, maxMapWidth = g.getWidth() - 1;
    const maxLong = 180;
    const x = ((lon + maxLong) / (maxLong * 2)) * maxMapWidth;
    const mercN = Math.log(Math.tan((Math.PI / 4) + (degreesToRadians(lat) / 2)));
    const y = (maxMapHeight / 2) - (maxMapWidth * mercN / (2 * Math.PI));
    return {x: x, y: y};
}

function drawLocation(lat, lon) {
    const location = coordsToScreenLocation(lat, lon);
    g.drawImages([
        {image: mapImg},
        {image: getMarkerImg(location.x, location.y)}
    ]);
}

function drawNoFixMessage() {
    const b = Graphics.createArrayBuffer(240, 216, 1, {msb:true});
    const throbber = ".".repeat(new Date().getSeconds() % 4);
    b.setColor(1);
    b.setFont("6x8", 2);
    b.drawString("Finding GPS Fix" + throbber, 15, 94);
    g.drawImage({
        width: b.getWidth(),
        height: b.getHeight(),
        palette: new Uint16Array([0, 0xF800]),
        buffer: b.buffer
    }, 0, 24);
}

Bangle.setGPSPower(1);
Bangle.loadWidgets();
Bangle.on('GPS', function(gps) {
    if (gps.fix) {
        drawLocation(gps.lat, gps.lon);
        lastSuccess = true;
    }
    else {
        if (lastSuccess) {
            Bangle.drawWidgets();
            lastSuccess = false;
        }
        drawNoFixMessage();
    }
});