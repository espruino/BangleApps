/* 
Sit-to-Stand test, ongoing Validation
USE AT YOUR OWN RISK :)
Copyright Nicholas Ravanelli,PhD 2025 
*/

const modHS = require('HSModule');
const Layout = require("Layout");

class fiveXSTS {
    constructor(lowerThreshold, duration, samplingRate) {
        this.lowerThreshold = lowerThreshold; // Variance threshold for low movement
        this.duration = duration; // Duration to detect idle (seconds)
        this.samplingRate = samplingRate; // Sampling rate in Hz (e.g., 100 Hz)
        this.bufferSize = Math.floor(duration * samplingRate); // Number of samples in the buffer
        this.movement = []; // Rolling buffer for movement data
        this.accel = {
            x: [],
            y: [],
            z: [],
            mag: []
        };
        this.mean = 0; // Incremental mean
        this.meanSquare = 0; // Incremental mean of squares
        this.currentState = "idle"; // Starts in idle state
        this.n = 0; // Number of data points processed
        this.cycleCount = 0; // Number of sit-to-stand cycles detected
        this.runTime = 0;
        this.endTime = 0;
        this.lastState = null;
        this.lastTransitionTime = 0; // Time of last state transition
        this.inTransition = false; // Flag to indicate if we're in a valid state transition
        this.transitionDuration = 0.5 * samplingRate; // 500 ms in terms of sample count
        this.stateLock = false;
        // Create a layout with the correct properties
        this.layout = null;
    }

    newData(e) {
        // Add new value to the buffer
      if(this.currentState !== 'end_test'){
        this.movement.push(e.mag);
      }
      if(this.currentState == 'sit_stand'){
        this.accel.x.push(e.x);
        this.accel.y.push(e.y);
        this.accel.z.push(e.z);
        this.accel.mag.push(e.mag);
      }

      switch(this.currentState){
        case 'idle': {
                if (this.currentState === "idle") {
                if (this.movement.length > this.bufferSize) {
                  const removedValue = this.movement.shift(); // Remove the oldest value from the buffer
                  this.removeData(removedValue); // Update mean and meanSquare when a value is removed
              }

              // Update mean and meanSquare with the new value
              this.updateData(e.mag);

              // Only analyze if the buffer is full
              if (this.movement.length < this.bufferSize) {
                  console.log(`Collecting data... (${this.movement.length}/${this.bufferSize})`);
                  return;
              }
                  const variance = this.calculateVariance();
                  console.log(`Variance: ${variance}`);
                  // Check if variance is within the threshold for the entire buffer
                  if (variance < this.lowerThreshold/4) {
                      // Transition to movement detection state
                      this.movement = []; //clear for sit/stand test
                      this.currentState = "sit_stand";
                      Bangle.buzz();
                      console.log("Transitioning to movement detection state.");
                      setTimeout(()=>{
                      Bangle.buzz();
                      this.runTime = Date.now();
                      },1000);
                  }
              }
          break;
            }
        case 'sit_stand':{
          if(this.cycleCount < 1){
            this.refreshScreen('Start','');
          }
          const state = e.mag > this.mean + this.lowerThreshold ? 'above' : e.mag < this.mean - this.lowerThreshold ? 'below' : 'within'; // Corrected condition to ensure mutually exclusive
          const currentTime = Date.now();
          if (this.lastState == state) {// no change in state!
            if(currentTime - this.lastTransitionTime > 160 && !this.stateLock){
              if (state == 'above' && this.cycleCount % 2 === 0) {
                      this.stateLock = true;
                      // From below to above (Sit-to-Stand)
                      this.cycleCount++;
                      this.refreshScreen((this.cycleCount + 1 )/2,'');
                  } else if (state == 'below' && this.cycleCount % 2 !== 0) {
                    this.stateLock = true;
                    // From above to below (Stand-to-Sit)
                    this.cycleCount++;
                  }else if (state == 'within' && this.cycleCount > 9 ){
                      Bangle.removeAllListeners('accel');
                      this.endTime = currentTime;
                      this.currentState = "end_test";
                      let duration = ((this.endTime - this.runTime)/1000).toFixed(2);
                      Bangle.buzz();
                      this.refreshScreen(duration,' ');
                      this.saveData(duration);
                  }
            }
          }else{
            this.stateLock = false;
            this.lastTransitionTime = currentTime;
          }
          this.lastState = state;
          break;
        }
        default:
          break;
      }

    }

    updateData(value) {
        // Incrementally update mean and meanSquare
        this.n++;
        this.mean += (value - this.mean) / this.n;
        this.meanSquare += (value * value - this.meanSquare) / this.n;
    }

    removeData(value) {
        // Update mean and meanSquare when a value is removed
        this.n--;
        this.mean -= (value - this.mean) / this.n;
        this.meanSquare -= (value * value - this.meanSquare) / this.n;
    }

    calculateVariance() {
        return this.meanSquare - this.mean * this.mean;
    }
    refreshScreen(main,save){
        g.clear();
         this.layout = new Layout({
                            type: "v",
                            c: [ 
                              { type: "txt", font:"20%", wrap: true, fillx: true, label: main, id: "main" },
                              { type: "txt", font:"6x8", wrap: true, fillx: true, label: save, id: "save" }
                            ]
                        });

        this.layout.render();
    }
    saveData(t){
      let out = {
        duration: t,
        x: this.accel.x.join(";"),
        y: this.accel.y.join(";"),
        z: this.accel.z.join(";"),
        mag: this.accel.mag.join(";")
      };
      if(modHS.saveDataToFile('5sts', '5sts', out)){
        this.refreshScreen(t,'SAVED!!');
        setTimeout(()=>{Bangle.setBacklight(0);Bangle.load();},5000);
      }
    }
}

// Example usage
function accelHandler(e){
   detector.newData(e);
} 
const detector = new fiveXSTS(0.05, 5, 12.5); 

//Bangle.accelWr(0x18, 0b01110100); // off, +-8g
//Bangle.accelWr(0x1B, 0x03 | 0x40); // 100hz output, ODR/2 filter
//Bangle.accelWr(0x18, 0b11110100); // +-8g
function init(){
          let layout = new Layout({
            type: "v",
            c: [ 
                { type: "txt", font:"6x8:3", wrap: true, fillx: true, label: "Cross Arms and Wait for Watch to Vibrate to Begin", id: "main" },
            ]
        });
        g.clear();
        layout.render();
        setTimeout(()=>{
          Bangle.setPollInterval(80); 
          Bangle.on('accel', accelHandler);
        },2000);
}
Bangle.setOptions({backlightTimeout: 0});
Bangle.setBacklight(1);
init();
