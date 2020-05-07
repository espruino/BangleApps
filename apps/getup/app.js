function remind() {
    Bangle.buzz(1000,1);
    g.clear();
    g.setColor(0xF800);
    g.drawString("MOVE!", g.getWidth()/2, g.getHeight()/2);
    setTimeout(print_message,60000);
}

function print_message(){
	g.clear();
	g.setColor(0x03E0);
	g.drawString("sitting is dangerous!", g.getWidth()/2, g.getHeight()/2);
}
//init graphics
require("Font8x12").add(Graphics);
g.setFont("8x12",2);
g.setFontAlign(0,0);
g.flip();

print_message();
setInterval(remind,1200000);

