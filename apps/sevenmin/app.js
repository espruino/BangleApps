/*
'Jumping jacks', 
'Wall sit', 
'Pushups', 
'Crunches', 
'Step-up onto chair, alternating legs', 
'Squats', 
'Triceps dips, using a chair or bench', 
'Forearm plank', 
'High-knees or running in place', 
'Lunges, alternating legs', 
'Pushups with rotation, alternating sides', 
'Side plank', 

Once you've completed all 12 exercises, take a break for 1–2 minutes and repeat the circuit another 2–3 times.

*/
{

  let R = Bangle.appRect;
  let instructions = ['Rest\n\nNext up:\n\n',
                      'Tap to start!',
                      'Get ready!\nFirst up:\n',
                      'Jumping jacks', 
                      'Wall sit', 
                      'Pushups', 
                      'Crunches', 
                      'Step-up onto\nchair,\nalternating legs', 
                      'Squats', 
                      'Triceps dips,\n using\ a\nchair or bench', 
                      'Forearm plank', 
                      'High-knees or\nrunning in place', 
                      'Lunges,\nalternating legs', 
                      'Pushups with\nrotation,\nalternating sides', 
                      'Side plank',
                      'Workout done!'
                     ];
  
  Bangle.setLCDTimeout(0);
  Bangle.setLocked(false);
  
  let draw = function(instruction) {
    g.reset();
    g.clearRect(R);

    g.setFont12x20();
    g.setFontAlign(0,0,0);
    g.drawString(instruction, R.w/2, R.h/2); 
  };

  let endWorkout = function(interval) {
    draw(instructions[instructions.length-1]);
    clearInterval(interval);
    ongoing = false;
  };

  let cycle = 40; // standard cycle is 40 seconds
  let scaling = cycle/40; // scaling if changing cycle length
  let ongoing = false;
  let touchHandler = function() {
    if (!ongoing) {
      Bangle.buzz();
      ongoing = true;
      // Get ready!
      draw(instructions[2]+instructions[3]);
      let i = 3;
      // buzzes before start
      setTimeout(()=>{let j = 0; let buzzes = setInterval(()=>{Bangle.buzz(200*scaling); j++; if (j==5) clearInterval(buzzes);}, 1*1000*scaling);}, 4*1000*scaling);
      // timeout till first excercise
      setTimeout(()=>{draw(instructions[i]);i++;}, 10*1000*scaling);
      // buzzes before first rest
      setTimeout(()=>{let j = 0; let buzzes = setInterval(()=>{Bangle.buzz(200*scaling); j++; if (j==5) clearInterval(buzzes);}, 1*1000*scaling);}, 34*1000*scaling);
      // interval containing rest and excercises 10+30=40
      let interval = setInterval(()=>{
        if (i==instructions.length-1) {
          endWorkout(interval);
        } else {
          // draw pause message
          draw(instructions[0]+instructions[i]);
          // buzzes before next excercise
          setTimeout(()=>{let j = 0; let buzzes = setInterval(()=>{Bangle.buzz(200*scaling); j++; if (j==5) clearInterval(buzzes);}, 1*1000*scaling);}, 4*1000*scaling);
          // timeout till next excercise
          setTimeout(()=>{draw(instructions[i]);i++;}, 10*1000*scaling);
          // buzzes before next rest
          setTimeout(()=>{let j = 0; let buzzes = setInterval(()=>{Bangle.buzz(200*scaling); j++; if (j==5) clearInterval(buzzes);}, 1*1000*scaling);}, 34*1000*scaling);
        }
      }, 40*1000*scaling);
    }
  };

  /*
  let swipeHandler = function() {
    
  };
  */

  let uiMode = { 
    mode : 'custom',
    back : load,
    touch : touchHandler,
    //swipe : swipeHandler
  };
  Bangle.setUI(uiMode);

  Bangle.loadWidgets();
  // Tap to start!
  draw(instructions[1]);
}
