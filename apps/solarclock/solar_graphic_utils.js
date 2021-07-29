var DateUtils = require("solar_date_utils.js");
var Math2 = require("solar_math_utils.js");

function _draw_info(img_info){
    if (img_info == null) {
        return {
            buff: g,
            offset_x: 0,
            offset_y: 0
        };
    } else {
        return {
            buff: img_info.img_buffer,
            offset_x: img_info.x,
            offset_y: img_info.y
        };
    }

}
const GraphicUtils = {
    draw_info : (img_info)=>_draw_info(img_info),
    set_color: (color_vector,buff)=>{
        if(buff == null)
            buff = g;

        buff.setColor(color_vector[0],color_vector[1],color_vector[2])
    },
    draw_cosine : (from_x,to_x, line_colour, screen_info, img_info)=>{
        //console.log("draw_cosine from_x=" + from_x + " to_x=" + to_x);
        var draw_info = _draw_info(img_info);

        draw_info.buff.reset();
        draw_info.buff.setColor(line_colour[0],line_colour[1],line_colour[2]);
        var first = true;
        for(var x=from_x; x<to_x;x++){
            var radians = Math2.TWO_PI *((x-screen_info.screen_start_x) - screen_info.screen_centre_x)/(screen_info.screen_width);
            var y = screen_info.screen_centre_y - screen_info.screen_height * Math.cos(radians)/2;
            if(first) {
                draw_info.buff.moveTo(x-draw_info.offset_x, y-draw_info.offset_y);
                first = false;
            } else {
                draw_info.buff.lineTo(x-draw_info.offset_x,y - draw_info.offset_y);
            }
            //console.log("(x,y)=" + x +"," + y + " radians=" +radians );
        }
        draw_info.buff.reset();
    },

    draw_sunrise_line : (sunrise_colour, day_info, screen_info, img_info)=> {
        var rise_y = screen_info.sunrise_y;
        if (rise_y == null && day_info != null) {
            var rise_fraction = (day_info.sunrise_date.getTime() - day_info.day_start.getTime()) / DateUtils.DAY_MILLIS;
            var rise_radians = Math2.TWO_PI * (rise_fraction - 0.5);
            var rise_y = screen_info.screen_centre_y - (screen_info.screen_height * Math.cos(rise_radians) / 2);
            //console.log("rise_y=" + rise_y + " rise_fraction=" + rise_fraction + " rise_radian=" + rise_radians);
            screen_info.sunrise_y = rise_y;
        }
        if(rise_y != null) {
            var draw_info = _draw_info(img_info);
            draw_info.buff.setColor(sunrise_colour[0], sunrise_colour[1], sunrise_colour[2]);
            draw_info.buff.drawLine(screen_info.screen_start_x - draw_info.offset_x,
                rise_y - draw_info.offset_y,
                screen_info.screen_width,
                rise_y - draw_info.offset_y);
        }
    },

    fill_circle_partial_y : (center_x,center_y,radius,from_y,to_y, img_info)=>{
        from_y = (from_y | 0);
        to_y = (to_y | 0);
        if(from_y > to_y){
            var tmp_y = from_y;
            from_y = to_y;
            to_y = tmp_y;
        }
        var draw_info = _draw_info(img_info);
        for(var y=from_y; y<=to_y; y++){
            // now (y-center_y)^2 + (x-center_x)^2 = radius^2
            // so (x-center_x)^2 = radius^2 - (y-center_y)^2
            // so (x-center_x) = sqrt( radius^2 - (y-center_y)^2 )
            // so x = center_x +/- sqrt( radius^2 - (y-center_y)^2 )
            var x_dist2 =radius*radius - (y-center_y)*(y-center_y);
            if(x_dist2 >= 0) {
                var x_dist = Math.sqrt(x_dist2);
                var from_x = (center_x - x_dist | 0);
                var to_x = center_x + x_dist ;
                var to_x_rounded = (to_x | 0);
                if(to_x - to_x_rounded > 0.01)
                    to_x_rounded += 1;

                draw_info.buff.drawLine(from_x-draw_info.offset_x,
                    y-draw_info.offset_y,
                    to_x_rounded-draw_info.offset_x,
                    y-draw_info.offset_y);
            }
        }
    }
}

module.exports = GraphicUtils;