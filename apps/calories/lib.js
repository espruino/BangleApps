// Takes object with bpm, movement (in duration), steps (in duration), and duration in minutes
let calcAge=function(rawBday){
  let birth = new Date(rawBday);
  let now = new Date();

  // Difference in days
  let diffInDays = (now - birth) / 86400000;

  // Age in decimal years
  return diffInDays / 365.2425;
}
// returns cals/minute
exports.calcBMR=function(myProfile){
  let bmr=0;
  let weight = myProfile.weight;
  let age=calcAge(myProfile.birthday);

  if(myProfile.gender!=undefined&&myProfile.gender!=2/*not set*/){
      //male=0, female=1
      bmr=myProfile.gender==0?(10*weight)+(6.25*(myProfile.height*100))-(5*age)+5:(10*weight)+(6.25*(myProfile.height*100))-(5*age)-161;
  }else{
    //not defined, so we'll use an avg formula
    bmr=(10*weight)+(6.25*(myProfile.height*100))-(5*age)-78;
  }
  return bmr/1440;
}

// Main formula for calculating calories. Takes health data with duration in minutes, and a myprofile data set.
exports.calcCalories = function(healthData,myProfile) {
  
  if (!healthData || !healthData.duration) return;
  if (!myProfile || !myProfile.weight || !myProfile.restingHrm || !myProfile.maxHrm || !myProfile.birthday) return;
  let weight = myProfile.weight;
  let age=calcAge(myProfile.birthday);
  let stepsPerMin = healthData.steps / healthData.duration;
  //calc bmr
  let bmr=exports.calcBMR(myProfile);
  
  
  // Calculate active calories burned
  
  let hrKcalMin=0
  let hr=healthData.bpm;
  let stepsMet = 1 + (0.0175 * stepsPerMin);
  if(myProfile.gender!=undefined&&myProfile.gender!=2/*not set*/){
    if(myProfile.gender==0){
      //male
      hrKcalMin=(-55.0969+(0.6309*hr)+(0.1988*weight)+(0.2017*age))/4.184
    }else{
      //female
      hrKcalMin=(-20.4022+(0.4472*hr)+(0.1263*weight)+(0.074*age))/4.184
    }
  }else{
    //not defined, use an avg formula
    hrKcalMin=(-37.7495+(0.5390*hr)+(0.0362*weight)+(0.1375*age))/4.184
  }
  
  let stepsKcalMin = (stepsMet * weight) / 60; 

  // Blend METs
  let finalActiveKcalMin = 0;
  if (stepsPerMin > 120) {
    // Strenuous activity
    finalActiveKcalMin = (hrKcalMin * 0.8) + (stepsKcalMin * 0.2);
  } else if (stepsPerMin >= 10) {
    // Moderate activity
    finalActiveKcalMin = (hrKcalMin * 0.5) + (stepsKcalMin * 0.5);
  } else {
    // Sedentary or non-step activity (weights)
    finalActiveKcalMin = hrKcalMin/2;
  }

  // Final Outputs
  let activeTotal = finalActiveKcalMin * healthData.duration;
  let bmrTotal = bmr * healthData.duration;
  // boot.js adds bmr separately
  let netActiveBurn = activeTotal - bmrTotal;
  return {
    activeCalories: Math.round(Math.max(0, netActiveBurn)),
    bmrCalories: Math.round(bmrTotal)
  };
}


