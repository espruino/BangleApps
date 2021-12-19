var NumeralFont = require("fontclock.font.js");

const DIM_25x25 = [25,25];
const DIM_10x25 = [10,25];
const DIM_20x25 = [20,25];
const DIM_31x25 = [31,25];
const DIM_15x25 = [15,25];

class DigitNumeralFont extends NumeralFont{
    constructor(){
        super();
        // dimension map provides the dimensions of the character for
        // each number for plotting and collision detection
        this.widths = atob("BgsVCw8PEBEUEBQUBw==");
        this.font =  atob("AAAAAAAAAAAAp9bgAAAAAAAAAAAADr+vAAAAAAAAAAAAAOv68AAAAAAAAAAAAA6/rwAAAAAAAAAAAADr+fAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAXwAAAAAAAAAAAAXz//wAAAAAAAAAXz//7q+AAAAAAAXz//8q+//wAAAAXz//8q+//yr3wAXz//8q+//yr3//ZAL/8q+//yr3//ZMAAAW+//2q3//ZQAAAAAC/2q3//pQAAAAAAAAF3//pQAAAAAAAAAAAnpQAAAAAAAAAAAAAAAAABL3//tgQAAAAAAAAj//su9//0gAAAAAC7/vv///73/gAAAAB/8/9u7u7/+34AAAA78/r/////c/+9QAAf9/P/LvLu/+///AADu/++//+7/7Pv79QAv37+/sQAAb/7978AF/f3vwAAAAD+/v+4Aj9779QAAAADs+/vwCP3vv1AAAAAOz7+/AF/P3fsAAAAC+/v94AL9+/v5AAAD/9/f/QAP3+/8/9ze/7+/v2AAj9+//Lztu+/P//AAAP/f3P////6//fcAAAL/z/y7u7vv7PoAAAAD/+z////9z/oAAAAAAK//3LvO/+QAAAAAAAAH3///6zAAAAAAAAAAAAAAAAAAAAAAC96fQAAAAAAAAAAAAL769AAAAAAAAAAAAAvvr5ZmZmZmZmZmAAC++v//////////8AAL76/bu7u7u7u7uwAAvvr/7u7u7u7u7uAAC++v/u7u7u7u7u4AAL76/KqqqqqqqqqgAAvvr///////////AAAjQlVVVVVVVVVVUAAAAAAAAAAAAAAAAAAAhTAAAAAAAAAyUlAAD7+udQAAAAHfv68AAPv777AAAAX/+/rwAC+/y/kAAAn+77+vAAb8/q9gAB79//v68ACf7frzAF/9/t+/rwAH/d+/QK/u/P/7+vAAX8/t/u/f/P7Pv68AAvv7+uzv3vz/+/rwAA/P3///z/v/Pr+vAACPv9u67939EOv68AAA/6///7/3AA6/rwAAAv/Ku+/iAADr+fAAAACu//5gAAAAAAAAAAAAAAAAAAAAAAAAAAhTAAAAAAAAAAIrIAD7+udgAAAAGo379gAPr7/rAAAAAfv935AB+vvvcjMkFQ/Pv+sAT6/d9K/r+vDs+/3QB/zvvzr+v68Nz7+/AJ/d+/Ov6/rx3Pv78Ab779+I/N/PX8+/zwAvv8/P/5/v7/z7/+AA+/z+m/r7/Kv9/PkACvv7///8+//7398gAB/9/bvvzvy8/89wAABv++/93+nf/b+gAAAALv/e/9//3v+wAAAAAASd21AVrcogAAAAAAAAAAAb753JAAAAAAAAAALP/frusAAAAAAAAE3/zO+u6wAAAAAABe/7z/367rAAAAAAf/+9/7vvrusAAAAG/+rv+s/9+u6wAAAAra//rf+5367rAAAABv/q7/q//vrusAAAAK2v/5z/w1+u6wAAAAb/6d/7IAX67rAAAACsr/+AL//vru//4AAG/+YAAaqr+u7aqgAAnUAAAD///67v//AAAAAAAABVWPruxVUAAAAAAAAAACtphgAAAAAAAAAAAAAAAAAAAAA0U3d3d3d1AADMAAAL76//////0ACr9AAAvvr9zMzMyABd/vAAC++v7u7u7qAPz79QAL76//////wPz975AAvvr8rN7Oyw+vv+wAC++vQN37/ODs+/vgAL769A6/v9wN37+/AAvvr0Dq+/3Q/Pv78AC++vQN38/vv8+/3QAL769Ar8397+7/36AAvvr0Bfv8/s/7/PMAC++vQA77+9/a+fwAAL769ABP3f///f8gAAVnSRAAb/mrzP8wAAAAAAAAAC3///wQAAAAAAAAAAAAJiAAAAAAAAAAA2ZmZiAAAAAAAAAK7//////+YAAAAAA//Lu7u7up77AAAABP+//+7u7v/5/QAAAP7fyN///+y/+/cAAH+/n/2qqqvv7vzwAA/f3+r/////v8+/cAD7+/v82rye38/e6wBPv9zrn9388fv7/NAI/O+va+/Pzw3Pv68Aj93689z7/dDc+vrwBPv+v06/z90Pz7++AA+/3vnO/Pz+/PvuwAD7+/o4/O/56/38+QAN/v5QP8/f//7PzxAAP89QAL+f3czfj6AAAK9wAAH/v///z/EAAADQAAAC79q879EAAAAAAAAAAJ3//YAAAAAAAAAAAAAAAAAAAAAL3p9AAAAAAAAAAAAAvvr0AAAAAAAAAAAAC++vQAAAAAAAAAAAAL769AAAAAAAAFrgAAvvr0AAAAAFrv/9AAC++vQAAFvv/9u98AAL769Wvv/8u9//6gAArN7//8u+//67z/AACv/8u+//27z//roAAFu+//273//rvP/wAAv/273//rvP//xxAABb3//rvP//xxAAAAAL/rvP//thAAAAAAAAXP/+thAAAAAAAAAACutgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGt/qYCvv2kAAAAAAb/69/+/+vP/AAAAAT+z//q/8//6/8QAAP8/7u9/P+7z/v7AADv36//+/v///778gAfv7/Lr/7++3/vz6AG+/7+/9+/v//Pz+0Aj8789d77+/Ds+/zwCf3Pryvuv68N36+vAJ/c+vK+6/rwzfr68An9z68r7r+vDN+vrwCPzvz1v+z78ez6+/AE+/7//fzv3+/Pv98AD7+/ne+/v57e/e/QAO7v3//9/u/v+vr2AAT9/7u9+v68uvz/AAAM/O////v///z/EAAACv+6vP/+u6z/IAAAAATP//1H3//7IAAAAAAAABAAAAEAAAAAAAAABJkwAAAAAAAAAAAAr///+gAAAAEQAAAB783dvP0QAADNAAAA37/93/n8AAC79QAAT5/c/9358wBt/vAADu/v+8/+79Afz79QAPn7+//Pv58Pv975AD+f7/zP3fjw+vv+wAf7789T+/6vTs+/vgCf3fvyP8/789z7+/AG+++/SP7Pvw+fr74AL5/e+837+/X3+v3AAPv7+//d3d797/35AA3+7/vMzMzK75+/MAA/r97//////r/fwAAAz5/7uqqqqt/d8gAAAe/N//////6v9gAAAACv/bqqqr3/4gAAAAAAOM/////aUAAAAAAAAAAAAAAAAAAAAAAAAAAQEQABARAAAAAAAABvvuoF+u6wAAAAAAAG++6gX67rAAAAAAAAb77qBfrusAAAAAAABvvuoF+u6wAAAAAAAE16pwPXunAAAAAAAAAAAAAAAAAAAA==");
        var scale = 1; // size multiplier for this font
        this.size = 25+(scale<<8)+(4<<16);
        this.y_offset = 0;

    }
    getDimensions(hour){
        //return this.dimension_map[hour];
        switch(hour){
            case 0:
            case 12:
                return DIM_25x25;
            case 1:
                return DIM_10x25;
            case 6:
            case 8:
            case 9:
            case 11:
                return DIM_20x25;
            case 10:
                return DIM_31x25;
            default:
                return DIM_15x25;
        }
    }
    hour_txt(hour){ return hour.toString(); }
    draw(hour_txt,x,y){
        /* going to leave this in here for future testing.
         uncomment this so that it draws a box behind the string
         so we can guess the digit dimensions*/
        /*var dim = [30,25];
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