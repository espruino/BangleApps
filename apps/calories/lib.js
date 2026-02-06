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
  
  // Use age-specific BMR formulas for better accuracy
  if (age < 18) {
    // Schofield equations for children/teens
    if(myProfile.gender!=undefined&&myProfile.gender!=2/*not set*/){
      if (myProfile.gender === 0) { // male
        if (age < 3) bmr = (59.5*weight) - 30.4;
        else if (age < 10) bmr = (22.7*weight) + 504.3;
        else bmr = (13.4*weight) + 692.6;
      } else { // female
        if (age < 3) bmr = (58.3*weight) - 31.1;
        else if (age < 10) bmr = (20.3*weight) + 485.9;
        else bmr = (17.7*weight) + 658.5;
      }
    } else {
      // Average for unknown gender children
      if (age < 3) bmr = (58.9*weight) - 30.75;
      else if (age < 10) bmr = (21.5*weight) + 494.6;
      else bmr = (15.55*weight) + 675.3;
    }
  } else {
    // Mifflin-St Jeor for adults (18+)
    if(myProfile.gender!=undefined&&myProfile.gender!=2/*not set*/){
      //male=0, female=1
      bmr=myProfile.gender==0?(10*weight)+(6.25*(myProfile.height*100))-(5*age)+5:(10*weight)+(6.25*(myProfile.height*100))-(5*age)-161;
    }else{
      //not defined, so we'll use an avg formula
      bmr=(10*weight)+(6.25*(myProfile.height*100))-(5*age)-78;
    }
  }
  return bmr/1440;
}
// Main formula for calculating calories. Takes health data with duration in minutes, and a myprofile data set.
exports.calcCalories = function(healthData,myProfile) {
  
  if (!healthData || !healthData.duration) return;
  if (!myProfile || !myProfile.weight || !myProfile.restingHrm || !myProfile.maxHrm || !myProfile.birthday){
    throw new Error("Calories: Not enough myProfile data to calculate!"); 
  }
  let weight = myProfile.weight;
  let age=calcAge(myProfile.birthday);
  let stepsPerMin = (healthData.steps || 0) / healthData.duration;
  //calc bmr
  let bmr=exports.calcBMR(myProfile);
  
  
  // Calculate active calories burned
  
  let hrKcalMin=0
  let hr=healthData.bpm;
  
  // Validate heart rate
  if (!hr || hr < 40 || hr > myProfile.maxHrm) {
    throw new Error("Invalid or missing heart rate data");
  }
  
  // Age-adjusted MET values for better accuracy across age groups
  let ageMultiplier = 1.0;
  if (age < 18) {
    ageMultiplier = 0.9; // Children naturally more active, lower relative effort
  } else if (age > 65) {
    ageMultiplier = 1.2; // Same pace = higher effort for elderly
  }
  
  let stepsMet = (stepsPerMin < 5 ? 1.0 : 2.0 + (0.05 * stepsPerMin)) * ageMultiplier;  // More realistic scaling with age adjustment
  
  // calculate calories using current HR (not HRR - that was causing inflation)
  if(myProfile.gender!=undefined&&myProfile.gender!=2/*not set*/){
    if(myProfile.gender==0){
      //male
      hrKcalMin=(-55.0969+(0.6309*hr)+(0.1988*weight)+(0.2017*age))/4.184;
    }else{
      //female
      hrKcalMin=(-20.4022+(0.4472*hr)+(0.1263*weight)+(0.074*age))/4.184;
    }
  }else{
    //not defined, use an avg formula
    hrKcalMin=(-37.7495+(0.5390*hr)+(0.0362*weight)+(0.1375*age))/4.184;
  }
  
  // extract active portion (subtract BMR)
  hrKcalMin = Math.max(0, hrKcalMin - bmr);// formula adds BMR by default
  
  let stepsKcalMin = (stepsMet * 3.5 * weight) / 200;
  // blend METs
  let finalActiveKcalMin = 0;
  if (stepsPerMin > 120) {
    // strenuous activity
    finalActiveKcalMin = (hrKcalMin * 0.8) + (stepsKcalMin * 0.2);
  } else if (stepsPerMin >= 10) {
    // moderate activity
    finalActiveKcalMin = (hrKcalMin * 0.5) + (stepsKcalMin * 0.5);
  } else {
    // sedentary or non-step activity (weights)
    // For elderly, don't penalize as much - might be resistance training
    if (age > 65) {
      finalActiveKcalMin = hrKcalMin * 0.8;
    } else {
      finalActiveKcalMin = hrKcalMin;
    }
  }
  
  // ensure non-negative
  finalActiveKcalMin = Math.max(0, finalActiveKcalMin);
  
  // final Outputs
  let activeTotal = finalActiveKcalMin * healthData.duration;
  // boot.js adds bmr separately
  return {
    activeCalories: Math.round(Math.max(0, activeTotal)),
    bmrCalories: Math.round(bmr*healthData.duration)
  };
}
