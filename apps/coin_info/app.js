{
    Bangle.loadWidgets();
    Bangle.drawWidgets();

    function countDown() {
        counter--;

        g.clear();
        // draw the current counter value
        g.drawString(counter, g.getWidth()/2, g.getHeight()/2);
        // optional - this keeps the watch LCD lit up
        Bangle.setLCDPower(1);
    }

    // call countDown every second
    var interval = setInterval(countDown, 1000);
    //
    Bangle.setUI({
        mode : 'custom',
        back : Bangle.showClock,
    });
}