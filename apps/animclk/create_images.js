/* Creates an image and palette based off of
an image from http://www.effectgames.com/demos/canvascycle/

You just need to open devtools and find the `CanvasCycle.processImage`
call, then create a file for it. eg.

http://www.effectgames.com/demos/canvascycle/image.php?file=V29&callback=CanvasCycle.processImage

Finally cycles just needs adding
*/
var CanvasCycle = {
  processImage : function(info) {
    const IMG1_HEIGHT = 55;
    const IMG2_HEIGHT = 240-(24+55);
    var img1 = Buffer.alloc(240*IMG1_HEIGHT);
    var img2 = Buffer.alloc(240*IMG2_HEIGHT);
    var n=0;
    /*   img.writeUInt8(240, n++);
   img.writeUInt8(240, n++);
   img.writeUInt8(8, n++);*/
    var pal = Buffer.alloc(256*2);

    for (var i=0;i<info.colors.length;i++) {
      var c = info.colors[i];
      var p = ((c[0]&0xF8)<<8) |
             ((c[1]&0xFC)<<3) |
             ((c[2]&0xF8)>>3);
      pal.writeUInt16LE(p, i*2);
    }

    function getPixel(x,y) {
      return info.pixels[(x+640-240)+((y+480-240)*640)];
    }

    n = 0;
    for (var y=0;y<IMG1_HEIGHT;y++) {
      for (var x=0;x<240;x++) {
        img1.writeUInt8(getPixel(x,y), n++);
      }
    }
    n = 0;
    for (var y=0;y<IMG2_HEIGHT;y++) {
      for (var x=0;x<240;x++) {
        img2.writeUInt8(getPixel(x,y+IMG1_HEIGHT), n++);
      }
    }

    require("fs").writeFileSync("animclk.pixels1",img1,"binary");
    require("fs").writeFileSync("animclk.pixels2",img2,"binary");
    require("fs").writeFileSync("animclk.pal",pal,"binary");
    console.log("Files written");
    console.log("Cycles", info.cycles);
  }
};

//http://www.effectgames.com/demos/canvascycle/
eval(require("fs").readFileSync("V29.LBM.js").toString());
