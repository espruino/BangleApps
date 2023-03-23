function stop() {
    g.setBgColor(0, 1, 1);
    g.clear();
    g.reset();
    load();
}

g.setBgColor(1, 0, 0);
g.setColor(1, 1, 1);
g.clear();

g.setFont('6x8:5x10');
g.setFontAlign(-1, -1);
g.setColor('#ffffff');
g.drawString('DUMMY', 0, 24);


Bangle.loadWidgets();
Bangle.drawWidgets();
setTimeout(function () { stop() }, 2000);