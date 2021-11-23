var NumeralFont = require("fontclock.font.js");

const DIM_30x38 = [30,38];
const DIM_49x38 = [49,38];

class DigitNumeralFont extends NumeralFont{
    constructor(){
        super();
        // dimension map provides the dimensions of the character for
        // each number for plotting and collision detection
        this.widths = atob("DRIhFRwdHhsfGh8fDQ==");
        this.font = atob("AAAAAAAAAAAAAAAAAAAAAAAH4AAAAAAD/AAAAAAB/4AAAAAAf+AAAAAAH/gAAAAAB/4AAAAAAf+AAAAAAD/AAAAAAA/gAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAPwAAAAAAf8AAAAAA/+AAAAAB/8AAAAAD/wAAAAAH/gAAAAAP/AAAAAAf+AAAAAA/8AAAAAB/4AAAAAD/wAAAAAH/gAAAAAP/AAAAAAH+AAAAAAB8AAAAAAAIAAAAAAAAAAAAAAAAAAH/8AAAAAP//8AAAAP///wAAAH///+AAAD////4AAB/////AAA/////wAAf////+AAH/////wAD/////8AA//////AAP/gAA/wADwAAAAeAA4AAAADgAMAAAAA4ADAAAAAOAAwAAAADgAMAAAAA4ADgAAAAeAA/gAAA/AAP/////wAD/////8AAf/////AAH/////gAA/////4AAH////8AAB////+AAAP////AAAA////gAAAD///gAAAAH//AAAAAAAAAAAAGAAAAAwABgAAAAMAAYAAAADAAGAAAAAwADgAAAAMAA//////AAP/////wAD/////8AA//////AAP/////wAD/////8AA//////AAP/////wAD/////8AA//////AAP/////wAAAAAAAMAAAAAAADAAAAAAAAwAAAAAAAMAAAAAAAAAAAAAAAAAAAHwAAD8AAH/AAB/AAD/wAA/wAA/+AAf8AAf/gAP/AAH/4AH/wAD/+AD/8AA//gB//AAOPwA//wADD4Aff8AAwAAPn/AAMAAPx/wADAAH8f8AA4AH+H/AAPgP/B/wAD///gf8AA///4H/AAP//8B/wAD//+Af8AAf//AH/AAH//wB/wAA//4A/8AAH/4Af/AAA/8A//wAAD8Af/8AAAAAD+AAAAAAAAAAAAAAAAAAAAAAAAPwAAA/gAP+AAAf8AD/wAAP/gB/+AAH/4Af/wAB/+AH/8AAf/gB//AAP/4wP/wAD/8OD+OAAw/DgPDgAMDAwAA4ADAAcAAOAAwAHAADgAOAH4AA4AD///AAeAA///+A/AAP/////wAD/////8AA//9///AAP//f//gAB//n//4AAf/w//+AAD/8P//AAAf+B//gAAB+AP/wAAAAAB/4AAAAAADwAAAAAAAAAAAAAAAeAAAAAAAfgAAAAAAf4AAAAAAPmAAAAAAPhgAAAAAPwYAAAAAPwGAAAAAHwBgAAAAHwAYDAAAH4AGAwAAH4ABgMAAH4AAYDAAD4AAGAwAD/////8AA//////AAP/////wAD/////8AA//////AAP/////wAD/////8AA//////AAP/////wAD/////8AAAAAAYDAAAAAAGAwAAAAABgMAAAAAAYBAAAAAB/4AAAAAAf+AAAAAAAAAAAAAAAD4AAAAAAB/gAAAAAA/8AAP//wf/gAD//8H/4AA//3B//AAP8Bgf/wAD/A4D/8AAfwOA/jgAH8DAH44AB/gwAAOAAf4MAADgAH+DAAA4AB/g4AAeAAf8PwA/AAH/D///wAB/w///8AAf8P///AAD/j///wAA/4f//4AAP+H//+AAH/A///AAD/wP//gAA/gB//wAAAAAH/4AAAAAAfwAAAAAAAAAAAAAAAAAAAAAD//wAAAAH///AAAAH///8AAAD////gAAD////8AAB/////gAAf////4AAP/////AAH/////wAB/////8AA//////gAP8B4AD4AD4A4AAOAA4AMAADgAOAHAAA4ADABwAAOAAwAcAAHgAMAH4AP4ADD5///8AA5/f///AAP/////wAD/////8AAf/v//+AAH/7///AAA/+f//wAAH/H//4AAA/gf/4AAABgD/8AAAAAAH4AAAAAAAAAAAAAAAAAAAAf/wAAAAAP/8AAAAAD/8AAAAAA/8AAAAAAP+AAA/AAD/gAA/4AA/4AA//AAP+AAf/wAD/gAf/+AA/4AP//gAP+AH//4AD/gD//+AA/4B///gAP+B/+BwAD/g/8AAAA/4f8AAAAP+P8AAAAD/n8AAAAA/78AAAAAP/+AAAAAD/+AAAAAA/+AAAAAAP+AAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAB/gH/4AAA/8D//AAAf/h//wAAP/8f/+AAH//v//gAB//7//8AAf/////AAP/////wAD/////+AA//////gAP//+AB4ADgAeAAOAAwADgADgAMAA4AA4ADAAOAAOAA4AHwADgAP//+AD4AD/////+AA//////AAP/////wAD//7//8AAf/+///AAH//P//gAA//x//4AAH/4f/8AAA/8D/+AAAD8Af/AAAAAAB/AAAAAAAAAAAAA/gAAAAAA//APwAAA//8H+AAAf//j/wAAP//4/+AAD///f/gAB/////8AAf//+//AAP///v/wAD///7+eAA////PjgAPgAPwA4ADgAA4AOAAwAAOADgAMAADgA4ADAAA4AeAAwAAcAfgAPAAeA/wAD/////8AA//////AAP/////gAB/////wAAf////8AAD////+AAAf////AAAH////gAAAf///gAAAD///gAAAAH//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AH4AAAB/gD/AAAAf8B/4AAAP/Af+AAAD/wH/gAAA/8B/4AAAH/Af+AAAB/wD/AAAAP4A/gAAAAwABgAAAAAAAA==");
        var scale = 1; // size multiplier for this font
        this.size = 50+(scale<<8)+(1<<16);
        this.y_offset = -12;


    }
    getDimensions(hour){
        //return this.dimension_map[hour];
        switch (hour){
            case 10:
            case 11:
            case 12:
                return DIM_49x38;
            default:
                return DIM_30x38;

        }
    }
    hour_txt(hour){ return hour.toString(); }
    draw(hour_txt,x,y){
        /* going to leave this in here for future testing.
         uncomment this so that it draws a box behind the string
         so we can guess the digit dimensions*/
        /*var dim = [30,38];
        g.setColor(0.5,0,0);
        g.fillPoly([x,y,
                      x+dim[0],y,
                      x+dim[0],y+dim[1],
                      x,y+dim[1]
                     ]);
        g.setColor(1.0,1.0,1.0);*/
        g.setFontAlign(-1.0,-1.0,0);
        g.setFontCustom(this.font, 46, this.widths, this.size);
        g.drawString(hour_txt,x,y+this.y_offset );
    }
    getName(){return "Digit";}
}

module.exports = [DigitNumeralFont];