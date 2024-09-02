// This file is auto-generated - DO NOT MODIFY
// If you want to add icons, change icons/icon_names.json and re-run icons/generate.js
exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ",default|0,airbnb|1,agenda|2,alarm|3,alarmclockreceiver|3,amazon shopping|4,bibel|5,bitwarden|6,1password|6,lastpass|6,dashlane|6,bring|7,calendar|8,etar|8,chat|9,chrome|10,clock|3,corona-warn|11,bmo|12,desjardins|12,rbc mobile|12,nbc|12,rabobank|12,scotiabank|12,td (canada)|12,discord|13,drive|14,element|15,facebook|16,messenger|17,firefox|18,firefox beta|18,firefox nightly|18,f-droid|6,neo store|6,aurora droid|6,github|19,gitlab|20,gmail|21,gmx|22,google|23,google home|24,google play store|25,home assistant|26,instagram|27,jira|28,kalender|29,keep notes|30,leboncoin|31,lieferando|32,linkedin|33,maps|34,organic maps|34,osmand|34,mastodon|35,fedilab|35,tooot|35,tusky|35,mattermost|36,messages|37,n26|38,netflix|39,news|40,cbc news|40,rc info|40,reuters|40,ap news|40,la presse|40,nbc news|40,nextbike|41,nina|42,outlook mail|43,paypal|44,phone|45,plex|46,pocket|47,post & dhl|48,proton mail|49,reddit|50,sync pro|50,sync dev|50,boost|50,infinity|50,slide|50,signal|51,molly|51,skype|52,slack|53,snapchat|54,starbucks|55,steam|56,teams|57,telegram|58,telegram foss|58,threema|59,threema libre|59,tiktok|60,to do|61,opentasks|61,tasks|61,transit|62,twitch|63,twitter|64,uber|65,lyft|65,vlc|66,warnapp|67,whatsapp|68,wordfeud|69,youtube|70,newpipe|70,zoom|71,meet|71,music|72,sms message|0,mail|0,".match(new RegExp(`,${s}\\|(\\d+)`))
  return require("Storage").read("messageicons.img", (match===null)?0:match[1]*76, 76);
};

exports.getColor = function(msg,options) {
  options = options||{};
  var st = options.settings || require('Storage').readJSON("messages.settings.json", 1) || {};
  if (options.default===undefined) options.default=g.theme.fg;
  if (st.iconColorMode == 'mono') return options.default;
  const s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  return {
    /* generic colors, using B2-safe colors */ 
    "agenda": "#206cd5",
    "airbnb": "#ff385c", // https://news.airbnb.com/media-assets/category/brand/
    "mail": "#ff0",
    "music": "#f0f",
    "phone": "#0f0",
    "sms message": "#0ff", 
    "bibel": "#54342c",
    "bring": "#455a64",
    "discord": "#5865f2", // https://discord.com/branding
    "etar": "#36a18b",
    "facebook": "#1877f2", // https://www.facebook.com/brand/resources/facebookapp/logo
    "gmail": "#ea4335",
    "gmx": "#1c449b",
    "google": "#4285F4",
    "google home": "#fbbc05",
// "home assistant": "#41bdf5", // ha-blue is #41bdf5, but that's the background
    "instagram": "#ff0069", // https://about.instagram.com/brand/gradient
    "jira": "#0052cc", //https://atlassian.design/resources/logo-library
    "leboncoin": "#fa7321",
    "lieferando": "#ff8000",
    "linkedin": "#0a66c2", // https://brand.linkedin.com/
    "messages": "#0a5cce",
    "messenger": "#0078ff",
    "mastodon": "#563acc", // https://www.joinmastodon.org/branding
    "mattermost": "#00f",
    "n26": "#36a18b",
    "nextbike": "#00f",
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
    "to do": "#3999e5",
    "twitch": "#9146ff", // https://brand.twitch.tv/
    "twitter": "#1d9bf0", // https://about.twitter.com/en/who-we-are/brand-toolkit
    "vlc": "#ff8800",
    "whatsapp": "#4fce5d",
    "wordfeud": "#e7d3c7",
    "youtube": "#f00", // https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors
  }[s]||options.default;
};
  