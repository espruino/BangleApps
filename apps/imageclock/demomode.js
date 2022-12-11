var demostate = 0;
function demoMode(){
  lockedRedraw = 2000;
  unlockedRedraw = 2000;
  for (var c in multistates){
    multistates[c] = ()=>{return ["on","off"][demostate%2];};
    if (c == "WeatherTemperatureUnit") multistates[c] = ()=>{return ["celsius","fahrenheit"][demostate%2];};
    if (c == "Notifications") multistates[c] = ()=>{return ["on","off","vibrate"][demostate%3];};
  }
  for (var c in numbers){
    if (c.contains("Minute")) numbers[c] = ()=>{return Math.floor((Math.random() * 9) + 1);};
    if (c.contains("Second")) numbers[c] = ()=>{return Math.floor((Math.random() * 9) + 1);};
    if (c.contains("Hour")) numbers[c] = ()=>{return Math.floor((Math.random() * 9) + 1);};
  }
  for (var c in numbers){
    if (c.contains("Ones")) numbers[c] = ()=>{return Math.floor((Math.random() * 9) + 1);};
    if (c.contains("Tens")) numbers[c] = ()=>{return Math.floor((Math.random() * 9) + 1);};
  }
  numbers.Pulse = ()=>{return Math.floor((Math.random() * 60) + 40);};
  numbers.Steps = ()=>{return Math.floor((Math.random() * 10000) + 10);};
  numbers.Temperature = ()=>{return Math.floor((Math.random() * 15) + 10);};
  numbers.Pressure = ()=>{return Math.floor((Math.random() * 1000) + 10);};
  numbers.Altitude = ()=>{return Math.floor((Math.random() * 1000) + 10);};
  numbers.WeatherCode = ()=>{return Math.floor((Math.random() * 800) + 100);};
  numbers.WeatherTemperature = ()=>{return Math.floor((Math.random() * 10) + 0);};
}
demoMode();
handleLock(false);
setInterval(()=>{demostate++;},1000);
