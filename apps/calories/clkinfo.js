(function() {
  var settings = Object.assign({
    calGoal: 500,
    showGoalReached: true,
  }, require('Storage').readJSON("calories.settings.json", true) || {});
  // bmr calories max is just total bmr calories you should get at the end of the day
  var bmrMax=require("calories").calcBMR(require("Storage").readJSON("myprofile.json",1)||{})
  bmrMax=bmrMax*60*24;
  return {
    name: "Health",
    items: [
      { name : "TotalCalories",
        get : () => ({ 
          text : global.calories.totalCaloriesBurned==0?"--":global.calories.totalCaloriesBurned,
          img : atob("GBiBAAAAAAAAAAAAAAAAAAAQAAAQAAAYAAA8AAA+AAB+AAD+AAH+AAH+AAP+QAP+wAf/wAf/wAf/wAP/wAP/gAH/gAH/AAB8AAAAAA==") }),
         
        show : function() {
          this.caloriesHandler = () => this.emit('redraw');
          Bangle.on("calories",this.caloriesHandler);
        },
        hide : function() {
          Bangle.removeListener("calories",this.caloriesHandler)
        }
      },
      { name : "ActiveCalories",
        get : () => ({ 
          text : global.calories.activeCaloriesBurned==0?"--":global.calories.activeCaloriesBurned,
          img : atob("GBiBAAAAAAOAAAfAAAfAAAOAAAAAAAfAAA/gAB/gIBfwMDfYMDeceCeM+AeB+APB+gXB/gbj/gZx/g4x/Aww+Bw4ABgYABgYAAAAAA=="),
           max:settings.calGoal}),
        show : function() { 
          this.caloriesHandler = () => this.emit('redraw');
          Bangle.on("calories",this.caloriesHandler);
        },
       
        hide : function() {
          Bangle.removeListener("calories",this.caloriesHandler)

        }
      },
      { name : "BmrCalories",
        get : () => ({
          text : global.calories.bmrCaloriesBurned==0?"--":global.calories.bmrCaloriesBurned,
          max:bmrMax,
          img : atob("GBiBAAAAAAAAAAA/AAH/zAHB7AEIfAwMPB4M/H4e/H8+AFv+ABh+hhh/hhj/hhh/jgx/DAw+HA4DGAcGMAOG8AHPwABPAAAHgAABgA==") }),
        show : function() { 
          this.caloriesHandler = () => this.emit('redraw');
          Bangle.on("calories",this.caloriesHandler);
        },
        
        hide : function() {
          Bangle.removeListener("calories",this.caloriesHandler)

        }
      }
    ]
  };
});
