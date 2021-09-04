(() => {
  function draw() {
    g.reset();
    g.drawImage(E.toArrayBuffer(atob("GBiEBAAAAAABEREQAAAAAAAAAAAKmZkgAAAAAAAAAAAKmZkgAAAAAAAAAAAKkzkgAAAAAAACIQAKkzkgABIgAAAZmSAKPykgApmRAAApmZoqMjkiqZmSAAKZmZmZ8zmpmZmZIAKZmZmZMzmZmZmZIAEpmZmZkzqZmZmSEAACqZmZkjOZmZogAAAAApmZkjOZmSAAAAAAApmZn/mZmSAAAAACqZmZrymZmZogAAEpmZmZkzmZmZmSEAqZmZmZkjqZmZmZoAKZmZmamvmpmZmZIAApmZIan6mhKZmSAAAZmiAKkymgAqmRAAACIAAKkimgAAIgAAAAAAAKkimgAAAAAAAAAAAKmZmgAAAAAAAAAAAKmZmgAAAAAAAAAAABEREQAAAAAA==")), this.x, this.y);
  }

  var accelData = new Uint8Array(20);
  var accelIdx = 0;
  //http://kionixfs.kionix.com/en/datasheet/KX023-1025%20Specifications%20Rev%2012.0.pdf
  Bangle.accelWr(0x1B,0x01 | 0x40); // 25hz output, ODR/2 filter
  Bangle.setPollInterval(40); // 25hz input
  Bangle.on('accel',function(a) {
    accelData[accelIdx++] = E.clip(a.mag*64,0,255);
    if (accelIdx>=accelData.length) {
      accelIdx = 0;
      try { NRF.updateServices({
        "a19585e9-0001-39d0-015f-b3e2b9a0c854" : {
          "a19585e9-0002-39d0-015f-b3e2b9a0c854" : {
            value : accelData, notify : true
          }
        }
      })} catch(e) {}
    }
  });

  NRF.setServices({
    "a19585e9-0001-39d0-015f-b3e2b9a0c854" : {
      "a19585e9-0002-39d0-015f-b3e2b9a0c854" : {
        value : accelData,
        maxLen : 20,
        readable : true,
        notify : true
      }
    }
  });

  // add your widget
  WIDGETS["openseizure"]={
    area:"tl", width: 24, draw:draw
  };
})()
