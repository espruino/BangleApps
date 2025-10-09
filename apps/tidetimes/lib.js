exports = {
  period :  12*3600000 + 25*60000, // 12h25, in msec
  offset : 0, // time(in ms) since 1970 of a high tide
  /// Given a unix timestamp, work out the tide level (from 0 to 1)
  getLevelAt : function(time) {
    return 0.5 + 0.5*Math.cos((time-this.offset) * 2 * Math.PI / this.period);
  },
  /// Get time of next high/low/ tide after given time. Returns {v:value,t:time}
  getNext : function(time,isHigh/*bool/undefined*/) {
    var v = Math.ceil(2*(time-this.offset) / this.period)/2;
    if (isHigh===undefined) {
      isHigh = (v-Math.floor(v))==0;
    } else {
      if (isHigh) v = Math.ceil(v);
      else v = Math.floor(v)+0.5;
    }
    return {v:isHigh?1:0, t:this.offset+v*this.period};
  },
  save : function() {
    let s = require("Storage").readJSON("tidetimes.json",1)||{};
    s.offset = this.offset;
    s.period = this.period;
    require("Storage").writeJSON("tidetimes.json",s);
  },
  load : function() {
    let s = require("Storage").readJSON("tidetimes.json",1)||{};
    this.offset = 0|s.offset;
    if (s.period) this.period = 0|s.period;
  }
};
exports.load();