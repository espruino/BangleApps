exports.maxMouth = 13;
exports.maxNose = 6;
exports.maxHair = 12;
exports.maxEyes = 25;
exports.faceW = 18;
exports.faceH = 21;

exports.settingsFile = 'tinyheads.json';

let faceCanvas;

let features = {
  'mouth': [
    require("heatshrink").decompress(atob("iURwUBqoA/AAlUitVJwMFqA=")),
   
    require("heatshrink").decompress(atob("iURwUBqoA/AA9UJQNQA=")),
    require("heatshrink").decompress(atob("iUSwUBqoA9qgCBqNVqBKBAwNP//FAgMAJ4I=")),
    require("heatshrink").decompress(atob("iUSwUBqoA/AA9AgEVqtQAIQ=")),
    require("heatshrink").decompress(atob("iUSwUBqoA/AA1UikUioEEA==")),
    require("heatshrink").decompress(atob("iUSwUBqoA/AAVAJQMVqn///xBAg=")),
    require("heatshrink").decompress(atob("iUSwUBqoA/AAVAJQMVqnz/nxBAg=")),
    require("heatshrink").decompress(atob("iUSwUBqoA/AAdAioDBqEABAo")),
    require("heatshrink").decompress(atob("iURwUBqoA/AAVQAIVVoEAitQ")),
    require("heatshrink").decompress(atob("iUSwUBqoA/AAVQAIVVp8PioEB6t1qoA=")),
    require("heatshrink").decompress(atob("iUUwUBqoA/AAVUgBGCJwMFqEQn/woEBnkAgkAiEFqtAA")),
    require("heatshrink").decompress(atob("iUTwUBqoA/AAVBoEUitUiEAoNVoEFgEVqsAqEFqA")),
    require("heatshrink").decompress(atob("iUVwUBqoAZ+oDC/4DCr4Ia/4AD+ABC//AgE/BggAM+A="))
  ],
  'nose': [
    require("heatshrink").decompress(atob("iUOwUBqoAtooDCqIIDioDCqgCBA=")),
    require("heatshrink").decompress(atob("iUOwUBqoA1qlRAgVQAQI")),
    require("heatshrink").decompress(atob("iUOwUBqoAxqIEDgoDCqACBA=")),
    require("heatshrink").decompress(atob("iUOwUBqoAoqAEDgoIGqg4DoEVqo=")),
    require("heatshrink").decompress(atob("iUMwUBqoAtgoDCqACBA=")),
    require("heatshrink").decompress(atob("iUMwUBqoAxqACBA="))
  ],
  'hair': [
    require("heatshrink").decompress(atob("iUHwUBCyVVqtQgEQitAoEFBANVgA")),
    require("heatshrink").decompress(atob("iUGwUBqtUAQIABoEVAYIIIqsFAQNQitAqoA=")),
    require("heatshrink").decompress(atob("iURwUBCR0VoADBqtVqEAqAIBqEFBANVBgQNBBCsBAYVUioECoIIHoAA=")),
    require("heatshrink").decompress(atob("iUVwUBCR0VoADBqtVqEAqAIBqEFBANVBgQNBBBEVAgVBAYVUBCIjEBoQ/BHwYAIA")),
    require("heatshrink").decompress(atob("iUGwUBBpNUgNQgEVqFVoEBqtVqkAqEVoFQA=")),
    require("heatshrink").decompress(atob("iUHwUBgtVAAMAioDBoAECAYINCAYYEBqEVoACBBAVAA=")),
    require("heatshrink").decompress(atob("iUVwUBCJtUgEBqEFqoABgFQitABAoDCqkVAgVBBA8BAYQaEoARDBAYaIBAY4BGo4jEA=")),
    require("heatshrink").decompress(atob("iUNwUBCJsFoADBgNVqtUgEQitAoEFBANVgADCqAIRioECoA=")),
    require("heatshrink").decompress(atob("iUVwUBCR0FAYdVAYMBqtUAYQEBAYQEBioECoIInHoIABgANCoEAAYNQgAA==")),
    require("heatshrink").decompress(atob("iUVwUBDzUVqoABoIDCqgIsgoECHQdAgADBqEAA==")),
    require("heatshrink").decompress(atob("iUHwUBBhEEiFBgsAqNFilQgtVAAMAqEVoAIF")),
    require("heatshrink").decompress(atob("iUPwUBCqP/AAPwh4EC4FVAAUFAYVQBClU+oECp4RDgA="))
  ],
  'eyes': [
    require("heatshrink").decompress(atob("iUMwUBqoAev/VAINXhoBBqtw6oBBq/9AIIVE")),
    require("heatshrink").decompress(atob("iUMwUBqoAer/Vv9Vq/9AINVvkVofVq/Bqk9CogA=")),
    require("heatshrink").decompress(atob("iUMwUBqoAeq/VvoEB/tX+tVuHVAINXhoBBCogA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAer/VofVq/9qk9qt8it/BAPBq/1CogA=")),
    require("heatshrink").decompress(atob("iUMwUBqoAeq/VvoEB/tX+tVvkVofVq/Bqk9CogA=")),
    require("heatshrink").decompress(atob("iUMwUBqoAeq/VvoEB/tX+tVvkVAINX4IBBCogA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAeq/VvoEB/tX+tVofVAINUnoBBCogA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAer/Vv9Vq/9AINVofVAINUnoBBCogA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAer/Vv9Vq/9AINVvkVAINX4IBBCogA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAer/Vv9Vq/9AINVuHVAINXhoBBCogA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAevkVAINX4IBBqt/6oBBqv9AIQAD")),
    require("heatshrink").decompress(atob("iUMwUBqoAeofVAINUnoBBqt/6oBBq/1AIIVE")),
    require("heatshrink").decompress(atob("iUMwUBqoAeuHVAINXhoBBqt/6oBBqv9q/1CogA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAeqfVvlVqn9q/xqsw6tw4tXhoBBCogA=")),
    require("heatshrink").decompress(atob("iUMwUBqoAep/Vv8Vqf9q/8qt8ioBBq/BAIIVEA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAep/Vv8Vqf9q/8qtD6oBBqk9AIIVEA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAeuEVAINXgIBBBAv9AIIVEA=")),
    require("heatshrink").decompress(atob("iUMwUBqoAev/VAINXgIBBqtwioBBBAgADA==")),
    require("heatshrink").decompress(atob("iUMwUBqoAeoEVAIIrDgoIDqkBAIIVEA=")),
    require("heatshrink").decompress(atob("iULwUBqoAeqEVoFVqkBAINVoAIBitUgtVgNQ")),
    require("heatshrink").decompress(atob("iULwUBqoAeqABCqsFAIVAioBBqkBAINQ")),
    require("heatshrink").decompress(atob("iULwUBqoAeoEVAINU+IBBqtPioBBqkBAINQA")),
    require("heatshrink").decompress(atob("iULwUBqoAevtVq/Vq/1qv9qtw6oBBq8NAINQ")),
    require("heatshrink").decompress(atob("iUVwUBqoAeoEFgEVFYcFBAdVgNUgowfABlQA")),
    require("heatshrink").decompress(atob("iUVwUBqoAev/VAIMDhgBBgtw6oBBq/9AIIwfABlQ")),
    require("heatshrink").decompress(atob("iUMwUBqoAnosVAINVgoBCAAY")), // closed
    require("heatshrink").decompress(atob("iUMwUBqoAjgoBCosVAIIQIA=")) // scared
  ]
};

