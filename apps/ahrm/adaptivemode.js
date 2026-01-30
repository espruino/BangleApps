class UintRecorder{
    constructor(dim,type){
      if(type==8){
        this.array= new Uint8Array(dim);
      }else if(type==32){
        this.array=new Uint32Array(dim);
      }
      this.dim=dim;
    }
    shift(){
    //Shifts all elements one position to the left, freeing up the last spot when the array is full.
      for(let i=1; i<this.dim; i++){
        this.array[i-1]=this.array[i];
      }
    } 
    push(value){
    //If the array is full, it shifts and then inserts the value (losing the first element).
        this.shift();
        this.array[this.dim-1]=value;
    } 
    print(){
     //Prints the array for debugging purposes.
      for(let i=0;i<this.dim;i++){
        console.log(this.array[i]);
       }
    }
    //Returns the average of the elements, excluding zero values.
    avg(){
      var sum=0;
      var n=0;
      this.array.forEach((element)=> {sum=sum+element;
                                        if(element!=0){n=n+1;}
                                     });
      return sum/n;
    }
    //Returns the standard deviation of the elements, excluding zero values.
    sd(){
      var avg= this.avg();
      var sd=0;
      var n=0;
      this.array.forEach((element)=>{if(element!=0){
                                     sd=sd+Math.pow(element-avg,2);
                                     n=n+1;
                                     }
                                      });
        return Math.sqrt(sd/n);
    }

    clean(){
      this.array.forEach((element,index,array)=>{array[index]=0;});
    }  
  
}

const hrHistory=new UintRecorder(120,8);
const movementHistory=new UintRecorder(10,32);

function write_data_pack(onHealthCopy){
    let date = new Date();
    let timeStr = date.getHours() + ":" + ("0"+date.getMinutes()).substr(-2);
    let csvLine = timeStr + "," + Math.round(onHealthCopy.movement) + "," + onHealthCopy.accuracy + "," + onHealthCopy.bpm + "\n";
    let filename = "HealthRecordA"+date.getFullYear()+(date.getMonth()+1)+date.getDate()+".csv";
    try {
        let f = require("Storage").open(filename, "a");
        if (f) {
            f.write(csvLine);
        }
    } catch(e) {
      console.log("Failed to write health data:", e);
    }
}

const onMovement={
    total:0,
    movement:0,
    n:0,
    avg:0,
 };

 function accelHandler(xyz){
    onMovement.total=onMovement.total+xyz.diff;
    onMovement.movement=onMovement.movement+xyz.diff;
    onMovement.n=onMovement.n+1;
    onMovement.avg=onMovement.movement/onMovement.n;
 }

 //------------------ DECISION ALGORITHM -------------------
var changed=false;
var mode=0;
var mode_prec=0;
var pickid;
var start_time=0;
var HRM={bpm:0,confidence:0,ok:false};

/*
mode 1 -> every 3 mins
mode 2 -> every 10 mins
mode 3 -> every 1 min
mode 4 -> every 5 mins
*/

function pickdata(){
    if(HRM.bpm==0){
      HRM.bpm=Bangle.getHealthStatus().bpm; 
      HRM.confidence=Bangle.getHealthStatus().confidence;
    }
    var h={movement:onMovement.total,accuracy:HRM.confidence,bpm:HRM.bpm};
    write_data_pack(h);
    HRM.ok=true; // sends the update to history
    //------Reset------
    onMovement.total=0;
    mode_prec=0;
    mode=0;
    changed=false;
}

function HRMPOWER(){
    Bangle.setHRMPower(1,"ahrm");
    start_time=new Date();
    setTimeout(function(){
        if(Bangle.isHRMOn&&Math.abs(new Date()-start_time)>=69*1000){ //turns off after one minute from power on
            Bangle.setHRMPower(0,"ahrm");
        }
    },70*1000);
}

var idHRMPOWER=setTimeout(HRMPOWER,60*1000);

function hrmControl(hrm){

    clearTimeout(idHRMPOWER);
    clearTimeout(pickid);

    if(hrm==1){
      idHRMPOWER=setTimeout(HRMPOWER,60*1000);    // measure after 1 minute
      pickid=setTimeout(pickdata,180*1000);      // sample after 3 mins
    }else if (hrm==3){
      idHRMPOWER=setTimeout(HRMPOWER,500);       //measure after 500ms 
      pickid=setTimeout(pickdata,60*1000);     //sample after 1 min
    }else if(hrm==2){
      idHRMPOWER=setTimeout(HRMPOWER,480*1000); //measure after 8 minutes
      pickid=setTimeout(pickdata,600*1000);     //sample after 10 mins
    }else if(hrm==4){
      idHRMPOWER=setTimeout(HRMPOWER,180*1000); //measure after 3 minutes
      pickid= setTimeout(pickdata,300*1000);    //sample after 5 mins
    }
    
}

Bangle.on("HRM",function(h){
   if(h.confidence>=60&&h.confidence>HRM.confidence){
        HRM.bpm=h.bpm;
        HRM.confidence=h.confidence;
    }
   if(h.confidence >=90 && Math.abs(Bangle.getHealthStatus().bpm - h.bpm)<1){
        Bangle.setHRMPower(0, "ahrm");
    }
});


//-----------------------------------------------------
 
function accelDataProcessing(){

//-------------Set Health packet frequency-------------
  movementHistory.push(Math.round(onMovement.avg*1000));
  if(HRM.ok){
        hrHistory.push(HRM.bpm);
        HRM={bpm:0,confidence:0,ok:false};
   }else{
        hrHistory.push(0);
   }
   
   var mv_sd= movementHistory.sd();
   var hr_sd=hrHistory.sd();
   var mv_avg=movementHistory.avg();
   //var hr_avg= hrHistory.avg();  will be used in a future version 

//----------Check on movementHistory--------------
 if(!changed){
    if((mv_sd>=50&&mv_sd<80)&&mv_avg<130){          // every 5 minutes
         changed=true;
         mode_prec=mode;
         mode=4;
         //console.log("--5min");
        }else if((mv_sd>=80 && mv_sd<110)||(mv_avg>=130&&mv_avg<260)){   //every 3 minutes
         changed=true;
         mode_prec=mode;
         mode=1;
         //console.log("--3min");
        }else{                        //every 10 minutes
           mode_prec=mode;
           mode=2;
           //console.log("---10min");
       }
    }

    if(hr_sd>=10&&hr_sd<15){         //freq 3 minutes
        changed=true;
        mode_prec=mode;
        mode=1;
        //console.log("1min");
    }else if(hr_sd>=15){                  //freq 1 minute
        changed=true;
        mode_prec=mode;
        mode=3;
        //console.log("1min");
    }

   if((mv_sd>=110||mv_avg>=260)){   //  Every 1 minute 
       changed=true;
       mode_prec=mode;
       mode=3;
       //console.log("1min");
    }

   onMovement.movement=0;
   onMovement.n=0;
   onMovement.avg=0;
    
   if(mode!=mode_prec){
      mode_prec=mode;
      hrmControl(mode);
      //console.log("Mode: "+mode);
   }

}

//-----Setup-(after reboot)--------------------------
Bangle.on('accel',accelHandler);

setInterval(accelDataProcessing,10*1000);
pickid=setTimeout(pickdata,600*1000);

