(function() {
  return {
    name: "Calories",
    items: [
      { name : "TotalCalories",
        get : () => ({ 
          text : global.calories.totalCaloriesBurned==0?"--":global.calories.totalCaloriesBurned,
          img : atob("GBiBAAAAAAAAAAAAAAAAAAAQAAAQAAAYAAA8AAA+AAB+AAD+AAH+AAH+AAP+QAP+wAf/wAf/wAf/wAP/wAP/gAH/gAD/AAAAAAAAAA==") }),
        show : function() { // shown - if running, start animation
          Bangle.on("calories",function(v){
            this.emit('redraw')
          })
        },
        hide : function() { // hidden - stop animation
          Bangle.removeListener("calories",function(v){
            this.emit('redraw')
          })
        }
      },
      { name : "ActiveCalories",
        get : () => ({ 
          text : global.calories.activeCaloriesBurned==0?"--":global.calories.activeCaloriesBurned,
          img : atob("GBiBAAAAAAAAAAAAAAAAAAAQAAAQAAAYAAA8AAA+AAB+AAD+AAH+AAH+AAP+QAP+wAf/wAf/wAf/wAP/wAP/gAH/gAD/AAAAAAAAAA==") }),
        show : function() { // shown - if running, start animation
          Bangle.on("calories",function(v){
            this.emit('redraw')
          })
        },
        hide : function() { // hidden - stop animation
          Bangle.removeListener("calories",function(v){
            this.emit('redraw')
          })
        }
      },
      { name : "BmrCalories",
        get : () => ({ 
          text : global.calories.bmrCaloriesBurned==0?"--":global.calories.bmrCaloriesBurned,
          img : atob("GBiBAAAAAAAAAAAAAAAAAAAQAAAQAAAYAAA8AAA+AAB+AAD+AAH+AAH+AAP+QAP+wAf/wAf/wAf/wAP/wAP/gAH/gAD/AAAAAAAAAA==") }),
        show : function() { // shown - if running, start animation
          Bangle.on("calories",function(v){
            this.emit('redraw')
          })
        },
        hide : function() { // hidden - stop animation
          Bangle.removeListener("calories",function(v){
            this.emit('redraw')
          })
        }
      }
    ]
  };
});
