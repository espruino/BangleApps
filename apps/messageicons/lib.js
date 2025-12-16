// This file is auto-generated - DO NOT MODIFY
// If you want to add icons, change icons/icon_names.json and re-run icons/generate.js
exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ",default|0,airbnb|1,agenda|2,alarm|3,alarmclockreceiver|3,amazon shopping|4,bereal.|5,bibel|6,bitwarden|7,1password|7,lastpass|7,dashlane|7,bring|8,calendar|9,etar|9,chat|10,chrome|11,clock|3,corona-warn|12,bmo|13,desjardins|13,rbc mobile|13,nbc|13,rabobank|13,scotiabank|13,td (canada)|13,davx⁵|14,discord|15,drive|16,element|17,element classic|17,element x|17,facebook|18,messenger|19,firefox|20,firefox beta|20,firefox nightly|20,f-droid|7,neo store|7,aurora droid|7,github|21,gitlab|22,gmail|23,gmx|24,google|25,google home|26,google play store|27,gotify|28,home assistant|29,instagram|30,jira|31,kalender|32,keep notes|33,kleinanzeigen|34,leboncoin|35,lieferando|36,linkedin|37,maps|38,meshtastic|39,organic maps|38,osmand|38,mastodon|40,fedilab|40,tooot|40,tusky|40,mattermost|41,messages|42,n26|43,netflix|44,news|45,cbc news|45,rc info|45,reuters|45,ap news|45,la presse|45,nbc news|45,nextbike|46,nextcloud|47,nina|48,outlook mail|49,paypal|50,phone|51,plex|52,pocket|53,post & dhl|54,proton mail|55,reddit|56,sync pro|56,sync dev|56,boost|56,infinity|56,slide|56,signal|57,molly|57,skype|58,slack|59,snapchat|60,starbucks|61,steam|62,teams|63,telegram|64,telegram foss|64,threema|65,threema libre|65,thunderbird|66,tiktok|67,to do|68,opentasks|68,tasks|68,transit|69,twitch|70,twitter|71,uber|72,lyft|72,vlc|73,warnapp|74,whatsapp|75,wordfeud|76,youtube|77,newpipe|77,zoom|78,meet|78,music|79,sms message|0,mail|0,".match(new RegExp(`,${s}\\|(\\d+)`))
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
  