// Clock to mimic the 1996 Tamagotchi
const black = "#000000";
const yellow = "#ffff00";

{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

// Actually draw the watch face
let draw = function() {
  var x = g.getWidth();
  var y = g.getHeight();
  g.reset().clearRect(Bangle.appRect); // clear whole background (w/o widgets)
  
  // Draw background
  g.drawImage({
  width : 256, height : 140, bpp : 3,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("tu27YCLtwHGrYGD3YWG2ojNAQntBZImHHBIXKL/5fuFg3WBwwTFLiBfDOhCSHRh47VL/5ffHAIjLNwjyKC5aDHL5wvHI4Zf/L+bXDBxhHHARZTFF5ACPGQSYDL/5f1txQOFIKDUI4229pfSARRf/L+IUPdIRxOKZQdDKyVbEw4IFL/5fa2obPHYhQKtzmRKZYpEEYoUOAQpf/L777PHY5fOeQ5NPTxYUVL/5ffHBQjLO5ARRL5abMF44ONL/5ffZxW7FZhfPFI4jRMSJTIL/5fifBAoPC4ftChwRNrZfTEBJf/L8wmF3YrScwJfPFgVuQBgCQI6Rf/L75HUAS6MDMQxfTPpJf/L9QCYIITvOKY6VEGaRcqL/7yL9pfUIIxiLL44CCtwHEGZpHUL/5faEYREFFgoCOHCJxGAQgsMO4qJLL/5fkCINbbS4CBDRBQJBxwCPMoKnOL/5ffBwQMJbpzyFARiDCR7Vt2oGEMRZf/L74UIAQoaML6KAHRiQXII6Bf/L75HNepJ3LL5w1FIhgCDrYMLDpJf/L77XKIhb/RGRZ9FMRinMDphf/L74aPMQbsMAQoNLC5XtOJYyVL/5ffJqJiBFiBHGL6ACDtwRQL/5ftbp4vCOiBfLR6ACBIJxf/L9wyNJQwyM3YfK6xKRGQR0SL/5fqJpRKKBJFuG5ZfRGQoXPU4xf/L8odIJRj1HRKp9QCihf/L8wdGahpiHL7qPRI6Zf/L6LCP6wDB3Z0PQywCLSRpECAwRHEL/5ffDR4CW2pEMrZfeQAgIHL/5ff7duDRg7Ba4gCNKBBHEfwoCLGSRoJL/5ffDpg7EEx5QOF4JFOUJoCD2qJFL/5flKBTvUJqgRLR6gmLL/5ffKAwXEGR4UKL5ZiK9pfOC5Zf/L8xQEI5o1G2r8PPRQyFTYqPTL/5frEwNbI51uAgYUPO5ACXBhh6BL/5foJoW1FqFudhQyIEp/WOJQvRL/5fmEYxiMJQh0PL6CbFBZBf/L9w+FEBAjLCJBiLFJYCEraeJ6y5SL/5ffCggdEMR27FBo7HIB4XHO4SGLL/5fpCaQCVHwiJPKZXtGyhf/L8Nbtu7CyNbd4QuRL6IJJIgJrKL/5fpCgo1UFyaGPU5QOML/5fobpAKIcxIUKDRFuBxopOL/5f4cAwCB6wUTAQ4GE9oONAQZ0JHxosCL/5focYrXPfA4CErZNNBwyGNChIpFL/5ff2oOLbp77X9oOSAQ5QKC4Zf/L77RKBwZfRfxD4Y3YuNO44RHL/5ffHArjHepICLDoSGICIxfINYQuOLhZf/L8RTCNyACPtx3O3YECOIwuTARpf/L75uQCqJNINwwHE2oLD9o+SPoZf/L9dbF4oCIL6BEDJohuIFI5KOTY5f/L9Y4DEywCFPo9bCIz+PGqYjKL/5feGovtFhwMKDRKJDNxImFDpB9HGp5f/L7oyFAQTvQF4xNLCgiJLEYYgFHhwXIL/5ffBxwCM6wDB3Y3REBoGDOIIIGARyJDL/5foJTwCHExe1BI4IIARx3ML/5ffZwhKMCiIvEEBojEI5hQJBxxf/L7w4JAQNbBJFuOJ4CB3YjNBwYvJHBe1L/5ftJQoUOfwYHF6yJNBw41WEZhf/L8rpCEyIpGAQL7XA49bSqYUNL/5fdCIQjOJpLpPFgJHNQCQUQL/5fcEwxfUJpQRJ2oIF3YTKQZR0QL/5fdZxA1GARxEBC55WCJog4ITxh0KL/5ffEwntEZVbL6IXRKwgRDFZ50RL/5ffASAPPdg5xQtu1TBgmIVphf/L8TOOGoIPMfZwCEKyQCVGQJf/L8A1C3YXOrYMJDRoUPTwgCOTwJ9JVQRf/L77vUC44+PC4tuBxQLIQZaPPL/5fgcyNbCiYXPAYe7ECR0HBYZf/L74"))
}, 0, 20);

  // Draw tama
  g.drawImage({
  width : 39, height : 45, bpp : 2,
  transparent : 0,
  buffer : require("heatshrink").decompress(atob("gEP/4ECgf/4AEBn/8Bw//+AECBwf/AAIICAgPAEAP/BwwgBDoQOEC4QAEBwIIGEwgAFEwJQCAAYmCBAsDEwJfDMQYmBBYgaDBYgOEBYYOEF4yPGAAiPEIginEBwanFWw53CNYZ0cCgpfCCgwRCPohBCAoRiFYQhEDKAZiEAoTCXUgoCEBAodGR4YdELgxKBBwpuBJQKhEQYRuBGoiVHQYo+GLhDOHMQ5cGAAYA=="))
}, (x/2)-17, (y/2)-23);
  
  // Draw bars
  g.setColor(yellow);
  g.fillRect(0, 0, x, 20);
  g.fillRect(0, y-20, x, y);

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }});

// Load widgets
Bangle.loadWidgets();
draw();
setTimeout(Bangle.drawWidgets,0);
}
