const Math2 = require("solar_math_utils.js");
const DateUtils = require("solar_date_utils.js");
const GraphicUtils = require("solar_graphic_utils.js");
const Colors = require("solar_colors.js");

const CORONA_GAP = 2;
const CORONA_MIN_LENGTH = 2;
const CORONA_LINES = 12;
const CORONA_RADIUS = 14;
const SUNSET_START_HEIGHT = 10;
const SUNSET_COLOUR = Colors.RED;
const SUNRISE_COLOUR = [1,0.6,0];
const MIDDAY_COLOUR = [1,1,0.7];
const NIGHT_COLOUR = Colors.BLACK;

function daytime_sun_color(now,day_info){
    var now_fraction_of_day =DateUtils.now_fraction_of_day(now,day_info);
    if(now > day_info.sunset_date){
        return SUNSET_COLOUR;
    } else if(now < day_info.sunrise_date){
        return SUNRISE_COLOUR;
    } else if(now < day_info.solar_noon) {
        var sunrise_fraction = (day_info.sunrise_date - day_info.day_start) / DateUtils.DAY_MILLIS;
        var rise_to_midday_fraction = (now_fraction_of_day - sunrise_fraction) / (0.5 - sunrise_fraction);
        return Math2.interpolate(SUNRISE_COLOUR, MIDDAY_COLOUR, rise_to_midday_fraction);
    } else {
        var sunset_fraction = (day_info.day_end - day_info.sunset_date) / DateUtils.DAY_MILLIS;
        var midday_to_sunset_fraction = (now_fraction_of_day - 0.5)/(0.5 - sunset_fraction);
        //console.log("sunset_fraction=" + sunset_fraction + " midday_to_sunset_fraction=" + midday_to_sunset_fraction)
        return Math2.interpolate(MIDDAY_COLOUR,SUNSET_COLOUR,midday_to_sunset_fraction);
    }
}

function draw_night_sun(sun_x,sun_y,sun_radius,img_info){
    var draw_info = GraphicUtils.draw_info(img_info);
    GraphicUtils.set_color(Colors.WHITE,draw_info.buff);
    draw_info.buff.fillCircle(sun_x - draw_info.offset_x,
        sun_y - draw_info.offset_y,
        sun_radius);
    GraphicUtils.set_color(NIGHT_COLOUR,draw_info.buff);
    draw_info.buff.fillCircle(sun_x - draw_info.offset_x,
        sun_y - draw_info.offset_y,
        sun_radius-1);
}

function draw_partial_sun(time, day_info, screen_info,img_info){
    var sun_height = screen_info.sunrise_y - screen_info.sun_y;
    if(sun_height > screen_info.sun_radius){
        var sun_color = daytime_sun_color(time,day_info);
        var draw_info = GraphicUtils.draw_info(img_info);
        GraphicUtils.set_color(sun_color,draw_info.buff);
        draw_info.buff.fillCircle(screen_info.sun_x - draw_info.offset_x,
            screen_info.sun_y - draw_info.offset_y,
            screen_info.sun_radius
        );
    } else if(sun_height < -screen_info.sun_radius){
        draw_night_sun(screen_info.sun_x,screen_info.sun_y,screen_info.sun_radius, img_info);
    } else {
        var draw_info = GraphicUtils.draw_info(img_info);
        GraphicUtils.set_color(NIGHT_COLOUR,draw_info.buff);
        draw_info.buff.fillCircle(screen_info.sun_x - draw_info.offset_x,
            screen_info.sun_y - draw_info.offset_y,
            screen_info.sun_radius-1);
        var sun_color = daytime_sun_color(time,day_info);
        GraphicUtils.set_color(sun_color,draw_info.buff);
        draw_info.buff.drawCircle(screen_info.sun_x - draw_info.offset_x,
            screen_info.sun_y - draw_info.offset_y,
            screen_info.sun_radius);
        GraphicUtils.fill_circle_partial_y(screen_info.sun_x,
            screen_info.sun_y,
            screen_info.sun_radius,
            screen_info.sun_y - screen_info.sun_radius,
            screen_info.sunrise_y,
            img_info
        );
    }
}

function draw_random_background(screen_info,
                                img_info,
                                rgb_init,
                                rgb_step
                                ){
    var draw_info = GraphicUtils.draw_info(img_info);
    var rgb = rgb_init;
    var sky_to = Math.min(screen_info.sunrise_y-1, img_info.y + img_info.img.height - 3);
    for(var sky_y=img_info.y+3;sky_y<sky_to ; sky_y++){
        for(var i=0;i<rgb.length;i++){
            if(rgb_step[i]>0)
                rgb[i] = Math2.random_walk(rgb[i],rgb_step[i],1,0);
        }

        GraphicUtils.set_color(rgb,draw_info.buff);
        draw_info.buff.moveTo(screen_info.sun_x +
            Math.random()*img_info.img.width/8 -
            0.4*img_info.img.width -
            draw_info.offset_x,
            sky_y - draw_info.offset_y);
        draw_info.buff.lineTo(screen_info.sun_x +
            0.4*img_info.img.width -
            Math.random()*img_info.img.width/8 -
            draw_info.offset_x,
            sky_y  - draw_info.offset_y);
    }
    GraphicUtils.set_color(NIGHT_COLOUR,draw_info.buff);
    draw_info.buff.fillCircle(screen_info.sun_x - draw_info.offset_x,
        screen_info.sun_y - draw_info.offset_y,
        screen_info.sun_radius+1);
}

