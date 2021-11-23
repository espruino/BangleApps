var NumeralFont = require("fontclock.font.js");

const DIM_20x58 = [20,58];
const DIM_30x58 = [30,58];
const DIM_40x58 = [40,58];
const DIM_50x58 = [50,58];
class DigitNumeralFont extends NumeralFont{
    constructor(){
        super();
        // dimension map provides the dimesions of the character for
        // each number for plotting and collision detection
        this.font = atob("AAAA/+AAAAAAB///wAAAAB////8AAAA/////+AAAP/////8AAD//////8AAf/8AAf/8AD/8AAAH/4Af+AAAAD/wD/gAAAAD/gf4AAAAAH+D/AAAAAAP8P4AAAAAAf5/AAAAAAA/n4AAAAAAB+/gAAAAAAH/+AAAAAAAf/wAAAAAAA//AAAAAAAD/8AAAAAAAP/4AAAAAAB//gAAAAAAH9+AAAAAAAfn8AAAAAAD+fwAAAAAAP4/gAAAAAB/D/AAAAAAP8H/AAAAAB/gP+AAAAAf8Af/AAAAH/gA//gAAD/8AB//8AH//gAB//////8AAB//////AAAB/////wAAAA////4AAAAAP//4AAAAAAAAAAAAAAGAAAAAAAAA8AAAAAAAAH8AAAAAAAA/wAAAAAAAH+AAAAAAAA/wAAAAAAAH+AAAAAAAA/wAAAAAAAH////////w/////////H////////8/////////3//////////////////8AAAAAAAAAAAAAAAAAADAAAAAAAAAcQAAAAAAAHzwAAAAAAA/PwAAAAAAH9/AAAAAAB/34AAAAAAP/fgAAAAAD//+AAAAAAf//wAAAAAH///AAAAAA///8AAAAAH///4AAAAB/4//gAAAAP/D/+AAAAD/wP34AAAAf+A/fwAAAD/wD8/gAAA/8APz/AAAH/gA/H+AAB/4AD8f8AAP/AAPw/8AD/wAA/B/+A/+AAD8D////wAAPwH///8AAA/AH///gAAD8AH//4AAAPwAH/+AAAAAAAAAAAAAAD8AAAAAAAAPwAAAAAAAA/AAgAAAAD/8AHAAAAAP/wB8AAAAA//APwAAAAD/8D/AAAAAP/wf8AAAAB//H/wAAAAH/8//gAAAAfv//+AAAAD+///8AAAAP7//fwAAAB/P/w/gAAAP8/+D/AAAB/j/wH+AAAP8P8AP8AAB/w/gAf8AAf+D4AA/8AH/wPAAB////+AwAAD////gCAAAH///8AAAAAH///AAAAAAD//wAAAAAAA/wAAAAAAAAAAAAAAAAAAAQAAAAAAAAHAAAAAAAAD8AAAAAAAA/wAAAAAAAP/AAAAAAAD/8AAAAAAB//wAAAAAAf//AAAAAAH//8AAAAAB//PwAAAAAf/w/AAAAAP/8D8AAAAD//APwAAAA//gA/AAAAP/4AD8AAAH/+AAPwAAB//gAA/AAAf/4AAD8AAH/8AAAPwAD//AAAA/AAP/wAAAD8AA/8AAAAPwAD/AAAAA/gAPgAAA/////4AAAD////+AAAAP////wAAAA/////AAAAD////8AAAAAA/AAAAAAAAD8AAAAAAAAPwAAAAAAAAAAAAAA8AAAAAAAB/wAAAAAAD//AAAAAP///8AAAAA////wAAAAD////AAAAAP///8AAAAA//4PwAAAAH/8A/gAAAAf/wB+AAAAB+/AH4AAAAP78AfwAAAA/vwA/AAAAH8/AD+AAAA/z8AP8AAAD+PwAf4AAAf4/AA/wAAH/D8AD/gAA/4PwAH/gAf/A/AAP/8f/4AAAAf////AAAAAf///wAAAAA///8AAAAAAf//AAAAAAAH/gAAAAAAAAAAAAAAAAH/4AAAAAAP//8AAAAAD///+AAAAB////8AAAAf////8AAAH//8f/4AAA//8AD/wAAP//AAD/gAB//wAAH/AAP/+AAAH+AB//wAAAP4AP/+AAAAfwB//wAAAB/AP9/AAAAD+B/n4AAAAH4H8/gAAAAfg/j8AAAAB/H8PwAAAAH8fw/AAAAAPz+D8AAAAA/P4PwAAAAD9/A/AAAAAf38D8AAAAB/fgP4AAAAH5+A/gAAAAfv4B/AAAAD+/gH8AAAAPz+AP4AAAB/PwA/wAAAP8/AB/gAAB/gAAD/AAAP8AAAP+AAD/gAAAf+AA/8AAAA//gf/gAAAA////8AAAAB////gAAAAB///4AAAAAB//+AAAAAAA//AAAAAAAAAAAAPwAAAAAAAA/AAAAAAAAD8AAAAAAAAfwAAAAAAAP/AAAAAAAH/8AAAAAAD//wAAAAAD///AAAAAB///8AAAAA///vwAAAA///w/AAAAP//wD8AAAP//4APwAAH//8AA/AAD//+AAD8AD//+AAAPwB///AAAA/A///gAAAD8f//wAAAAP///4AAAAA///4AAAAAD//8AAAAAAP/+AAAAAAA/+AAAAAAAD/AAAAAAAAPgAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAD/AAAAAAAH//wAAAAAB///wAAAAAf///wAAAAD////wAAAAf////gAAAH/wAf/AAAA/8AAP+AAAD/AAAf8AAAf4AAAf4AAD/AAAA/gB/P4AAAB/A///AAAAH8H//8AAAAP4///gAAAAfn//+AAAAB+f//wAAAAH/+B/AAAAAf/4H8AAAAA//APwAAAAD/8A/AAAAAP/4H8AAAAB/fw/wAAAAH9///gAAAAfj//+AAAAB+P//4AAAAP4P//wAAAA/gf//gAAAH8APD/AAAA/wAAH8AAAH+AAAf8AAA/wAAA/4AAH/AAAB/4AB/4AAAD/8A//AAAAH////wAAAAP///+AAAAAP///gAAAAAP//4AAAAAAH/+AAAAAAAAAAAAAAA/wAAAAAAA//8AAAAAAP//+AAAAAD///8AAAAA////8AAAAH////4AAAA/+AD/wAAAH/AAD/gAAA/4AAD/AAAH+AAAH+AAAfwAAAP8APz+AAAAfwA/P4AAAA/gH9/AAAAD+Af34AAAAH4B+fgAAAAfwH7+AAAAA/A/v4AAAAD8D+/AAAAAPwPz8AAAAA/B/PwAAAAD8P8/gAAAAPw/j+AAAAA/H8H4AAAAH8/wfgAAAAf3+B/AAAAB+fwH8AAAAP//AP4AAAB//4A/wAAAH//AB/gAAA//4AD/AAAP//AAH+AAB//wAAf+AAf/+AAAf/AP//gAAA/////8AAAB/////AAAAB////wAAAAB///4AAAAAB//4AAAAAAAAAAAAAAA=");
        this.widths = atob("Jg8dGiAaKBsoKA==");
    }
    getDimensions(hour){
        switch(hour){
            case 1:
                return DIM_20x58;
            case 2:
            case 3:
            case 4:
            case 5:
            case 7:
                return DIM_30x58;
            case 6:
            case 8:
            case 9:
            case 11:
            case 12:
                return DIM_40x58;
            case 10:
                return DIM_50x58;
            default:
                return DIM_30x58;
        }
    }
    hour_txt(hour){ return hour.toString(); }
    draw(hour_txt,x,y){
        /* going to leave this in here for future testing.
         uncomment this so that it draws a box behind the string
         so we can guess the digit dimensions
        dim = [50,58];
        g.setColor(0.5,0,0);
        g.fillPoly([x,y,
                      x+dim[0],y,
                      x+dim[0],y+dim[1],
                      x,y+dim[1]
                     ]);
        g.setColor(1.0,1.0,1.0);*/
        //g.setFontCopasetic40x58Numeric();
        //g.setFontAlign(-1,-1,0);
        g.setFontAlign(-1,-1,0);
        g.setFontCustom(this.font, 48, this.widths, 58);
        g.drawString(hour_txt,x,y);
    }
    getName(){return "Digit";}
}

module.exports = [DigitNumeralFont];