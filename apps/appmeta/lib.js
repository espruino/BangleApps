exports.getAppIcon = function(msg) {
    /*
    * icons should be 24x24px with 1bpp colors and 'Transparency to Color'
    * http://www.espruino.com/Image+Converter
    */
    if (msg.img) return atob(msg.img);
    var s = (msg.src||"").toLowerCase();
    if (s=="alarm" || s =="alarmclockreceiver") return atob("GBjBAP////8AAAAAAAACAEAHAOAefng5/5wTgcgHAOAOGHAMGDAYGBgYGBgYGBgYGBgYDhgYBxgMATAOAHAHAOADgcAB/4AAfgAAAAAAAAA=");
    if (s=="bibel") return atob("GBgBAAAAA//wD//4D//4H//4H/f4H/f4H+P4H4D4H4D4H/f4H/f4H/f4H/f4H/f4H//4H//4H//4GAAAEAAAEAAACAAAB//4AAAA");
    if (s=="calendar") return atob("GBiBAAAAAAAAAAAAAA//8B//+BgAGBgAGBgAGB//+B//+B//+B9m2B//+B//+Btm2B//+B//+Btm+B//+B//+A//8AAAAAAAAAAAAA==");
    if (s=="corona-warn") return atob("GBgBAAAAABwAAP+AAf/gA//wB/PwD/PgDzvAHzuAP8EAP8AAPAAAPMAAP8AAH8AAHzsADzuAB/PAB/PgA//wAP/gAH+AAAwAAAAA");
    if (s=="discord") return atob("GBgBAAAAAAAAAAAAAIEABwDgDP8wH//4H//4P//8P//8P//8Pjx8fhh+fzz+f//+f//+e//ePH48HwD4AgBAAAAAAAAAAAAAAAAA");
    if (s=="facebook" || s=="messenger") return atob("GBiBAAAAAAAAAAAYAAD/AAP/wAf/4A/48A/g8B/g+B/j+B/n+D/n/D8A/B8A+B+B+B/n+A/n8A/n8Afn4APnwADnAAAAAAAAAAAAAA==");
    if (s=="google home") return atob("GBiCAAAAAAAAAAAAAAAAAAAAAoAAAAAACqAAAAAAKqwAAAAAqroAAAACquqAAAAKq+qgAAAqr/qoAACqv/6qAAKq//+qgA6r///qsAqr///6sAqv///6sAqv///6sAqv///6sA6v///6sA6v///qsA6qqqqqsA6qqqqqsA6qqqqqsAP7///vwAAAAAAAAAAAAAAAAA==");
    if (s=="hangouts") return atob("FBaBAAH4AH/gD/8B//g//8P//H5n58Y+fGPnxj5+d+fmfj//4//8H//B//gH/4A/8AA+AAHAABgAAAA=");
    if (s=="home assistant") return atob("FhaBAAAAAADAAAeAAD8AAf4AD/3AfP8D7fwft/D/P8ec572zbzbNsOEhw+AfD8D8P4fw/z/D/P8P8/w/z/AAAAA=");
    if (s=="instagram") return atob("GBiBAAAAAAAAAAAAAAAAAAP/wAYAYAwAMAgAkAh+EAjDEAiBEAiBEAiBEAiBEAjDEAh+EAgAEAwAMAYAYAP/wAAAAAAAAAAAAAAAAA==");
    if (s=="kalender") return atob("GBgBBgBgBQCgff++RQCiRgBiQAACf//+QAACQAACR//iRJkiRIEiR//iRNsiRIEiRJkiR//iRIEiRIEiR//iQAACQAACf//+AAAA");
    if (s=="lieferando") return atob("GBgBABgAAH5wAP9wAf/4A//4B//4D//4H//4P/88fV8+fV4//V4//Vw/HVw4HVw4HBg4HBg4HBg4HDg4Hjw4Hj84Hj44Hj44Hj44");
    if (s=="nina") return atob("GBgBAAAABAAQCAAICAAIEAAEEgAkJAgSJBwSKRxKSj4pUn8lVP+VVP+VUgAlSgApKQBKJAASJAASEgAkEAAECAAICAAIBAAQAAAA");
    if (s=="outlook mail") return atob("HBwBAAAAAAAAAAAIAAAfwAAP/gAB/+AAP/5/A//v/D/+/8P/7/g+Pv8Dye/gPd74w5znHDnOB8Oc4Pw8nv/Dwe/8Pj7/w//v/D/+/8P/7/gf/gAA/+AAAfwAAACAAAAAAAAAAAA=");
    if (s=="phone") return atob("FxeBABgAAPgAAfAAB/AAD+AAH+AAP8AAP4AAfgAA/AAA+AAA+AAA+AAB+AAB+AAB+OAB//AB//gB//gA//AA/8AAf4AAPAA=");
    if (s=="post & dhl") return atob("GBgBAPgAE/5wMwZ8NgN8NgP4NgP4HgP4HgPwDwfgD//AB/+AAf8AAAAABs7AHcdgG4MwAAAAGESAFESAEkSAEnyAEkSAFESAGETw");
    if (s=="signal") return atob("GBgBAAAAAGwAAQGAAhggCP8QE//AB//oJ//kL//wD//0D//wT//wD//wL//0J//kB//oA//ICf8ABfxgBYBAADoABMAABAAAAAAA");
    if (s=="skype") return atob("GhoBB8AAB//AA//+Af//wH//+D///w/8D+P8Afz/DD8/j4/H4fP5/A/+f4B/n/gP5//B+fj8fj4/H8+DB/PwA/x/A/8P///B///gP//4B//8AD/+AAA+AA==");
    if (s=="slack") return atob("GBiBAAAAAAAAAABAAAHvAAHvAADvAAAPAB/PMB/veD/veB/mcAAAABzH8B3v+B3v+B3n8AHgAAHuAAHvAAHvAADGAAAAAAAAAAAAAA==");
    if (s=="snapchat") return atob("GBgBAAAAAAAAAH4AAf+AAf+AA//AA//AA//AA//AA//AH//4D//wB//gA//AB//gD//wH//4f//+P//8D//wAf+AAH4AAAAAAAAA");
    if (s=="teams") return atob("GBgBAAAAAAAAAAQAAB4AAD8IAA8cP/M+f/scf/gIeDgAfvvefvvffvvffvvffvvff/vff/veP/PeAA/cAH/AAD+AAD8AAAQAAAAA");
    if (s=="telegram" || s=="telegram foss") return atob("GBiBAAAAAAAAAAAAAAAAAwAAHwAA/wAD/wAf3gD/Pgf+fh/4/v/z/P/H/D8P/Acf/AM//AF/+AF/+AH/+ADz+ADh+ADAcAAAMAAAAA==");
    if (s=="threema") return atob("GBjB/4Yx//8AAAAAAAAAAAAAfgAB/4AD/8AH/+AH/+AP//AP2/APw/APw/AHw+AH/+AH/8AH/4AH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
    if (s=="to do") return atob("GBgBAAAAAAAAAAAwAAB4AAD8AAH+AAP/DAf/Hg//Px/+f7/8///4///wf//gP//AH/+AD/8AB/4AA/wAAfgAAPAAAGAAAAAAAAAA");
    if (s=="twitch") return atob("GBgBH//+P//+P//+eAAGeAAGeAAGeDGGeDOGeDOGeDOGeDOGeDOGeDOGeAAOeAAOeAAcf4/4f5/wf7/gf//Af/+AA/AAA+AAAcAA");
    if (s=="twitter") return atob("GhYBAABgAAB+JgA/8cAf/ngH/5+B/8P8f+D///h///4f//+D///g///wD//8B//+AP//gD//wAP/8AB/+AB/+AH//AAf/AAAYAAA");
    if (s=="whatsapp") return atob("GBiBAAB+AAP/wAf/4A//8B//+D///H9//n5//nw//vw///x///5///4///8e//+EP3/APn/wPn/+/j///H//+H//8H//4H//wMB+AA==");
    if (s=="wordfeud") return atob("GBgCWqqqqqqlf//////9v//////+v/////++v/////++v8///Lu+v8///L++v8///P/+v8v//P/+v9v//P/+v+fx/P/+v+Pk+P/+v/PN+f/+v/POuv/+v/Ofdv/+v/NvM//+v/I/Y//+v/k/k//+v/i/w//+v/7/6//+v//////+v//////+f//////9Wqqqqqql");
    if (s=="youtube") return atob("GBgBAAAAAAAAAAAAAAAAAf8AH//4P//4P//8P//8P5/8P4/8f4P8f4P8P4/8P5/8P//8P//8P//4H//4Af8AAAAAAAAAAAAAAAAA");
    if (msg.id=="music") return atob("FhaBAH//+/////////////h/+AH/4Af/gB/+H3/7/f/v9/+/3/7+f/vB/w8H+Dwf4PD/x/////////////3//+A=");
    // if (s=="sms message" || s=="mail" || s=="gmail") // .. default icon (below)
    return atob("HBKBAD///8H///iP//8cf//j4//8f5//j/x/8//j/H//H4//4PB//EYj/44HH/Hw+P4//8fH//44///xH///g////A==");
};

exports.getAppColor = function(msg,def) {
    return {
        // generic colors, using B2-safe colors
        "alarm": "#fff",
        "mail": "#ff0",
        "music": "#f0f",
        "phone": "#0f0",
        "sms message": "#0ff",
        // brands, according to https://www.schemecolor.com/?s (picking one for multicolored logos)
        // all dithered on B2, but we only use the color for the icons.  (Could maybe pick the closest 3-bit color for B2?)
        "bibel": "#54342c",
        "discord": "#738adb",
        "facebook": "#4267b2",
        "gmail": "#ea4335",
        "google home": "#fbbc05",
        "hangouts": "#1ba261",
        "home assistant": "#fff", // ha-blue is #41bdf5, but that's the background
        "instagram": "#dd2a7b",
        "liferando": "#ee5c00",
        "messenger": "#0078ff",
        "nina": "#e57004",
        "outlook mail": "#0072c6",
        "post & dhl": "#f2c101",
        "signal": "#00f",
        "skype": "#00aff0",
        "slack": "#e51670",
        "snapchat": "#ff0",
        "teams": "#464eb8",
        "telegram": "#0088cc",
        "telegram foss": "#0088cc",
        "threema": "#000",
        "to do": "#3999e5",
        "twitch": "#6441A4",
        "twitter": "#1da1f2",
        "whatsapp": "#4fce5d",
        "wordfeud": "#e7d3c7",
        "youtube": "#f00",
    }[(msg.src||"").toLowerCase()]||(def !== undefined?def:g.theme.fg);
};

exports.getIosAppTitle = function(msg) {
    return {
        "com.apple.facetime": "FaceTime",
        "com.apple.mobilecal": "Calendar",
        "com.apple.mobilemail": "Mail",
        "com.apple.mobilephone": "Phone",
        "com.apple.mobileslideshow": "Pictures",
        "com.apple.MobileSMS": "SMS Message",
        "com.apple.Passbook": "iOS Wallet",
        "com.apple.podcasts": "Podcasts",
        "com.apple.reminders": "Reminders",
        "com.apple.shortcuts": "Shortcuts",
        "com.atebits.Tweetie2": "Twitter",
        "com.burbn.instagram" : "Instagram",
        "com.facebook.Facebook": "Facebook",
        "com.facebook.Messenger": "Messenger",
        "com.google.Chromecast" : "Google Home",
        "com.google.Gmail" : "GMail",
        "com.google.hangouts" : "Hangouts",
        "com.google.ios.youtube" : "YouTube",
        "com.hammerandchisel.discord" : "Discord",
        "com.ifttt.ifttt" : "IFTTT",
        "com.jumbo.app" : "Jumbo",
        "com.linkedin.LinkedIn" : "LinkedIn",
        "com.marktplaats.iphone": "Marktplaats",
        "com.microsoft.Office.Outlook" : "Outlook Mail",
        "com.nestlabs.jasper.release" : "Nest",
        "com.netflix.Netflix" : "Netflix",
        "com.reddit.Reddit" : "Reddit",
        "com.skype.skype": "Skype",
        "com.skype.SkypeForiPad": "Skype",
        "com.spotify.client": "Spotify",
        "com.storytel.iphone": "Storytel",
        "com.strava.stravaride": "Strava",
        "com.tinyspeck.chatlyio": "Slack",
        "com.toyopagroup.picaboo": "Snapchat",
        "com.ubercab.UberClient": "Uber",
        "com.ubercab.UberEats": "UberEats",
        "com.vilcsak.bitcoin2": "Coinbase",
        "com.wordfeud.free": "WordFeud",
        "com.zhiliaoapp.musically": "TikTok",
        "io.robbie.HomeAssistant": "Home Assistant",
        "net.weks.prowl": "Prowl",
        "net.whatsapp.WhatsApp": "WhatsApp",
        "net.superblock.Pushover": "Pushover",
        "nl.ah.Appie": "Albert Heijn",
        "nl.postnl.TrackNTrace": "PostNL",
        "org.whispersystems.signal": "Signal",
        "ph.telegra.Telegraph": "Telegram",
        "tv.twitch": "Twitch",
    }[msg.appId]||msg.appId;
};