/**
 * SolarControllerImpl to SolarMode is a Strategy pattern.
 * The sun animation is very different through the different
 * sectors of the day so the correct strategy is selected
 * for the day sector
 */
class SolarMode {
    test(time, day_info, screen_info){ throw "test undefined";}
    draw(time, day_info, screen_info, img_buffer_info){
        throw "sun drawing undefined";
    }
}
class DayNightMode extends SolarMode {
    test(time, day_info, screen_info){
        return true;
    }
    // The corona is larger the closer you are to solar noon
    _calc_corona_radius(now, day_info){
        if(now < day_info.sunset_date &&
            now > day_info.sunrise_date){
            var now_fraction_of_day = DateUtils.now_fraction_of_day(now,day_info);
            var sunset_fraction = (day_info.sunset_date.getTime() - day_info.day_start.getTime())/DateUtils.DAY_MILLIS;
            var now_fraction_from_midday =
                1 - Math.abs(now_fraction_of_day-0.5)/(sunset_fraction-0.5);
            return CORONA_RADIUS * now_fraction_from_midday;
        } else {
            return 0;
        }
    }
    _drawCorona(corona_radius,sun_x,sun_y,sun_radius, draw_info){
        var thickness_rads = (Math2.TWO_PI/CORONA_LINES)/3;
        var from_radius = sun_radius + CORONA_GAP;
        if(corona_radius > from_radius + CORONA_MIN_LENGTH) {
            for (var i = 0; i < CORONA_LINES; i++) {
                var to_x1 = sun_x - draw_info.offset_x + from_radius * Math.cos(i * Math2.TWO_PI / CORONA_LINES + thickness_rads);
                var to_y1 = sun_y - draw_info.offset_y + from_radius * Math.sin(i * Math2.TWO_PI / CORONA_LINES + thickness_rads);
                var to_x2 = sun_x - draw_info.offset_x + from_radius * Math.cos(i * Math2.TWO_PI / CORONA_LINES - thickness_rads);
                var to_y2 = sun_y - draw_info.offset_y + from_radius * Math.sin(i * Math2.TWO_PI / CORONA_LINES - thickness_rads);
                var to_x3 = sun_x - draw_info.offset_x + corona_radius * Math.cos(i * Math2.TWO_PI / CORONA_LINES);
                var to_y3 = sun_y - draw_info.offset_y + corona_radius * Math.sin(i * Math2.TWO_PI / CORONA_LINES);
                draw_info.buff.fillPoly([to_x1, to_y1, to_x2, to_y2, to_x3, to_y3]);
            }
        }
    }
    draw(now, day_info, screen_info, img_info){
        if(now < day_info.sunrise_date || now > day_info.sunset_date){
            draw_night_sun(screen_info.sun_x,screen_info.sun_y,screen_info.sun_radius, img_info);
        } else {
            var sun_color = daytime_sun_color(now, day_info);
            var corona_radius = this._calc_corona_radius(now, day_info);
            var draw_info = GraphicUtils.draw_info(img_info);
            GraphicUtils.set_color(sun_color, draw_info.buff);
            if (corona_radius > screen_info.sun_radius) {
                this._drawCorona(corona_radius,
                    screen_info.sun_x,
                    screen_info.sun_y,
                    screen_info.sun_radius,
                    draw_info);
            }
            draw_info.buff.fillCircle(screen_info.sun_x - draw_info.offset_x,
                screen_info.sun_y - draw_info.offset_y,
                screen_info.sun_radius);
        }
    }
}
class TwiLightMode extends SolarMode {
    test(time, day_info, screen_info){
        if(screen_info.sunrise_y == null) {
            console.log("warning no sunrise_defined");
            return false;
        }
        var sun_height = screen_info.sunrise_y - screen_info.sun_y;
        /*console.log("TwilightMode " +
            "time=" + time.toISOString() +
            " sun_height=" + sun_height +
            " sun_radius=" + screen_info.sun_radius
        );*/
        if(sun_height > -screen_info.sun_radius &&
            sun_height < screen_info.sun_radius * 2 + SUNSET_START_HEIGHT
        ){
            //console.log("selected TwilightMode");
            return true;
        }
        return false;
    }
    draw(time, day_info, screen_info, img_info){
        if(time < day_info.solar_noon) {
            draw_random_background(screen_info,
                img_info,
                [0,0.8,1],
                [0.05,0.05,0.0]);
        } else {
            draw_random_background(screen_info,
                img_info,
                [1,0.75,Math.random()],
                [0,0.05,0.05]);
        }
        draw_partial_sun(time,day_info,screen_info,img_info);
    }
}
class SolarControllerImpl {
    constructor(){
        this.solar_modes = [new TwiLightMode()];
        this.default_mode = new DayNightMode()
    }
    // The mode method is responsible for selecting the
    // correct mode to the time given.
    mode(time, day_info, screen_info){
        // next we step through the different modes and test then
        // one by one.
        for(var i=0; i<this.solar_modes.length; i++){
            if(this.solar_modes[i].test(time,day_info,screen_info) ){
                return this.solar_modes[i];
            }
        }
        // Otherwise we use the default
        //console.log("defaulting");
        return this.default_mode;
    }
}

module.exports = SolarControllerImpl;