exports.load = (num) => {
  return require("Storage").readJSON(`waypoints${num?"."+num:""}.json`)||[{name:"NONE"}];
};

exports.save = (waypoints,num) => {
  require("Storage").writeJSON(`waypoints${num?"."+num:""}.json`, waypoints);
};
