const storage = require("Storage");
class LocationManager {
    constructor(locations) {
        this.idx=0;
        this.locations = locations;
        this.listeners = [];
        this.in_use = true;
        this.gpsPower = 0;
        this.location_info = null;
        this.gpsCallbackInstalled = false;
    }
    init(){
        try {
            this.location_info = storage.readJSON("solar_loc." + this.getName() + ".json");
        } catch(e){
            console.log("failed to load location:" + this.getName())
        }
        if(this.location_info == null){
            this.location_info = {};
        }
        if (this.isGPSLocation() && this.getCoordinates() == null) {
           this.requestGpsUpdate();
        }
    }
    initCallback(){
        Bangle.on('GPS', (g) => {
            if (!this.in_use)
                return;

            if (g.fix) {
                var loc_info = {
                    coordinates: [g.lon, g.lat]
                };
                console.log("Received gps fixing:" + JSON.stringify(loc_info));
                storage.writeJSON("solar_loc.local.json", loc_info);
                this.setGPSPower(0);
                if(this.isGPSLocation()){
                    this.location_info = loc_info;
                    this.notifyUpdate();
                }
            }
        });
    }
    setGPSPower(power){
        if(power && !this.gpsCallbackInstalled){
            this.initCallback();
            this.gpsCallbackInstalled = true;
        }
        this.gpsPower = power;
        Bangle.setGPSPower(this.gpsPower);
    }
    getGPSPower(){return this.gpsPower;}
    requestGpsUpdate(){
        if (this.getGPSPower() == 0) {
            console.log("updating gps location update");
            this.setGPSPower(1);
        } else {
            console.log("gps already updating");
        }
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
        var locations;
        try {
            locations = storage.readJSON(LOCATIONS_FILE);
        } catch(e){
            console.log("failed to load locations file:" + e);
        }
        if(locations == null)
            locations = ['local'];

        console.log("loaded locations:" + locations);
        var mgr = new LocationManager(locations);
        mgr.init();
        return mgr;
    }
}
module.exports = LocationUtils;