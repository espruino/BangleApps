const storage = require("Storage");
class LocationManager {
    constructor(locations) {
        this.idx=0;
        this.locations = locations;
        this.listeners = [];
        this.in_use = true;
        this.gps_queried = false;
        this.gpsPower = 0;
        this.location_info = null;
    }
    init(){
        this.location_info = storage.readJSON("solar_loc." + this.getName() + ".json");
        if(this.isGPSLocation() && !this.gps_queried) {
            console.log("updating local location");
            this._gpsUpdate();
            this.gps_queried = true;
        } 
    }
    setGPSPower(power){
        this.gpsPower = power;
        Bangle.setGPSPower(this.gpsPower);
    }
    getGPSPower(){return this.gpsPower;}
    _gpsUpdate(){
        this.setGPSPower(1);
        Bangle.on('GPS', (g) => {
            if (!this.in_use)
                return;

            if (g.fix) {
                var loc_info = {
                    last_update: new Date(),
                    coordinates: [g.lon, g.lat]
                };
                console.log("Received gps fixing:" + JSON.stringify(loc_info));
                storage.writeJSON("solar_loc.local.json", this.location_info);
                this.setGPSPower(0);
                if(this.isGPSLocation()){
                    this.location_info = loc_info;
                    this.notifyUpdate();
                }

            }
        });
    }
    isGPSLocation(){return this.getName() == 'local';}
    addUpdateListener(listener){this.listeners.push(listener);}
    nextLocation() {
        if(this.locations.length > 1) {
            this.idx += 1;
            this.idx = this.idx % this.locations.length;
            console.log("location now:" + this.getName());
            this.init();
            this.notifyUpdate();
        } else {
            console.log("no extra locations found");
        }
    }
    notifyUpdate(){
        for(var i=0; i<this.listeners.length; i++){
            this.listeners[i](this);
        }
    }
    getUTCOffset(){return this.location_info.utc_offset;}
    getName(){return this.locations[this.idx];}
    getCoordinates(){return this.location_info.coordinates;}
    shutdown(){
        this.in_use=false;
        this.setGPSPower(0);
    }
}
const LOCATIONS_FILE = "solar_locations.json";
const LocationUtils = {
    load_locations : ()=>{
        var locations = storage.readJSON(LOCATIONS_FILE);
        console.log("loaded locations:" + locations);
        var mgr = new LocationManager(locations);
        mgr.init();
        return mgr;
    }
}
module.exports = LocationUtils;