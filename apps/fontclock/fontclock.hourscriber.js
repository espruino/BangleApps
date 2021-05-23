
const TWO_PI = 2* Math.PI;

// The problem with the trig inverse functions on
// a full circle is that the sector information will be lost
// Choosing to use arcsin because you can get back the
// sector with the help of the original coordinates
function reifyasin(x,y,asin_angle){
    if(x >= 0 && y >= 0){
        return asin_angle;
    } else if(x >= 0 && y < 0){
        return Math.PI - asin_angle;
    } else if(x < 0 && y < 0){
        return Math.PI - asin_angle;
    } else {
        return TWO_PI + asin_angle;
    }
}

// rebase and angle so be between -pi and pi
// rather than 0 to 2PI
function rebaseNegative(angle){
    if(angle > Math.PI){
        return angle - TWO_PI;
    } else {
        return angle;
    }
}

// rebase an angle so that it is between 0 to 2pi
// rather than -pi to pi
function rebasePositive(angle){
    if(angle < 0){
        return angle + TWO_PI;
    } else {
        return angle;
    }
}

/**
 * The Hour Scriber is responsible for drawing the numeral
 * on the screen at the requested angle.
 * It allows for the font to be changed on the fly.
 */
class HourScriber {
    constructor(radius, numeral_font, draw_test, bg_colour_supplier, numeral_colour_supplier, hour){
        this.radius = radius;
        this.numeral_font = numeral_font;
        this.draw_test = draw_test;
        this.curr_numeral_font = numeral_font;
        this.bg_colour_supplier = bg_colour_supplier;
        this.numeral_colour_supplier = numeral_colour_supplier;
        this.hours = hour;
        this.curr_hour_x = -1;
        this.curr_hour_y = -1;
        this.curr_hours = -1;
        this.curr_hour_str = null;
        this.last_draw_time = null;
    }
    setNumeralFont(numeral_font){
        this.numeral_font = numeral_font;
    }
    toString(){
        return "HourScriber{numeralfont=" + this.numeral_font.getName() + ",hours=" + this.hours + "}";
    }
    draw(){
        var changed = false;
        if(this.curr_hours != this.hours || this.curr_numeral_font !=this.numeral_font){
            var background = this.bg_colour_supplier();
            g.setColor(background[0],background[1],background[2]);
            this.curr_numeral_font.draw(this.curr_hour_str,
                this.curr_hour_x,
                this.curr_hour_y);
            //console.log("erasing old hour display:" + this.curr_hour_str + " color:" + background);
            var hours_frac = this.hours / 12;
            var angle = TWO_PI*hours_frac;
            var dimensions = this.numeral_font.getDimensions(this.hours);
            // we set the radial coord to be in the middle
            // of the drawn text.
            var width = dimensions[0];
            var height = dimensions[1];
            var delta_center_x = this.radius*Math.sin(angle) - width/2;
            var delta_center_y = this.radius*Math.cos(angle) + height/2;
            this.curr_hour_x  = screen_center_x + delta_center_x;
            this.curr_hour_y = screen_center_y - delta_center_y;
            this.curr_hour_str = this.numeral_font.hour_txt(this.hours);
            // now work out the angle of the beginning and the end of the
            // text box so we know when to redraw
            // bottom left angle
            var x1 = delta_center_x;
            var y1 = delta_center_y;
            var r1 = Math.sqrt(x1*x1 + y1*y1);
            var angle1 = reifyasin(x1,y1,Math.asin(x1/r1));
            // bottom right angle
            var x2 = delta_center_x;
            var y2 = delta_center_y - height;
            var r2 = Math.sqrt(x2*x2 + y2*y2);
            var angle2 = reifyasin(x2,y2,Math.asin(x2/r2));
            // top left angle
            var x3 = delta_center_x + width;
            var y3 = delta_center_y;
            var r3 = Math.sqrt(x3*x3 + y3*y3);
            var angle3 = reifyasin(x3,y3, Math.asin(x3/r3));
            // top right angle
            var x4 = delta_center_x + width;
            var y4 = delta_center_y - height;
            var r4 = Math.sqrt(x4*x4 + y4*y4);
            var angle4 = reifyasin(x4,y4,Math.asin(x4/r4));
            if(Math.min(angle1,angle2,angle3,angle4) < Math.PI && Math.max(angle1,angle2,angle3,angle4) > 1.5*Math.PI){
                angle1 = rebaseNegative(angle1);
                angle2 = rebaseNegative(angle2);
                angle3 = rebaseNegative(angle3);
                angle3 = rebaseNegative(angle4);
                this.angle_from = rebasePositive( Math.min(angle1,angle2,angle3,angle4) );
                this.angle_to = rebasePositive( Math.max(angle1,angle2,angle3,angle4) );
            } else {
                this.angle_from = Math.min(angle1,angle2,angle3,angle4);
                this.angle_to = Math.max(angle1,angle2,angle3,angle4);
            }
            //console.log(angle1 + "/" + angle2  + " / " + angle3 + " / " + angle4);
            //console.log( this.angle_from + " to " + this.angle_to);
            this.curr_hours = this.hours;
            this.curr_numeral_font = this.numeral_font;
            changed = true;
        }
        if(changed ||
            this.draw_test(this.angle_from, this.angle_to, this.last_draw_time) ){
            var numeral_color = this.numeral_colour_supplier();
            g.setColor(numeral_color[0],numeral_color[1],numeral_color[2]);
            this.numeral_font.draw(this.curr_hour_str,this.curr_hour_x,this.curr_hour_y);
            this.last_draw_time = new Date();
            //console.log("redraw digit:" + this.hours);
        }
    }
}

module.exports = HourScriber;