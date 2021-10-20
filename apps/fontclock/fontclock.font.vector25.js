var NumeralFont = require("fontclock.font.js");

const DIM_14x22 = [14,22];
const DIM_27x22 = [27,22];
class DigitNumeralFont extends NumeralFont{
    constructor(){
        super();
    }
    getDimensions(hour){
        if (hour < 10){
            return DIM_14x22;
        } else {
            return DIM_27x22;
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
        g.setFont("Vector",25);
        g.drawString(hour_txt,x,y);
    }
    getName(){return "Digit";}
}

module.exports = [DigitNumeralFont];