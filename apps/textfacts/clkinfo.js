(function() {
  return {
    name: "Bangle",
    items: [
      { name : "Facts",
        get : () => ({ text : "Fact",
                      img : atob("GBiBAB8A+D/D/DBmDDA8DLYYbbeZ7bDbDbAYDbAYDbcY7bHbjbBaDbAYDbcY7bHZjbBaDbAYDbgYPZ+Z/YHbgYA+AZ///f///4AYAA==") }),
        show : function() { // shown - if running, start animation
          this.emit('redraw');
        },
        hide: function(){
          // Intentionally left blank: no action needed when hiding
        },
        run : function() { // tapped - cycle between start and stop
          /** FIXME: this assumes the clock is 'fast load'-able - if it isn't
          then the prompt will appear but the clock will continue to render on
          top of the prompt that's shown. To do this properly we probably need
          to create an actual app and load that. */
          E.showPrompt(require('textsource').getRandomText().txt,{
            title: "Fun Fact",
            buttons:{"Ok":true}
          }).then(function(v){
            Bangle.load();
          });
        }
      }
    ]
  };
})
