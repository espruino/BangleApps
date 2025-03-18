// The DVD logo
var dvdLogo = require("heatshrink").decompress(atob("3dTwIFC/4AG/ALCgYJEwAcDj4XHBgYJF4AJCg4WH8AMCn4KFF4YWH/wLCh4KJIpA7CgIKG+BnHOg1/BYxGCCw4LDHQ/8IpQ6CQBBRBIpBpDBY4uCKA6jDUQy8FTIn3EQYIBGYSQDBYTVF/x0DKITMGFwh4D96jDKILuDDoSvDEAn9AQIeDB4glCwA5ELwW/FIRNB/x2BVQSvDHIgIB+ZvCNwWPOwZ7DAYKEFDwJoBAYPhHgYeC8ADCP4QEB85YCEQRFELoIqBBA5oFL4SMEwBFEBAWfDwQFB4K1EJoPwIooIB+InCHIQ8EOgYIHA4PAIQP8IogqCBYQIFw4TBAoRICIoQiB/AaDBAfwJAOAUwTrEFQZFHAQPwCYPwCIIxBWIZFIwICBSIIKBIo4IHFYXgSwRFKBARFCFYLlC8DDCRZTaDOIPPHgngaIhFFBoQfB/YhCIojRDBAg/B/gaCGYRFEHgaUED4IEBD4JBDIAIDBLgQEBIoYbC4AMCHAQcBG4IbCAgJFDCQRlBJIIzCIogJCBAgWCD4IICHARFDCwQIEIAY7DGYRmBEAIWCBAJOCNwYfBPAQSBEIWDMog8DAAQfBUYYzEAATkCBAq+CGgQzEYQgIGD4Q3CGYJnDKYhFGCwLtEVAjQDIow2BawY8HNQQIFCwR0CfYgWFBAoWDEAJ5CIogWCIooHCEAR5CJQQWFIoYPCOgg0BHgiJBIooHDUYaCCIoRLCABl/CB4AFg5MFACBNGAB8fQYYARgL/CACc/CysHLisAuAWVhgWVgL/BCyn/WyX/AAx4Mv4VHAARLJFZAAEbA5VBABwWFh4WPJAs/CZoODOA3A/8H/k//BNBK4N/AQQPB/wWF/kf4P/w4jBg4+BKIMAgYuC/BEF4P4n/w//gEIPwCYJYBCAYLBT4f4n0P/0f/k+g/+FoPwn4uDHQYACwZFB4ZHB8A2BKAQYBCAXwW4nwuF//BCBFgJ3CwZ/BCAR1BUIkEJYJHCFgINB+F/GgIAC4BLENgXhI4J5B8BfCI4KMEFwY0BKoK6BvwSDYoIoDCAIuE8APBXQMPwJaC/kPDALqEGgf8NAK6NAoLpDTYS6CCAKCCAoK+BCwhYBMYQiBXQOALQQ2BAQQWFXggAMGoIAECx6gBAArVEABJDDAAhQDABCTBABIYJ4AVKAAbCDChYA="));

// Screen width
const WIDTH = g.getWidth();
// Screen height
const HEIGHT = g.getHeight();
// dvd logo image width
const IMG_WIDTH = 94;
/// dvd logo image height
const IMG_HEIGHT = 42;

// Assign a random X and Y initial speed between 1.5 and 1
var speedX = 1.5 - Math.random() / 2;
var speedY = 1.5 - Math.random() / 2;
// The logo X and Y position
var posX = 0;
var posY = 0;

// The current logo color
var currentColor = "#ff00ff";

// Get a random value between "ff" and "00"
function getHexColor() {
  if (Math.round(Math.random())) {
    return "ff";
  } else {
    return "00";
  }
}

// Get a new 8 bit color
function getNewColor() {
  return "#" + getHexColor() + getHexColor() + getHexColor();
}

// Change the dvd logo color on impact
// Only allow colors different from the current one 
// and different from the bg
function changeColor() {
  var newColor = getNewColor();
  while (newColor == currentColor || newColor == "#000000") {
    newColor = getNewColor();
  }
  currentColor = newColor;
  g.setColor(newColor);
}

// Draw the logo
function draw() {
  // Move it
  posX += speedX;
  posY += speedY;

  var collisions = 0;
  // Collision detection
  if (posX <= 0) {
    speedX = -speedX;
    posX = 0;
    collisions++;
  }
  if (posY <= 0) {
    speedY = -speedY;
    posY = 0;
    collisions++;
  }
  if (posX >= (WIDTH - IMG_WIDTH)) {
    speedX = -speedX;
    posX = WIDTH - IMG_WIDTH;
    collisions++;
  }
  if (posY >= (HEIGHT - IMG_HEIGHT)) {
    speedY = -speedY;
    posY = HEIGHT - IMG_HEIGHT;
    collisions++;
  }

  // If we detected 2 collisions, we touched an angle, HURRAY!
  if (collisions > 1) {
    Bangle.buzz();
  }

  // Change logo color on collision
  if (collisions > 0) {
    changeColor();
  }

  // Actually draw the logo
  g.clear();
  g.drawImage(dvdLogo, posX, posY, {
    scale: 0.5
  });
  setTimeout(function () {
    draw();
  }, 15);
}

// Set the background to black
g.setBgColor(0, 0, 0);
// Start from purple
g.setColor(currentColor);
// Clear the screen
g.clear();
// Start drawing
draw();

// Exit on button press
setWatch(Bangle.showLauncher, BTN, { repeat: false, edge: "falling" });
