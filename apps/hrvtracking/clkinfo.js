(function() {
  function isTimestampToday(unixTimestamp) {
    const date = new Date(unixTimestamp);
    const today = new Date();

    return date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate();
  }
  let hrv=require("hrvtracking").getData().latestHrv
  let text="--"
  if(hrv != undefined && isTimestampToday(hrv.timestamp)) text=Math.round(hrv.avgHrv)+" ms"
  return {
    name: "Health",
    items: [
      { name : "HRV",
        get : function() { return { text : text,
                      img : atob("GBiBAAAAAAAAAAeB4B/D+D/n/D///H///n//3h//jg+/BgMOICAOeDhg+Bzx+A//8Af/4AP/wAH/gAD/AAB+AAAYAAAAAAAAAAAAAA==") }},
        show : function() {},
        hide : function() {},
        run : function() {Bangle.load("hrvtracking.app.js")} 
        
      }
    ]
  };
})