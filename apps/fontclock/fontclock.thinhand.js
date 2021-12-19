var Hand = require("fontclock.hand.js");

class ThinHand extends Hand {
    /**
     * The thin hand is created from a simple line, so its easy and fast
     * to draw.
     */
    constructor(centerX,
                centerY,
                length,
                tolerance,
                draw_test,
                color_bg_supplier,
                color_fg_supplier){
        super();
        this.centerX = centerX;
        this.centerY = centerY;
        this.length = length;
        this.color_bg_supplier = color_bg_supplier;
        this.color_fg_supplier = color_fg_supplier;
        // The last x and y coordinates (not the centre) of the last draw
        this.last_x = centerX;
        this.last_y = centerY;
        // tolerance is the angle tolerance (from the last draw)
        // in radians for a redraw to be called.
        this.tolerance = tolerance;
        // draw test is a predicate (angle, time). This is called
        // when the hand thinks that it does not have to draw (from its internal tests)
        // to see if it has to draw because of another object.
        this.draw_test = draw_test;
        // The current angle of the hand. Set to -1 initially
        this.angle = -1;
        this.last_draw_time = null;
        this.active = false;
    }
    // method to move the hand to a new angle
    moveTo(angle){
        // first test to see of the angle called is beyond the tolerance
        // for a redraw
        if(Math.abs(angle - this.angle) > this.tolerance ||
            // and then call the predicate to see if a redraw is needed
            this.draw_test(this.angle,this.last_draw_time) ){
            // rub out the old hand line
            var background = this.color_bg_supplier();
            g.setColor(background[0],background[1],background[2]);
            g.drawLine(this.centerX, this.centerY, this.last_x, this.last_y);
            // Now draw the new hand line
            var hand_color = this.color_fg_supplier();
            g.setColor(hand_color[0],hand_color[1],hand_color[2]);
            var x2 = this.centerX + this.length*Math.sin(angle);
            var y2 = this.centerY - this.length*Math.cos(angle);
            g.drawLine(this.centerX, this.centerY, x2, y2);
            // and store the last draw details for the next call
            this.last_x = x2;
            this.last_y = y2;
            this.angle = angle;
            this.last_draw_time = new Date();
            this.active = true;
            return true;
        } else {
            this.active = false;
            return false;
        }
    }
}

module.exports = ThinHand;