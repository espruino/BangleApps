// This file is auto-generated - DO NOT MODIFY
// If you want to add icons, change icons/icon_names.json and re-run icons/generate.js
exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ",default|0,adp|1,airbnb|2,agenda|3,alarm|4,alarmclockreceiver|4,amazon shopping|5,bereal.|6,bibel|7,bitwarden|8,1password|8,lastpass|8,dashlane|8,bring|9,calendar|10,etar|10,chat|11,chrome|12,clock|4,corona-warn|13,bmo|14,desjardins|14,duolingo|15,rbc mobile|14,nbc|14,rabobank|14,scotiabank|14,td (canada)|14,davx⁵|16,discord|17,drive|18,element|19,element classic|19,element x|19,facebook|20,messenger|21,firefox|22,firefox beta|22,firefox nightly|22,f-droid|8,neo store|8,aurora droid|8,github|23,gitlab|24,gmail|25,gmx|26,google|27,google home|28,google play store|29,gotify|30,home assistant|31,instagram|32,jira|33,kalender|34,keep notes|35,kleinanzeigen|36,leboncoin|37,lieferando|38,linkedin|39,maps|40,meshtastic|41,organic maps|40,osmand|40,mastodon|42,fedilab|42,tooot|42,tusky|42,mattermost|43,messages|44,n26|45,netflix|46,news|47,cbc news|47,rc info|47,reuters|47,ap news|47,la presse|47,nbc news|47,nextbike|48,nextcloud|49,nina|50,ntfy|51,outlook mail|52,paypal|53,phone|54,plex|55,pocket|56,post & dhl|57,proton mail|58,reddit|59,sync pro|59,sync dev|59,boost|59,infinity|59,slide|59,signal|60,molly|60,roborock|61,skype|62,slack|63,snapchat|64,shortcuts|65,starbucks|66,steam|67,teams|68,telegram|69,telegram foss|69,threema|70,threema libre|70,thunderbird|71,tiktok|72,to do|73,opentasks|73,tasks|73,transit|74,twitch|75,twitter|76,uber|77,lyft|77,vlc|78,warnapp|79,whatsapp|80,wordfeud|81,youtube|82,newpipe|82,zoom|83,meet|83,music|84,sms message|0,mail|0,".match(new RegExp(`,${s}\\|(\\d+)`))
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
    "adp": "#f00",
    "airbnb": "#ff385c", // https://news.airbnb.com/media-assets/category/brand/
    "mail": "#ff0",
    "music": "#f0f",
    "phone": "#0f0",
    "duolingo": "#58cc02", // https://design.duolingo.com/identity/color#core-brand-colors 
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
    "roborock": "#f00",
    "signal": "#3a76f0", // https://github.com/signalapp/Signal-Desktop/blob/main/images/signal-logo.svg
    "skype": "#0078d4", // https://developer.microsoft.com/en-us/fluentui#/styles/web/colors/products
    "slack": "#e51670",
    "snapchat": "#ff0",
    "shortcuts": "#cc00ff",
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
  