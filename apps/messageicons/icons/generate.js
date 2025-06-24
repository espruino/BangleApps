#!/usr/bin/node

// Creates lib.js from icons
// npm install png-js

// default icon must come first in icon_names

/* eslint-env node */

var imageconverter = require("../../../webtools/imageconverter.js");
var icons = JSON.parse(require("fs").readFileSync(__dirname+"/icon_names.json"));
const imgOptions = {
  mode : "1bit",
  inverted : true,
  transparent : true,
  output: "raw"
};
var PNG = require('png-js');
var IMAGE_BYTES = 76;

var iconImages = []; // array of converted icons
var iconIndices = {}; // maps filename -> index in iconImages

var promises = [];

icons.forEach(icon => {
  var index = iconIndices[icon.icon];
  if (index===undefined) { // need a new icon
    index = iconImages.length;
    iconIndices[icon.icon] = index;
    iconImages.push(""); // placeholder
    // create image
    console.log("Loading "+icon.icon);
    var png = new PNG(require("fs").readFileSync(__dirname+"/"+icon.icon));
    if (png.width!=24 || png.height!=24) {
      console.warn(icon.icon+" should be 24x24px");
    }

    promises.push(new Promise(r => {
      png.decode(function (pixels) {
        var rgba = new Uint8Array(pixels);
        var isTransparent = false;
        for (var i=0;i<rgba.length;i+=4)
          if (rgba[i+3]<255) isTransparent=true;
        if (!isTransparent) { // make it transparent
          for (var i=0;i<rgba.length;i+=4)
            rgba[i+3] = 255-rgba[i];
        }

        imgOptions.width = png.width;
        imgOptions.height = png.height;
        var img = imageconverter.RGBAtoString(rgba, imgOptions);
        iconImages[index] = img;
        console.log("Loaded "+icon.icon);
        if (img.length != IMAGE_BYTES) throw new Error("Image size should be 76 bytes");
        r(); // done
      });
    }));
    //
  }
  icon.index = index;
});

Promise.all(promises).then(function() {
  // Allocate a big array of icons
  var iconData = new Uint8Array(IMAGE_BYTES * iconImages.length);
  iconImages.forEach((img,idx) => {
    // Yay, more JS. Why is it so hard to get the bytes???
    iconData.set(Array.prototype.slice.call(Buffer.from(img,"binary")), idx*IMAGE_BYTES)
  });

  console.log("Saving images");
  require("fs").writeFileSync(__dirname+"/../icons.img", Buffer.from(iconData,"binary"));

  console.log("Saving library");
  require("fs").writeFileSync(__dirname+"/../lib.js", `// This file is auto-generated - DO NOT MODIFY
// If you want to add icons, change icons/icon_names.json and re-run icons/generate.js
exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ${JSON.stringify(","+icons.map(icon=>icon.app+"|"+icon.index).join(",")+",")}.match(new RegExp(\`,\${s}\\\\|(\\\\d+)\`))
  return require("Storage").read("messageicons.img", (match===null)?0:match[1]*${IMAGE_BYTES}, ${IMAGE_BYTES});
};

exports.getColor = function(msg,options) {
  options = options||{};
  var st = options.settings || require('Storage').readJSON("messages.settings.json", 1) || {};
  if (options.default===undefined) options.default=g.theme.fg;
  if (st.iconColorMode == 'mono') return options.default;
  const s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  return {
    /* generic colors, using B2-safe colors */ ${ /* DO NOT USE BLACK OR WHITE HERE, just leave the declaration out and then the theme's fg color will be used */"" }
    "agenda": "#206cd5",
    "airbnb": "#ff385c", // https://news.airbnb.com/media-assets/category/brand/
    "mail": "#ff0",
    "music": "#f0f",
    "phone": "#0f0",
    "sms message": "#0ff", ${ /*
    brands, according to https://www.schemecolor.com/?s (picking one for multicolored logos)
    all dithered on B2, but we only use the color for the icons.  (Could maybe pick the closest 3-bit color for B2?)
*/""}
    "bibel": "#54342c",
    "bring": "#455a64",
    "davx⁵": "#8bc34a",
    "discord": "#5865f2", // https://discord.com/branding
    "etar": "#36a18b",
    "facebook": "#1877f2", // https://www.facebook.com/brand/resources/facebookapp/logo
    "gmail": "#ea4335",
    "gmx": "#1c449b",
    "google": "#4285F4",
    "google home": "#fbbc05",
// "home assistant": "#41bdf5", // ha-blue is #41bdf5, but that's the background
    "instagram": "#ff0069", // https://about.instagram.com/brand/gradient
    "jira": "#0052cc", // https://atlassian.design/resources/logo-library
    "kleinanzeigen": "#69bd2f", // https://themen.kleinanzeigen.de/medien/mediathek/kleinanzeigen-guideline-nutzung-logo/ 
    "leboncoin": "#fa7321",
    "lieferando": "#ff8000",
    "linkedin": "#0a66c2", // https://brand.linkedin.com/
    "messages": "#0a5cce",
    "messenger": "#0078ff",
    "mastodon": "#563acc", // https://www.joinmastodon.org/branding
    "mattermost": "#00f",
    "n26": "#36a18b",
    "nextbike": "#00f",
    "nextcloud": "#0082c9", // https://nextcloud.com/brand/
    "newpipe": "#f00",
    "nina": "#e57004",
    "opentasks": "#409f8f",
    "outlook mail": "#0078d4", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "paypal": "#003087",
    "pocket": "#ef4154f", // https://blog.getpocket.com/press/
    "post & dhl": "#f2c101",
    "reddit": "#ff4500", // https://www.redditinc.com/brand
    "signal": "#3a76f0", // https://github.com/signalapp/Signal-Desktop/blob/main/images/signal-logo.svg
    "skype": "#0078d4", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "slack": "#e51670",
    "snapchat": "#ff0",
    "steam": "#171a21",
    "teams": "#6264a7", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "telegram": "#0088cc",
    "telegram foss": "#0088cc",
    "thunderbird": "#1582e4",
    "to do": "#3999e5",
    "twitch": "#9146ff", // https://brand.twitch.tv/
    "twitter": "#1d9bf0", // https://about.twitter.com/en/who-we-are/brand-toolkit
    "vlc": "#ff8800",
    "whatsapp": "#4fce5d",
    "wordfeud": "#e7d3c7",
    "youtube": "#f00", // https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors
  }[s]||options.default;
};
  `);
});