// Load settings
exports.settings = Object.assign({
  eyesNum: Math.floor(Math.random() * exports.maxEyes),
  noseNum: Math.floor(Math.random() * exports.maxNose),
  hairNum: Math.floor(Math.random() * exports.maxHair),
  mouthNum: Math.floor(Math.random() * exports.maxMouth),
  eyesColour: '#00f',
  hairColour: '#000',
  faceColour: '#fa0',
  mouthColour: '#000',
  noseColour: '#000',
  digitalClock: 'off',
  digitalPosition: "bottom",
  analogClock: 'on',
  analogColour: '#fff',
  showWidgets: 'off',
  btStatusEyes: true
}, require('Storage').readJSON(exports.settingsFile, true) || {});

// Draw a facial feature
let drawFeature = function drawFeature(feature, colour, lr) {
  faceCanvas.setColor(1, 1, 1); // fg is white of eyes
  faceCanvas.setBgColor(colour); // bg is feature colour
  if (lr == 'l') { // Only draw left side (for scared/peeking eyes)
    faceCanvas.setClipRect(0, 0, (exports.faceW/2)-1, exports.faceH-1);
  } else if (lr == 'r') { // Only draw right side (for scared/peeking eyes)
    faceCanvas.setClipRect(9, 0, exports.faceW-1, exports.faceH-1);
  }
  faceCanvas.drawImage(feature);
};

exports.drawFace = function(scale, eyesNum, mouthNum, peek, offset) {
  if (faceCanvas == undefined) {
    faceCanvas = Graphics.createArrayBuffer(exports.faceW, exports.faceH, 8, {msb:true});
    faceCanvas.transparent = 0;
  }

  // Face background
  faceCanvas.setClipRect(0, 0, exports.faceW-1, exports.faceH-1);
  faceCanvas.setColor(exports.settings.faceColour);
  faceCanvas.fillRect(0, 0, exports.faceW, exports.faceH);

  // Face features
  drawFeature(features.mouth[mouthNum ? mouthNum : exports.settings.mouthNum], exports.settings.mouthColour);
  drawFeature(features.nose[exports.settings.noseNum], exports.settings.noseColour);
  drawFeature(features.hair[exports.settings.hairNum], exports.settings.hairColour);
  if (peek) {
    drawFeature(features.eyes[eyesNum], exports.settings.eyesColour, 'l'); // Left eye still closed
    drawFeature(features.eyes[exports.settings.eyesNum], exports.settings.eyesColour, 'r'); // Right eye normal
  } else {
    drawFeature(features.eyes[eyesNum ? eyesNum : exports.settings.eyesNum], exports.settings.eyesColour);
  }

  // Draw face
  let xOffset = (g.getWidth() - (exports.faceW * scale)) / 2;
  let yOffset = (offset ? offset : 0) + ((g.getHeight() - (exports.faceH * scale)) / 2);
  g.setBgColor(0, 0, 0);
  g.clearRect(Bangle.appRect);
  g.setClipRect(Bangle.appRect.x, Bangle.appRect.y, Bangle.appRect.x2, Bangle.appRect.y2);

  g.drawImage(faceCanvas, xOffset, yOffset, {scale: scale});
};