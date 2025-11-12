//If the user has a timeout to return to the clock, this allows it to be ignored
Bangle.setUI("clock");

function formatTime(hours) {
  let h = Math.floor(hours);             // whole hours
  let m = Math.round((hours - h) * 60);  // leftover minutes

  // handle rounding like 1.9999 → 2h 0m
  if (m === 60) {
    h += 1;
    m = 0;
  }

  if (h > 0 && m > 0) return h + "h " + m + "m";
  if (h > 0) return h + "h";
  return m + "m";
}

let summaryData=require("sleepsummary").getSummaryData()
let score=summaryData.overallSleepScore;
var message=""; //"You slept for "+ formatTime(summaryData.sleepDuration/60)
if(summaryData.avgWakeUpTime-summaryData.wakeUpTime>20){
  message+="You woke up earlier than usual today";
}else if(summaryData.avgWakeUpTime-summaryData.wakeUpTime<-20){
  message+="You woke up later than usual today";
}else{
  message+="You woke up around the same time as usual today";
}
message+=", with a sleep score of "+score+"."; 


E.showPrompt(message, {
    title: "Good Morning!",
    buttons: { "Dismiss": 1, "Open App":2},

}).then(function (answer) {
    if(answer==1){
      Bangle.load();
    }else{
      Bangle.load("sleepsummary.app.js");
    }
});
    
