var Math2 = require("solar_math_utils.js");

const _MIN_MILLIS = 1000 * 60 ;
const _HOUR_MILLIS = _MIN_MILLIS * 60;
const _DAY_MILLIS = _HOUR_MILLIS * 24;

function _start_of_julian_day(now){
    var sod_of_day = new Date(now.getTime());
    var local_offset_hours = sod_of_day.getTimezoneOffset()/60;
    //console.log("local_offset_hours=" + local_offset_hours);
    sod_of_day.setHours(12 + local_offset_hours,0,0,0);
    return sod_of_day;
}
function _date_to_julian_date(now){
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();

    var julian_date_full = (1461 * (year + 4800 + (month-14)/12))/4 +(367 * (month-2 - 12*((month - 14)/12)))/12-(3 * ((year + 4900 + (month - 14)/12)/100))/4 + day - 32075;
    var julian_date = (julian_date_full| 0);
    return julian_date;
}
function _to_time(now,day_fraction){
    var datetime = new Date(now.getTime());
    var hours = (day_fraction * 24) |0;
    var remainder = day_fraction - hours/24;
    var mins = (remainder * 24 * 60 | 0);
    var remainder = remainder - mins/(24*60);
    var secs = (remainder * 24 * 60 * 60 | 0);
    var remainder = remainder - secs /(24 * 60 * 60);
    var millis = remainder * 24 * 60 * 60 * 1000;
    datetime.setHours(hours, mins, secs,millis);
    return datetime;
}
const DateUtils = {
    DAY_MILLIS : _DAY_MILLIS,
    HOUR_MILLIS : _HOUR_MILLIS,
    MIN_MILLIS: _MIN_MILLIS,
    // calculate the sunrise and sunset information using the NOAA
    // equations.
    sunrise_sunset: (now,longitude,latitude, utc_offset)=>{

        var sod_julian = _start_of_julian_day(now);
        var julian_date = _date_to_julian_date(sod_julian);
        //console.log("julian date=" + julian_date);
        //var n = julian_date - 2451545.0 + 0.0008;
        var julian_century = (julian_date-2451545)/36525;
        //console.log("julian_century=" + julian_century);
        var geom_mean_long_sun_degrees = (280.46646+julian_century*(36000.76983 + julian_century*0.0003032)) % 360;
        //console.log("geom_mean_long_sun=" + geom_mean_long_sun_degrees);
        var geom_mean_anomaly_sun_degrees = 357.52911+julian_century*(35999.05029 - 0.0001537*julian_century);
        //console.log("solar_mean_anomaly_sun=" + geom_mean_anomaly_sun_degrees);
        var eccent_earth_orbit = 0.016708634-julian_century*(0.000042037+0.0000001267*julian_century);
        //console.log("eccent_earth_orbit=" + eccent_earth_orbit);
        var sun_eq_of_ctr = Math.sin(Math2.to_radians(geom_mean_anomaly_sun_degrees))*
            (1.914602-julian_century*(0.004817+0.000014*julian_century))+
            Math.sin(Math2.to_radians(2*geom_mean_anomaly_sun_degrees))*(0.019993-0.000101*julian_century)+
            Math.sin(Math2.to_radians(3*geom_mean_anomaly_sun_degrees))*0.000289;
        //console.log("sun_eq_of_ctr=" + sun_eq_of_ctr);
        var sun_true_long_degrees = geom_mean_long_sun_degrees + sun_eq_of_ctr;
        //console.log("sun_true_long_degrees=" + sun_true_long_degrees);
        //var sun_true_anom_degrees = geom_mean_anomaly_sun_degrees + sun_eq_of_ctr;
        //console.log("sun_true_anom_degrees=" + sun_true_anom_degrees);
        //var sun_rad_vector_AUs = (1.000001018*(1-eccent_earth_orbit*eccent_earth_orbit))/(1+eccent_earth_orbit*Math.cos(Math2.to_radians(sun_true_anom_degrees)))
        //console.log("sun_rad_vector_AUs=" + sun_rad_vector_AUs);
        var sun_app_long_degress = sun_true_long_degrees-0.00569-0.00478*Math.sin(Math2.to_radians(125.04-1934.136*julian_century));
        //console.log("sun_app_long_degress=" + sun_app_long_degress);
        var mean_obliq_ecliptic_degrees = 23+(26+((21.448-julian_century*(46.815+julian_century*(0.00059-julian_century*0.001813))))/60)/60;
        //console.log("mean_obliq_ecliptic_degrees=" + mean_obliq_ecliptic_degrees);
        var obliq_corr_degrees = mean_obliq_ecliptic_degrees+0.00256*Math.cos(Math2.to_radians(125.04-1934.136*julian_century))
        //console.log("obliq_corr_degrees=" + obliq_corr_degrees);

        var sun_declin_degrees = Math2.to_degrees(
            Math.asin(Math.sin(Math2.to_radians(obliq_corr_degrees))*Math.sin(Math2.to_radians(sun_app_long_degress)))
        );
        //console.log("sun_declin_degrees=" + sun_declin_degrees);
        var var_y = Math.tan(Math2.to_radians(obliq_corr_degrees/2))*Math.tan(Math2.to_radians(obliq_corr_degrees/2));
        //console.log("var_y=" + var_y);
        var eq_of_time = 4*Math2.to_degrees(
            var_y*Math.sin(2*Math2.to_radians(geom_mean_long_sun_degrees))-
            2*eccent_earth_orbit*Math.sin(Math2.to_radians(geom_mean_anomaly_sun_degrees))+
            4*eccent_earth_orbit*var_y*Math.sin(Math2.to_radians(geom_mean_anomaly_sun_degrees))*Math.cos(2*Math2.to_radians(geom_mean_long_sun_degrees))-
            0.5*var_y*var_y*Math.sin(4*Math2.to_radians(geom_mean_long_sun_degrees))-
            1.25*eccent_earth_orbit*eccent_earth_orbit*Math.sin(2*Math2.to_radians(geom_mean_anomaly_sun_degrees))
        );
        //console.log("eq_of_time=" + eq_of_time);

        var HA_sunrise_degrees = Math2.to_degrees(
            Math.acos(
                Math.cos(Math2.to_radians(90.833))/(Math.cos(Math2.to_radians(latitude))*Math.cos(Math2.to_radians(sun_declin_degrees)))-
                Math.tan(Math2.to_radians(latitude))*Math.tan(Math2.to_radians(sun_declin_degrees))
            )
        );
        //console.log("HA_sunrise_degrees=" + HA_sunrise_degrees);

        var local_offset_hours = new Date().getTimezoneOffset()/60;
        if(utc_offset == null){
            utc_offset = -local_offset_hours;
        }
        var timezone_offset_hours = utc_offset; //(utc_offset - local_offset_hours);
        console.log("timezone_offset_hours=" + timezone_offset_hours +
            " longitude" + longitude +
            " utc_offset=" + utc_offset
        );

        var solar_noon = (720-4*longitude-eq_of_time+timezone_offset_hours*60)/1440;
        var solar_noon_datetime = _to_time(now,solar_noon);

        console.log("solar_noon=" + solar_noon + "->" + solar_noon_datetime.toISOString());

        var sunrise_time_LST = (solar_noon*1440-HA_sunrise_degrees*4)/1440;
        var sunrise_time_LST_datetime = _to_time(now,sunrise_time_LST);
        console.log("sunrise_time_LST=" + sunrise_time_LST +
            "->" + sunrise_time_LST_datetime.toISOString());

        var sunset_time_LST =(solar_noon*1440+HA_sunrise_degrees*4)/1440;
        var sunset_time_LST_datetime = _to_time(now,sunset_time_LST);
        console.log("sunset_time_LST=" + sunset_time_LST +
            "->" + sunset_time_LST_datetime.toISOString());
        return {
            day_start: new Date(solar_noon_datetime.getTime() - _DAY_MILLIS / 2),
            sunrise_date: sunrise_time_LST_datetime,
            //sunrise_fraction: sunrise_time_LST,
            sunset_date: sunset_time_LST_datetime,
            //sunset_fraction: sunset_time_LST,
            solar_noon: solar_noon_datetime,
            day_end: new Date(solar_noon_datetime.getTime() + _DAY_MILLIS / 2)
        };
    },
    now_fraction_of_day: (now,day_info)=>{
        return (now.getTime() - day_info.day_start.getTime())/_DAY_MILLIS;
    },
}
module.exports = DateUtils;