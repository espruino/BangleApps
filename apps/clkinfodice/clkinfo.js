(function() {
  let random = Math.randInt(6);
  return {
    name: "Bangle",
    items: [
      { name : "Dice",
        get : function() {
          return {
            text : (random+1).toString(),
            img : [
              atob("GBiBAAAAAAAAAAAAAAAAAA//8A//8AwAMAwAMAwAMAwAMAwAMAwYMAwYMAwAMAwAMAwAMAwAMAwAMA//8A//8AAAAAAAAAAAAAAAAA=="),
              atob("GBiBAAAAAAAAAAAAAAAAAA//8A//8AwAMAwAMAzAMAzAMAwAMAwAMAwAMAwAMAwDMAwDMAwAMAwAMA//8A//8AAAAAAAAAAAAAAAAA=="),
              atob("GBiBAAAAAAAAAAAAAAAAAA//8A//8AwAMAwAMAzAMAzAMAwAMAwYMAwYMAwAMAwDMAwDMAwAMAwAMA//8A//8AAAAAAAAAAAAAAAAA=="),
              atob("GBiBAAAAAAAAAAAAAAAAAA//8A//8AwAMAwAMAzDMAzDMAwAMAwAMAwAMAwAMAzDMAzDMAwAMAwAMA//8A//8AAAAAAAAAAAAAAAAA=="),
              atob("GBiBAAAAAAAAAAAAAAAAAA//8A//8AwAMAwAMAzDMAzDMAwAMAwYMAwYMAwAMAzDMAzDMAwAMAwAMA//8A//8AAAAAAAAAAAAAAAAA=="),
              atob("GBiBAAAAAAAAAAAAAAAAAA//8A//8AwAMAwAMAzDMAzDMAwAMAzDMAzDMAwAMAzDMAzDMAwAMAwAMA//8A//8AAAAAAAAAAAAAAAAA==")
            ][random]
          };
        },
        show : function() { random = Math.randInt(6); },
        hide : function() {},
        run : function() { random = Math.randInt(6); this.emit("redraw"); }
      }
    ]
  };
}) // must not have a semi-colon!