/*************************************************
 * Name: boxclk.lib
 * Type: Font Library
 * Desc: Add your custom fonts for Box Clock below
 *************************************************/

// Create an empty object for exporting module's functions
var exports={};

// Array to hold the names of the custom fonts
let fontNames = [];

// Add custom fonts below. Each font is a function that's added to the Graphics.prototype
// Use the Espruino Font Converter tool to convert your font into the appropriate format
// Use the name beginning after "setFont", for example "BrunoAce" in your JSON config
// This module and the main app will automatically delete the custom fonts in setUI

Graphics.prototype.setFontBrunoAce = function() {
  // Actual height 23 (24 - 2)
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('ABMHwADBh4DKg4bKgIPDAYUfAYV/AYX/AQMD/gmC+ADBn/AByE/GIU8AYUwLxcfAYX/8AnB//4JIP/FgMP4F+CQQBBjwJBFYRbBAd43DHoJpBh/g/xPEK4ZfDgEEORKDDAY8////wADLfZrTCgITBnhEBAYJMBAYMPw4DCM4QDjhwDCjwDBn0+AYMf/gDBh/4AYMH+ADBLpc4ToK/NGYZfnAYcfL4U/x5fBW4LvB/7vC+LvBgHAsBfIn76Cn4WBcYQDFEgJ+CQQYDyH4L/BAZbHLNYjjCAZc8ngDunycBZ4KkBa4KwBnEHY4UB+BfMgf/ZgMH/4XBc4cf4F/gE+ZgRjwAYcfj5jBM4U4M4RQBM4UA8BjIngDFEYJ8BAYUDAYQvCM4ZxBC4V+AYQvBnkBQ4M8gabBJQPAI4WAAYM/GYQaBAYJKCnqyCn5OCn4aBAYIaBAYJPCU4IABnBhIuDXCFAMD+Z/BY4IDBQwOPwEfv6TDAYUPAcwrDAYQ7BAYY/BI4cD8bLCK4RfEAA0BRYTeDcwIrFn0Pw43Bg4DugYDBjxBBU4SvDMYMH/5QBgP/LAQAP8EHN4UPwADHB4YAHA'))),
    46,
    atob("CBEdChgYGhgaGBsaCQ=="),
    32|65536
  );
};

Graphics.prototype.setFontOrbitron = function() {
  // Actual height 24 (25 - 2)
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('AA3AAQMBAYwLDAA8DBYUHwADBjwLCngDCvADC+AWJh4OCDQYWGgPgDQsPGI0cMBUf///wE/AYPAAYc4BoIDCnoDCvIDC+IDBgPhAYMDAYfBAYMHwIDBh6HBnEeAYU8AYV4AYX4AYXwAYM58ADBnfAAYM/wADCI4RTDh4DBMhNAYIqeEQ40+XIx7HAYb/SV4MBC4M+gYDCg6fCg5vCAfxnBAYMf/wDBh/8SIYAJgRrDToOAS4KhBAYKpBf4IvChwD5n5jCj7TCh4DBdoK/BMo3wAQMBAYUDAY0HAYUPuB4CAYU8AYV4AYXwAYMB8ADBQIIDBRoIDBh4DCj8AAYKTBAYK7BJ4IDHFAIrCAZgAFO4I1BAYR/CAYK/7AZDABAYMHYYM4YZAAJb4RrBR4xn/gADDNYT0BKYL8BNYs4AfybHU4XAKwJbCXa8HQYQD+M42AYQK7FAA8H/BrC/0BNYQjDM/5rdMoMA4AdBAIwLCC44A='))),
    46,
    atob("BxEbDRsaFxsaFRsbBw=="),
    32|65536
  );
};

// Extract the names of the custom fonts added to the Graphics.prototype
for (let prop in Graphics.prototype) {
  if (prop.startsWith('setFont')) {
    fontNames.push(prop.slice(7));  // remove 'setFont' from the start
  }
}

// Function to remove the custom fonts from the Graphics.prototype
function unloadCustomBoxClkFonts() {
  for (let i = 0; i < fontNames.length; i++) {
    delete Graphics.prototype[fontNames[i]];
  }
}

// Export the unload function
exports.unloadCustomBoxClkFonts = unloadCustomBoxClkFonts;