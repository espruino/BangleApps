var NumeralFont = require("fontclock.font.js");

const DIM_28x44 = [28,44];
const DIM_54x44 = [54,44];

class DigitNumeralFont extends NumeralFont{
    constructor(){
        super();
        // dimension map provides the dimesions of the character for
        // each number for plotting and collision detection
    }
    getDimensions(hour){
        if (hour < 10){
            return DIM_28x44;
        } else {
            return DIM_54x44;
        }
    }
    hour_txt(hour){ return hour.toString(); }
    draw(hour_txt,x,y){
        if(hour_txt == null)
            return;

        /* going to leave this in here for future testing.
         uncomment this so that it draws a box behind the string
         so we can guess the digit dimensions
        var dim = [14,22];
        g.setColor(0.5,0,0);
        g.fillPoly([x,y,
                      x+dim[0],y,
                      x+dim[0],y+dim[1],
                      x,y+dim[1]
                     ]);
        g.setColor(1.0,1.0,1.0);*/
        g.setFontAlign(-1,-1,0);
        g.setFont("Vector",50);
        g.drawString(hour_txt,x,y);
    }
    getName(){return "Digit";}
}

module.exports = [DigitNumeralFont];