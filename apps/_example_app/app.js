(() => {

    // place your const, vars, functions or classes here


    // special function to handle display switch on
    Bangle.on('lcdPower', (on) => {
        if (on) {
        	drawWidgets();
            // call your app function here
    }});

    g.clear();
    // call your app function here 

})();
