g.clear().flip();
var imgbat = require("heatshrink").decompress(atob("nlWhH+AH4A/AH4AHwoAQHXQ8pHf47rF6YAXHXQ8OHVo8NHf47/Hf47/Hf47/Hf47/Hf47/Hf47r1I766Y756Z351I766ayTHco6BHfCxBHfI6CdyY7jHQQ73WIayUHcQ6DHew6EHeqxEdyo7gOwo70HQqyVHbyxFHeo6GHeY6Hdyo7cWI47zHQ6yWHbY6IHeKxIABa9MHbI6TQJo7YHUI7YWMKzbQKQYOHdYYPHcK9IWJw7sDKA7hHTA7pWKA7qDKQ7gdwwaTHcyxSHcR2ZHcwZUHcqxUHcLuEHSo7kHSw7gWLI7kHS47iHTA7fdwKxYHcQ6ZHb46bO8A76ADg7/Hf47/Hf47/Hf47/Hf47/Hf47/HbY8uHRg8tHRwA/AH4AsA=="));
var imgbubble = require("heatshrink").decompress(atob("ikQhH+AAc0AAgKEAAwRFCpgMDnVerwULCIuCCYoUGCQQQBnQ9MA4Q3GChI5DEpATIJYISKCY46LCYwANCa4UObJ7INeCoSOCpAOI"));

 var W=240,H=240;
var bubbles = [];
for (var i=0;i<10;i++) {
  bubbles.push({y:Math.random()*H,ly:0,x:(0.5+(i<5?i:i+8))*W/18,v:0.6+Math.random(),s:0.5+Math.random()});
}

function anim() {
  /* we don't use any kind of buffering here. Just draw one image
  at a time (image contains a background) too, and there is minimal
  flicker. */  
  var mx = 120, my = 120;
  bubbles.forEach(f=>{
    f.y-=f.v;if (f.y<-24) f.y=H+8;
    g.drawImage(imgbubble,f.y,f.x,{scale:f.s});
  });
  g.drawImage(imgbat, mx,my,{rotate:Math.sin(getTime()*2)*0.5-Math.PI/2});
  g.flip();
}

setInterval(anim,20);

Bangle.on("charging", isCharging => {
  if (!isCharging) load();
});
