let ftz = require("fourTwentyTz"),
    offsets = ftz.offsets,
    timezones = ftz.timezones;

function get420offset() {
  let current_time = Math.floor((Date.now()%(24*3600*1000))/60000);
  let current_min = current_time%60;
  if (current_min>20 && current_min<25) {
      current_time -= current_min-20; // 5 minutes grace period
  }
  let offset = 16*60+20-current_time;
  if (offset<0) {
    offset += 24*60;
  }
  return offset;
}

function makeFourTwentyText(minutes, places) {
  //let plural = minutes==1? "": "s";
  //let msgprefix = minutes? `${minutes} minute${plural} to`: "It is now";
  let msgprefix = minutes? `${minutes}m to`: "It is now";
  let msgsuffix = places.length>1? ", and other fine places": "";
  let msgplace = places[Math.floor(Math.random()*places.length)];
  return `${msgprefix} 4:20 at ${msgplace}${msgsuffix}.`;
}

function getNextFourTwenty() {
  let offs = get420offset();
  for (let i=0; i<offsets.length; i++) {
    if (offsets[i]<=offs) {
      let minutes = offs-offsets[i];
      let places = timezones(offsets[i]);
      return {
        minutes: minutes,
        places: places,
        text: makeFourTwentyText(minutes, places)
      };
    }
  }
  return {
    minutes: 666,
    places: ["Snafu (Yes. It's a bug)"],
    text: "Snafu (Yes. It's a bug)"
  };
}

exports.getNextFourTwenty = getNextFourTwenty;
