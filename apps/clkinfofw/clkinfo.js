(function() {
  return {
    name: "Bangle",
    items: [
      { name : "FW",
        get : () => {
          let d = new Date();
          let g = Graphics.createArrayBuffer(24,24,1,{msb:true});
          //g.drawImage(atob("FhgBDADAMAMP/////////////////////8AADwAAPAAA8AADwAAPAAA8AADwAAPAAA8AADwAAPAAA8AADwAAP///////"),1,0);
	  //g.drawImage(atob("GBjD/wAA//8c56pSLGOylJrWwxgkknFY7HI4kkkkk5mw2mUvEkkklarVWq5XIkkksAAAAAAABkklAAAAAAAAAIk7AAAAAAAAAbHOgAAAAAAAAV4lAAAAAAAAAIlXAAdtttvgAarSgAMkkklgAWYlAAMkkklgAInXAAMkkklgAa7XAAMkkklgAa4lAAMkkklgAInSgAMkkklgAWZXAAdtttvgAaolAAAAAAAAAInOgAAAAAAAAV47AAAAAAAAAbElAAAAAAAAAIkksAAAAAAABkkklarVWq5XIkkkk5mw2mUvEkkkknFY7HI4kkk="),1,0);
          g.drawImage(atob("GBjD/wAA//8QhEEIvvfPewhC970kk9Ho/lcrkkkkkpxOJRqNEkkkxZ3O7V6vKEkmMAAAAAAABwklAAAAAAAAAInrAAAAAAAAAZdNgAAAAAAAANoygAAAAAAAAWHrAABtttsAAZdNgAOSSSRgANoygAOEkkxgAWHrAAOEkkxgAZfrAAOEkkxgAZcygAOEkkxgAWFNgAOSSSRgANrrAABtttsAAZcygAAAAAAAAWFNgAAAAAAAANrrAAAAAAAAAZclAAAAAAAAAIkmMAAAAAAABwkkxZ3O7V6vKEkkkpxOJRqNEkkkk9Ho/lcrkkk="),1,0);
	  return {
            text : process.env.VERSION,
            img : g.asImage("string")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 86400000);
          }, 86400000 - (Date.now() % 86400000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      }
    ]
  };
})
