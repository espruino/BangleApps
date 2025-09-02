
(function() {
  
  
  //read settings
  var settings = Object.assign({
  // default values
  shorten: true,
  showMeridians: true,
  shortenMeridians:false,
  }, require("Storage").readJSON("worldclkinfosettings.json", true) || {});
  
  //All offsets from UTC in minutes. Positive: behind UTC. Negative: Ahead of UTC. 

  const londonTimeOffset=60;
  const mumbaiTimeOffset=330;
  const nycTimeOffset=-240;
  const tokyoTimeOffset=540;
  const dubaiTimeOffset=240;
  const laTimeOffset=-420;
  const parisTimeOffset=120;
  const hongKongTimeOffset=480

  var showCityName=false;
  
  function getWorldDateString(cityName){
    //Gets difference between UTC and local time
    var date=new Date();
    var currOffset = date.getTimezoneOffset();
    
    var timeOffset;
    
    switch (cityName) {
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
      case "Hong Kong":
        timeOffset=hongKongTimeOffset;
        break;
      default:
        //Nothing else matches
        timeOffset=0

    }
    
    //go to UTC time
    date.setMinutes(date.getMinutes() + currOffset);
    //from there, go to city time
    date.setMinutes(date.getMinutes() + timeOffset);
    
    var meridian=require("locale").meridian(date);
    
    var clockStr;
    if(settings.showMeridians==true){
      if(settings.shortenMeridians==true){
        //get A - am, or P - pm
        clockStr = require("locale").time(date, 1 /*omit seconds*/)+meridian[0];
        
      }else{
        clockStr = require("locale").time(date, 1 /*omit seconds*/)+" "+meridian;
      }

    }else{
      
      clockStr = require("locale").time(date, 1 /*omit seconds*/);
      
    }
    
    
    var finalCityStr;
    
    if(settings.shorten==true){
      
      switch (cityName) {
      case "Los Angeles":
        finalCityStr="LA";
        break; 
      case "New York":
        finalCityStr="NYC";
        break;
      case "Hong Kong":
        finalCityStr="HK";
        break;
      default:
        //Nothing else matches
        finalCityStr=cityName;
      }
      
    }else{
      
      finalCityStr=cityName;   
      
      
    }
    
    
    
    //var finalStr=finalCityStr+"\n"+clockStr+"\n";
    if(showCityName){
      //show city
      var finalStr=finalCityStr;
    }else{
      var finalStr=clockStr;
    }
    return finalStr;
    
    
  }
  
  
  
  
  
  return {
    name: "World Clocks",
    items: [
      
      { name : "London",
        get : () => {
          return {
            text : getWorldDateString("London"),
            //blank image
            img : atob("GBiBAAD/AAPnwAbDYBiBGBEAiD///H///kMAwsIAQ4IAQYIAQf///////4IAQYIAQcIAQ0MAwn///j///BEAiBiBGAbDYAPnwAD/AA==")
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
        },
       run : function() {
         //toggle showCityName
          
          showCityName=!showCityName;
          this.emit("redraw");
        }
       
      },
      
      { name : "Mumbai",
        get : () => {
          return {
            text : getWorldDateString("Mumbai"),
            //blank image
            img : atob("GBiBAAD/AAPnwAbDYBiBGBEAiD///H///kMAwsIAQ4IAQYIAQf///////4IAQYIAQcIAQ0MAwn///j///BEAiBiBGAbDYAPnwAD/AA==")
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
        },
       run : function() {
         //toggle showCityName
          
          showCityName=!showCityName;
          this.emit("redraw");
        }
      },
      
      { name : "New York",
        get : () => {
          return {
            text : getWorldDateString("New York"),
            //blank image
            img : atob("GBiBAAD/AAPnwAbDYBiBGBEAiD///H///kMAwsIAQ4IAQYIAQf///////4IAQYIAQcIAQ0MAwn///j///BEAiBiBGAbDYAPnwAD/AA==")
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
        },
       run : function() {
         //toggle showCityName
          
          showCityName=!showCityName;
          this.emit("redraw");
        }
      },
      
      { name : "Tokyo",
        get : () => {
          return {
            text : getWorldDateString("Tokyo"),
            //blank image
            img : atob("GBiBAAD/AAPnwAbDYBiBGBEAiD///H///kMAwsIAQ4IAQYIAQf///////4IAQYIAQcIAQ0MAwn///j///BEAiBiBGAbDYAPnwAD/AA==")
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
        },
       run : function() {
         //toggle showCityName
          
          showCityName=!showCityName;
          this.emit("redraw");
        }
      },
      
      { name : "Dubai",
        get : () => {
          return {
            text : getWorldDateString("Dubai"),
            //blank image
            img : atob("GBiBAAD/AAPnwAbDYBiBGBEAiD///H///kMAwsIAQ4IAQYIAQf///////4IAQYIAQcIAQ0MAwn///j///BEAiBiBGAbDYAPnwAD/AA==")
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
        },
       run : function() {
         //toggle showCityName
          
          showCityName=!showCityName;
          this.emit("redraw");
        }
      },
      { name : "Los Angeles",
        get : () => {
          return {
            text : getWorldDateString("Los Angeles"),
            //blank image
            img : atob("GBiBAAD/AAPnwAbDYBiBGBEAiD///H///kMAwsIAQ4IAQYIAQf///////4IAQYIAQcIAQ0MAwn///j///BEAiBiBGAbDYAPnwAD/AA==")
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
        },
       run : function() {
         //toggle showCityName
          
          showCityName=!showCityName;
          this.emit("redraw");
        }
      },
      
      { name : "Paris",
        get : () => {
          return {
            text : getWorldDateString("Paris"),
            //blank image
            img : atob("GBiBAAD/AAPnwAbDYBiBGBEAiD///H///kMAwsIAQ4IAQYIAQf///////4IAQYIAQcIAQ0MAwn///j///BEAiBiBGAbDYAPnwAD/AA==")
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
        },
       run : function() {
         //toggle showCityName
          
          showCityName=!showCityName;
          this.emit("redraw");
        }
      },
      { name : "Hong Kong",
        get : () => {
          return {
            text : getWorldDateString("Hong Kong"),
            //blank image
            img : atob("GBiBAAD/AAPnwAbDYBiBGBEAiD///H///kMAwsIAQ4IAQYIAQf///////4IAQYIAQcIAQ0MAwn///j///BEAiBiBGAbDYAPnwAD/AA==")
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
        },
       run : function() {
         //toggle showCityName
          
          showCityName=!showCityName;
          this.emit("redraw");
        }
      }
      
      
      
    ]
  };
})
