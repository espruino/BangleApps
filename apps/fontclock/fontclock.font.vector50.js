var NumeralFont = require("fontclock.font.js");

const DIM_28x44 = [28,44];
const DIM_54x44 = [54,44];

class DigitNumeralFont extends NumeralFont{
    constructor(){
        super();
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

const DIM_50x40 = [50,40];
const DIM_70x40 = [70,40];
class RomanNumeralFont extends NumeralFont{
    constructor(){
        super();
    }
    getText(hour){
        switch (hour){
            case 1 : return 'I';
            case 2 : return 'II';
            case 3 : return 'III';
            case 4 : return 'IV';
            case 5 : return 'V';
            case 6 : return 'VI';
            case 7 : return 'VII';
            case 8 : return 'VIII';
            case 9 : return 'IX';
            case 10: return 'X';
            case 11: return 'XI';
            case 12: return 'XII';
            default: return '';
        }
    }
    getDimensions(hour){
        switch (hour){
            case 3:
            case 6:
            case 9:
                return DIM_50x40;
            case 12:
                return DIM_70x40;
            default:
                return DIM_70x40;
        }
    }
    hour_txt(hour){ return this.getText(hour); }
    draw(hour_txt,x,y){
        /*var dim = DIM_70x40;
        g.setColor(0.5,0,0);
        g.fillPoly([x,y,
            x+dim[0],y,
            x+dim[0],y+dim[1],
            x,y+dim[1]
        ]);*/
        g.setFontAlign(-1,-1,0);
        g.setFont("Vector",50);
        g.drawString(hour_txt,x,y);
    }
    getName(){return "Roman";}
}

module.exports = [DigitNumeralFont,RomanNumeralFont];