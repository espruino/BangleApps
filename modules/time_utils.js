// module "time_utils"
//
// Utility functions useful to work with time and durations.
// Functions usually receive or return a {h, m} object or a
// number of milliseconds representing a time or a duration.
//

/**
 * @param {object} time {h, m}
 * @returns the milliseconds contained in the passed time object
 */
exports.encodeTime = (time) => time.h * 3600000 + time.m * 60000;

/**
 * @param {int} millis the number of milliseconds
 * @returns a time object {h, m} built from the milliseconds
 */
exports.decodeTime = (millis) => {
  millis = Math.ceil(millis / 60000);
  var h = 0 | (millis / 60);
  return {
    h: h,
    m: millis - h * 60
  };
}

/** 
 * @param {object|int} value {h,m} object or milliseconds
 * @returns an human-readable time string like "10:25"
 */
exports.formatTime = (value) => {
  var time = (value.h === undefined || value.m === undefined) ? exports.decodeTime(value) : value;
  return time.h + ":" + ("0" + time.m).substr(-2);
}

/**
 * @param {object|int} value {h,m} object or milliseconds
 * @returns an human-readable duration string like "1h 10m"
 */
exports.formatDuration = (value) => {
  var duration;

  var time = (value.h === undefined || value.m === undefined) ? exports.decodeTime(value) : value;

  if (time.h == 0) {
    duration = time.m + "m"
  } else {
    duration = time.h + "h" + (time.m ? (" " + time.m + "m") : "")
  }

  return duration
}

exports.getCurrentTimeMillis = () => {
  var time = new Date();
  return (time.getHours() * 3600 + time.getMinutes() * 60 + time.getSeconds()) * 1000;
}
