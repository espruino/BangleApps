g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();


/* draw the alert */
E.showPrompt("Innactivity detected",{
  title:"Activity reminder",
  buttons : {"Ok": true,"Dismiss": false}
}).then(function(v) {
  console.log(stepsArray);
  if(v == true){  
    stepsArray = stepsArray.slice(0, activityreminder.maxInnactivityMin - 3);
  }
  if(v == false){
    stepsArray = stepsArray.slice(0, activityreminder.maxInnactivityMin - activityreminder.dismissDelayMin);
  }
  load();
});


Bangle.buzz();
setTimeout(load, 10000);

