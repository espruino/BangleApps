/**
 * We want to be able to change the font so we set up
 * pure virtual for all fonts implementtions to use
 */
class NumeralFont {
    /**
     *  The screen dimensions of what we are going to
     * display for the given hour.
     */
    getDimensions(hour){return [0,0];}
    /**
     * The characters that are going to be returned for
     * the hour.
     */
    hour_txt(hour){ return ""; }
    /**
     * method to draw text at the required coordinates
     */
    draw(hour_txt,x,y){ return "";}
    /**
     * Called from the settings loader to identify the font
     */
    getName(){return "";}
}

module.exports = NumeralFont;