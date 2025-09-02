// This file is auto-generated - DO NOT MODIFY
// If you want to add icons, change icons/icon_names.json and re-run icons/generate.js
exports.getImage = function(msg) {
  if (msg.img) return atob(msg.img);
  let s = (("string"=== typeof msg) ? msg : (msg.src || "")).toLowerCase();
  if (msg.id=="music") s="music";
  let match = ",default|0,airbnb|1,agenda|2,alarm|3,alarmclockreceiver|3,amazon shopping|4,bereal.|5,bibel|6,bitwarden|7,1password|7,lastpass|7,dashlane|7,bring|8,calendar|9,etar|9,chat|10,chrome|11,clock|3,corona-warn|12,bmo|13,desjardins|13,rbc mobile|13,nbc|13,rabobank|13,scotiabank|13,td (canada)|13,davx⁵|14,discord|15,drive|16,element|17,element x|17,facebook|18,messenger|19,firefox|20,firefox beta|20,firefox nightly|20,f-droid|7,neo store|7,aurora droid|7,github|21,gitlab|22,gmail|23,gmx|24,google|25,google home|26,google play store|27,home assistant|28,instagram|29,jira|30,kalender|31,keep notes|32,kleinanzeigen|33,leboncoin|34,lieferando|35,linkedin|36,maps|37,organic maps|37,osmand|37,mastodon|38,fedilab|38,tooot|38,tusky|38,mattermost|39,messages|40,n26|41,netflix|42,news|43,cbc news|43,rc info|43,reuters|43,ap news|43,la presse|43,nbc news|43,nextbike|44,nextcloud|45,nina|46,outlook mail|47,paypal|48,phone|49,plex|50,pocket|51,post & dhl|52,proton mail|53,reddit|54,sync pro|54,sync dev|54,boost|54,infinity|54,slide|54,signal|55,molly|55,skype|56,slack|57,snapchat|58,starbucks|59,steam|60,teams|61,telegram|62,telegram foss|62,threema|63,threema libre|63,thunderbird|64,tiktok|65,to do|66,opentasks|66,tasks|66,transit|67,twitch|68,twitter|69,uber|70,lyft|70,vlc|71,warnapp|72,whatsapp|73,wordfeud|74,youtube|75,newpipe|75,zoom|76,meet|76,music|77,sms message|0,mail|0,".match(new RegExp(`,${s}\\|(\\d+)`))
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
  