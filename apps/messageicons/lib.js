// This file is auto-generated - DO NOT MODIFY
// If you want to add icons, change icons/icon_names.json and re-run icons/generate.js
exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ",default|0,adp|1,airbnb|2,agenda|3,alarm|4,alarmclockreceiver|4,amazon shopping|5,bereal.|6,bibel|7,bitwarden|8,1password|8,lastpass|8,dashlane|8,bring|9,calendar|10,etar|10,chat|11,chrome|12,clock|4,corona-warn|13,bmo|14,desjardins|14,rbc mobile|14,nbc|14,rabobank|14,scotiabank|14,td (canada)|14,davx⁵|15,discord|16,drive|17,element|18,element classic|18,element x|18,facebook|19,messenger|20,firefox|21,firefox beta|21,firefox nightly|21,f-droid|8,neo store|8,aurora droid|8,github|22,gitlab|23,gmail|24,gmx|25,google|26,google home|27,google play store|28,gotify|29,home assistant|30,instagram|31,jira|32,kalender|33,keep notes|34,kleinanzeigen|35,leboncoin|36,lieferando|37,linkedin|38,maps|39,meshtastic|40,organic maps|39,osmand|39,mastodon|41,fedilab|41,tooot|41,tusky|41,mattermost|42,messages|43,n26|44,netflix|45,news|46,cbc news|46,rc info|46,reuters|46,ap news|46,la presse|46,nbc news|46,nextbike|47,nextcloud|48,nina|49,ntfy|50,outlook mail|51,paypal|52,phone|53,plex|54,pocket|55,post & dhl|56,proton mail|57,reddit|58,sync pro|58,sync dev|58,boost|58,infinity|58,slide|58,signal|59,molly|59,roborock|60,skype|61,slack|62,snapchat|63,shortcuts|64,starbucks|65,steam|66,teams|67,telegram|68,telegram foss|68,threema|69,threema libre|69,thunderbird|70,tiktok|71,to do|72,opentasks|72,tasks|72,transit|73,twitch|74,twitter|75,uber|76,lyft|76,vlc|77,warnapp|78,whatsapp|79,wordfeud|80,youtube|81,newpipe|81,zoom|82,meet|82,music|83,sms message|0,mail|0,".match(new RegExp(`,${s}\\|(\\d+)`))
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
  