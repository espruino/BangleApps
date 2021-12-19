var Hand = require("fontclock.hand.js");

class ThickHand extends Hand {
    /**
     * The thick hand is created from a filled polygone, so its slower to
     * draw so to be used sparingly with few redraws
     */
    constructor(centerX,
                centerY,
                length,
                tolerance,
                draw_test,
                color_bg_supplier,
                color_fg_supplier,
                base_height,
                thickness){
        super();
        this.centerX = centerX;
        this.centerY = centerY;
        this.length = length;
        this.color_bg_supplier = color_bg_supplier;
        this.color_fg_supplier = color_fg_supplier;
        this.base_height = base_height;
        // angle from the center to the top corners of the rectangle
        this.delta_top = Math.atan(thickness/(2*length));
        // angle from the center to the bottom corners of the rectangle
        this.delta_base = Math.atan(thickness/(2*base_height));
        // the radius that the bottom corners of the rectangle move through
        this.vertex_radius_base = Math.sqrt( (thickness*thickness/4) + base_height * base_height);
        // the radius that the top corners of the rectangle move through
        this.vertex_radius_top = Math.sqrt( (thickness*thickness/4) + length * length);
        // last records the last plotted values (so we don't have to keep recalculating
        this.last_x1 = centerX;
        this.last_y1 = centerY;
        this.last_x2 = centerX;
        this.last_y2 = centerY;
        this.last_x3 = centerX;
        this.last_y3 = centerY;
        this.last_x4 = centerX;
        this.last_y4 = centerY;
        // The change in angle from the last plotted angle before we actually redraw
        this.tolerance = tolerance;
        // predicate test that is called if the hand is not going to redraw to see
        // if there is an externally defined reason for redrawing (like another hand)
        this.draw_test = draw_test;
        this.angle = -1;
        this.last_draw_time = null;
    }
    // method to move the hand to a new angle
    moveTo(angle){
        if(Math.abs(angle - this.angle) > this.tolerance || this.draw_test(this.angle - this.delta_base,this.angle + this.delta_base ,this.last_draw_time) ){
            //var background = color_schemes[color_scheme_index].background;
            var background = this.color_bg_supplier;
            g.setColor(background[0],background[1],background[2]);
            g.fillPoly([this.last_x1,
                this.last_y1,
                this.last_x2,
                this.last_y2,
                this.last_x3,
                this.last_y3,
                this.last_x4,
                this.last_y4
            ]);
            // bottom left
            var x1 = this.centerX +
                this.vertex_radius_base*Math.sin(angle - this.delta_base);
            var y1 = this.centerY - this.vertex_radius_base*Math.cos(angle - this.delta_base);
            // bottom right
            var x2 = this.centerX +
                this.vertex_radius_base*Math.sin(angle + this.delta_base);
            var y2 = this.centerY - this.vertex_radius_base*Math.cos(angle + this.delta_base);
            // top right
            var x3 = this.centerX + this.vertex_radius_top*Math.sin(angle + this.delta_top);
            var y3 = this.centerY - this.vertex_radius_top*Math.cos(angle + this.delta_top);
            // top left
            var x4 = this.centerX + this.vertex_radius_top*Math.sin(angle - this.delta_top);
            var y4 = this.centerY - this.vertex_radius_top*Math.cos(angle - this.delta_top);
            //var hand_color = color_schemes[color_scheme_index][this.color_theme];
            var hand_color = this.color_fg_supplier();
            g.setColor(hand_color[0],hand_color[1],hand_color[2]);
            g.fillPoly([x1,y1,
                x2,y2,
                x3,y3,
                x4,y4
            ]);
            this.last_x1 = x1;
            this.last_y1 = y1;
            this.last_x2 = x2;
            this.last_y2 = y2;
            this.last_x3 = x3;
            this.last_y3 = y3;
            this.last_x4 = x4;
            this.last_y4 = y4;
            this.angle = angle;
            this.last_draw_time = new Date();
            return true;
        } else {
            return false;
        }
    }
}

module.exports = ThickHand;