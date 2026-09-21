(function(back) {
  var settings = require("Storage").readJSON("hrvtracking.settings.json",1)||{
    startTime:3*60, //minutes
    endTime:4*60, // inclusive
    enabled:true
  };
  
  function updateSettings() {
    require("Storage").writeJSON("hrvtracking.settings.json", settings);
  }
  
  function formatMinutesToTime(minutesPastMidnight) {
    const hours = Math.floor(minutesPastMidnight / 60);
    const minutes = minutesPastMidnight % 60;

    // Pad the minutes with a leading zero if needed
    const paddedMinutes = String(minutes).padStart(2, '0');

    return `${hours}:${paddedMinutes}`;
  }
  function showMainMenu(){
    var mainmenu = {
      "" : { "title" : "HRV Tracking" },
      "< Back" : back,
      /*LANG*/"Start Time" : {
        value : settings.startTime,
        onchange: v => {
          if(v>=settings.endTime){
            E.showAlert(/*LANG*/"Cannot be greater than end time.")
            .then(()=>{
              showMainMenu()
            })
            
          }else{
            settings.startTime = v;
            updateSettings();
          }
        },
        format: formatMinutesToTime,
        step:30,
        min:0,max:23*60
      },
      "< Back" : back,
      /*LANG*/"End Time" : {
        value : settings.endTime,
        onchange: v => {
          if(v<=settings.startTime){
            E.showAlert(/*LANG*/"Cannot be less than start time.")
            .then(()=>{
              showMainMenu()
            })
            
          }else{
            settings.endTime = v;
            updateSettings();
          }
        },
        format: formatMinutesToTime,
        step:30,
        min:0,max:23*60
      },
      /*LANG*/"Enabled" : {
        value : !!settings.enabled,
        onchange: v => {
          settings.enabled=v;
          updateSettings()
        },
      }
    };
    E.showMenu(mainmenu);
  }
  showMainMenu()
})
