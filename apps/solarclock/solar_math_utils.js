const _TWO_PI = 2 * Math.PI;

function _format00(num){
    var value = (num | 0);
    if(value > 99 || value < 0)
        throw "must be between in range 0-99";
    if(value < 10)
        return "0" + value.toString();
    else
        return value.toString();
}
const Maths2 = {
    TWO_PI: _TWO_PI,
    to_radians: (degrees)=> _TWO_PI * degrees / 360,
    to_degrees: (radians)=> 360 * radians/ (_TWO_PI),
    interpolate: (vector1, vector2, fraction)=>{
        var result = [];
        for(var i=0; i< vector1.length; i++){
            var value = vector1[i] + (vector2[i] - vector1[i]) * fraction;
            result.push(value);
        }
        return result;
    },
    format00: (num)=>{
       return _format00(num)
    },
    format000_00: (num)=>{
        var mantissa = (num | 0);
        var mantissa_abs = Math.abs(mantissa);
        var remainder = ((Math.abs(num) - mantissa_abs)*100|0);
        var sign = "-";
        if(num >= 0)
            sign = "+";
        return sign + mantissa_abs.toString() + "." + _format00(remainder);

    },
    random_walk: (value,step,max,min)=>{
        if(Math.random()>0.5){
            value -= step;
        } else {
            value += step;
        }
        value = Math.min(value,max);
        value = Math.max(value,min);
        return value;
    }
}
module.exports = Maths2;