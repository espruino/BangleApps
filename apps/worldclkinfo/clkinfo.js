
(function() {
  
  
  //All offsets from UTC in minutes. Positive: behind UTC. Negative: Ahead of UTC. 

  const londonTimeOffset=60;
  const mumbaiTimeOffset=330;
  const nycTimeOffset=-240;
  const tokyoTimeOffset=540;
  const dubaiTimeOffset=240;
  const laTimeOffset=-420;
  const parisTimeOffset=120;

  
  
  function getWorldDate(string city){
    //Gets difference between UTC and local time
    var currOffset = new Date().getTimezoneOffset();
    var date=newDate();
    var timeOffset;
    
    switch (city) {
      case "London":
        timeOffset=londonTimeOffset;
        break; 
      case "Mumbai":
        timeOffset=mumbaiTimeOffset;
        break;
      case "New York":
        timeOffset=nycTimeOffset;
        break;
      case "Tokyo":
        timeOffset=tokyoTimeOffset;
        break;
      case "Dubai":
        timeOffset=dubaiTimeOffset;
        break;
      case "Los Angeles":
        timeOffset=laTimeOffset;
        break;
      case "Paris":
        timeOffset=parisTimeOffset;
        break;

      default:
        //Nothing else matches
        timeOffset=0

    }
    
    //go to UTC time
    date.setMinutes(date.getMinutes() - currOffset);
    //from there, go to city time
    date.setMinutes(date.getMinutes() + timeOffset);
    
    var clockStr = require("locale").time(date, 1 /*omit seconds*/);
    
    return clockStr;
    
    
  }
  
  
  
  
  
  return {
    name: "World Clocks",
    items: [
      
      { name : "London",
        get : () => {
          return {
            text : "London"+"\n"+getWorldDate("London"),
            //blank image
            img : atob("")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 60000);
          }, 60000 - (Date.now() % 60000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      },
      
      { name : "Mumbai",
        get : () => {
          return {
            text : "Mumbai"+"\n"+getWorldDate("Mumbai"),
            //blank image
            img : atob("")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 60000);
          }, 60000 - (Date.now() % 60000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      },
      
      { name : "New York",
        get : () => {
          return {
            text : "New York"+"\n"+getWorldDate("New York"),
            //blank image
            img : atob("")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 60000);
          }, 60000 - (Date.now() % 60000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      },
      
      { name : "Tokyo",
        get : () => {
          return {
            text : "Tokyo"+"\n"+getWorldDate("Tokyo"),
            //blank image
            img : atob("")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 60000);
          }, 60000 - (Date.now() % 60000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      }
      
    ]
  };
})
