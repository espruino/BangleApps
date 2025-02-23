{
    Bangle.loadWidgets();
    Bangle.drawWidgets();

    g.clear();
    // draw the current counter value
    g.drawString("TEST", g.getWidth()/2, g.getHeight()/2);


    Bangle.setUI({
        mode : 'custom',
        back : Bangle.showClock,
    });
}