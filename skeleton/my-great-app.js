/* jshint esversion: 6 */

/*

	the screen area(0,0,239,23) is reserved for wigdets

*/

(() => {

        // section  for const and vars if needed

        ...

        // section for functions, classes

        ...

        function < your main function > ()

    }

    // special function to handle display switch on
    Bangle.on('lcdPower', (on) => {
            if (on) {
                drawWidgets();
                <your main function>();;
        }
    });

	// clear screen and launch
	g.clear();
	<your main funtion>();

})();
