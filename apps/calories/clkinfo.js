(function() {
  return {
    name: "Calories",
    items: [
      { name : "TotalCalories",
        get : () => ({ 
          text : global.calories.totalCaloriesBurned==0?"--":global.calories.totalCaloriesBurned,
          img : atob("GBiBAAAAAAAAAAAAAAAAAAAQAAAQAAAYAAA8AAA+AAB+AAD+AAH+AAH+AAP+QAP+wAf/wAf/wAf/wAP/wAP/gAH/gAH/AAB8AAAAAA==") }),
        show : function() { // shown - if running, start animation
          this.caloriesHandler = () => this.emit('redraw');
          Bangle.on("calories",this.caloriesHandler);
        },
        hide : function() { // hidden - stop animation
          Bangle.removeListener("calories",this.caloriesHandler)
        }
      },
      { name : "ActiveCalories",
        get : () => ({ 
          text : global.calories.activeCaloriesBurned==0?"--":global.calories.activeCaloriesBurned,
          img : atob("GBiBAAAAAAOAAAfAAAfAAAOAAAAAAAfAAA/gAB/gIBfwMDfYMDeceCeM+AeB+APB+gXB/gbj/gZx/g4x/Aww+Bw4ABgYABgYAAAAAA==") }),
        show : function() { // shown - if running, start animation
          this.caloriesHandler = () => this.emit('redraw');
          Bangle.on("calories",this.caloriesHandler);
        },
        hide : function() { // hidden - stop animation
          Bangle.removeListener("calories",this.caloriesHandler)

        }
      },
      { name : "BmrCalories",
        get : () => ({ 
          text : global.calories.bmrCaloriesBurned==0?"--":global.calories.bmrCaloriesBurned,
          img : atob("GBiBAAAAAAAAAAA/AAH/zAHB7AEIfAwMPB4M/H4e/H8+AFv+ABh+hhh/hhj/hhh/jgx/DAw+HA4DGAcGMAOG8AHPwABPAAAHgAABgA==") }),
        show : function() { // shown - if running, start animation
          this.caloriesHandler = () => this.emit('redraw');
          Bangle.on("calories",this.caloriesHandler);
        },
        hide : function() { // hidden - stop animation
          Bangle.removeListener("calories",this.caloriesHandler)

        }
      }
    ]
  };
});
