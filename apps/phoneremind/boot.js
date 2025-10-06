{
  let locationsFile="phoneremind.json";
  let buzzInterval;
  let addLocation=function(location){

    let locs = require("Storage").readJSON(locationsFile, 1) || [];
    locs.push(location);
    require("Storage").writeJSON(locationsFile, locs);

  }
  let getAllLocations = function() {
    return require("Storage").readJSON(locationsFile, 1) || [];
  };

  let getMyLocation = function() {
    if (!require("Storage").read("mylocation.json")) {
      require("Storage").writeJSON("mylocation.json", {
        location: "Unknown",
        lat: 0,
        lon: 0
      });
    }
    return require("Storage").readJSON("mylocation.json", 1);
  };

  let buzz=function(){
    Bangle.buzz(230);
  }
  
  let disconnected=function(){
     myLocation=getMyLocation();
      locs=getAllLocations();
      print(myLocation);
  print(locs);
    var useGPS=false;
    if(useGPS){
      
    }else{
      
      myLocation=getMyLocation();
      locs=getAllLocations();
      print(myLocation);
      
      for (let location of locs) {
        if(Math.abs(myLocation.lat - location.lat) < 0.0001	 && Math.abs(myLocation.lon -location.lon) < 0.0001){
          //at a familiar location, no action needed.
          return;
        }
      }
      //no location matched the current one...
      buzz()
      if(require("Storage").readJSON("setting.json",true).quiet!=2){

        setTimeout(function(){
          buzzInterval=setInterval(buzz,850);
        },750);
      }
      E.showPrompt("Phone was disconnected. It may have been left in "+myLocation.location+".",{
        
        title: "Phone Left Behind",                       
        buttons : {"Ok":true,"Save Location":false}

      }).then(function(answer) {
        clearInterval(buzzInterval);
        if(answer){
          Bangle.load();
        }else{
          addLocation({
            city:myLocation.location,
            lat:myLocation.lat,
            lon:myLocation.lon
          });
          E.showPrompt("Added location in "+myLocation.location+" to familiar locations.",{
            title:"Location Saved",
            buttons:{"Ok":true}
                       })
            .then(function() {
              Bangle.load();
          });
        }
      });
      
    }
  }
  
  
  
  NRF.on('disconnect', disconnected);
   myLocation=getMyLocation();
      locs=getAllLocations();
}
