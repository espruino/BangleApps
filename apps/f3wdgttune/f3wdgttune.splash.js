// This file is part of F3 Widget Tuner.
// Copyright 2026 Matt Marjanovic <maddog@mir.com>
// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.

() => {
  Bangle.setUI();

  let s = 20;  // seconds before automatically continuing
  let ms = 33;  // ms delay between frames

  // L1R  Splash screen is divided into 4 regions:
  // L2R   - LL, RR, BBB are static and rendered once;
  // BBB   - "12" alternates between frames 1 and 2
  const frameL = () => /*45x90*/require("heatshrink").decompress(atob("ltagZC/AE1//4AB/EAh4FC//8CAgJD+EAj4GDC4IACgIJD8EAn4GDwAQDgYJD4A4GAAcHF4QAEEYIgEJoQvBLgogFJoQvBFIogFFJBEBQxBKNQwxlDFIqGGEAKnHQwy5EHYyhFGQX+QwwaGHYREEQw5uIQw5uCGQoXFWwQyBMooXFAoQ7BZYgXFKAY7GQwIXDRgjCMX4yGEWwJrEEAyGHIgTsHAH4A/AH4A/ADkD//4gEB///wEAj4IChwQCg//+AUC/4IBn4IBBYcAh//8AUC//AgF/BAILDFIgIBGQX//wLCC4IyEB4IyBI4P8GoQXBGQZTCDosBEAQIDKYQdGAAYICKYQyBKYI1EGQgCBj4yBGoSSDGQhWBn/8DoJ9DQwQyCwILBv/4KYaGEHYQpBEYa8EMon+FIIjB/hTCNAwFBx5iC/A+DCgYFDMQfxHwZoCMoiqEU4aGEGQSqEHwSGFGQSqEBYSGFdIwLDQwoyCWYYLDQwoyCWYYLDd4wLDFgJfDQwo+CWYZfDQwoA/AH4A/AH4A/AD4A="))
  const frameR = () => /*45x90*/require("heatshrink").decompress(atob("ltagZC/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AAsB//8CBsD//4CBsH//wBZE/AgcP//gAoV//4EC/4ABEAYFDnH//wUDAAI+BEAILFLIIaDBYUfAgJlCDQYUB8AdCwE/BYZNBLIQpFQwwdEBAUfCgKGFHAPAAQIIBDoIyBQwoyBHYYADQxJ0DMovASQYIBBgIIDFgitD/g+DCAizEKAZoCDoh9DDoSGCKYoLEPQIdEAAQLGg5ZDWwTsGLgRZEO4QFCLgpZEABStFABRxDABh6DABZHBEB0DIJwA/AH4A/AHwA=="))
  const frameB = () => /*120x30*/require("heatshrink").decompress(atob("vEegYYW8A7g/4AEBAUD7kwFlMBuPELNVcnQspgHx0DwhgIqBwAHDgdxxwspgXhWcIsIFwQEDv/AAocP/ASFgYaGFhn//0Aj//EwN//4FBX4YFC/gFD4H/+AsX4wsCdgkHAwYUBCIPHFjPCFgvggE/AwYmBL4QsZcAIsIwBcBCIYsaLIbaBFgIRBWAQsFFRpZPFhEfCIf4FjJZN//AFjhZJAAgsC4AsZ4wsrDQKGKAAQsc4lAFkwXBAQXQFgsAn5rJFiYXBAAXEsAsIAAQsd/0CwAsGg4sD+AsYgYdDg4sHSoRBFFiojCagMUcAwUCBATgUABFhmIaYACNV4wsqAH4A/ADoA="))
  const frame1 = /*30x90*/require("heatshrink").decompress(atob("j1agZC/AH4ABgNw4AHEjgDCuOHBQkjzADBj8MBQkPwwDBgsYoALE+OAAYPjxAKE7gRCuIaCAAUvrADBjtMBQkF8AWBg8YsAKDgVxFgMB8QwCAAV4sIHBsPGBQk14QsIgfGjAsBxUgBQgsCLoKGF3AsCoOiBQkXEAKVBBwQAChfEqAsB4QsEgNxwQEBuHQEImcsIDBsJSCQwdQDoMVQwwsDxQKEgV40AwBw5HCQw1ViAKEk7nCj8NBQkHQwUBjhZEgQgCWYOQCwl8opZCNAQsDUgUHjgsFww/BcAL7CWYVVoSKCWYs8cAbrFnx3CjtcBQkBcAZ6FgV1BwXhFgtwFIUhwgKEm4RCi8OBQkD4H/+AsHsE//glB8ALEv0P/8AuJZFkeD//AQw0NFhW4FgMBqgsFgAsHgf//4CBFgMQn4mBAQIAC+EGgF///8AQIACLINAAoUfBQYsCAYPxDoUAAYKIBDoI+C8ECg4OFHwP4gYdBFgI+BJ4P//zgBLIQdCBwcmLIQdCBwcH44sDDoIsDgIsEHYwsBBwZKBAAfAjh6CNASGDggaC/g4BQwnwQYRECBwUAoeAQAYAEj4GFg+GiDFCe4kCuOiB4R3Bg4LC90McYYsEnlVoAEBaIRxBNYPGFYTgDAwVw0wOBuBDF3lEHYRWFi8aAYMd5wKEh9UG4M+xUgBYlugkAl5GDOAf1j38vBvEgEGz///vBpBDFjjdBg2IBQsB4HnhiUCBYv0qlgBQ0Aq+GBI8AjWOBRED9QgIgM44gWIv2mNwg="))
  const frame2 = /*30x90*/require("heatshrink").decompress(atob("j1agZC/AG/61AKIjlRhgFCgeIAgVc8ecAoVPitQAgML4sCxgFC3GiwEAg2ulOEBQMH3FFAgMBn0Y8AQBgFx5VgCAVUqPAAoN/4lCAgMb4sGjAFBitVmghC48cmAFBgvcsAFBgOujUoJwW7xQsCo4sBBQV54zwChfh4lAAoMZ6omCgmOlGgGQXcsOGAoP8qNEBQX1qcIL4MMuGqFgUP40YHAMT1IaCLINcmBqBgecnAsCg38tEiAoO46IsDrlxSQVI8WKEIVvwwsCjvFuCRCitXikILIPjhAsCgW+L4UBzhZEu9RoJZBvHjFgcK80YuEAiPFQARUB5xZCgH4ooLDrlhigmB1HHBIUAl+qlAsBjlw4YKChnizDgCxgwBJwVxxzmBgh0BFgfOWYUB+GqkAKCk4sBAgNjylQFgqGBj04FgcA9eILIIsBpgKD7sNLIXiagcAke6LIUOOgbgBjFAAgMfjHgCwfvmH/+ECOgYAB7kgn/8gPUuIsFx//gE60QVDh+Ogf/4ETx8QWYcdwAsEEIe84gsCqgsEEYQsBtT1CEAP//4sCitQn4mBAQIAC+EGsF///8AQIACFgPAAoUfBQYsBgIDB+IdCgADBRwIdBHwXgp0HBwo+B/EXDoP8gA+BPYP//0C/hZCDoQOCwMcLIQdCBwd+Fgn+NwX4jGBFgg7GLIYOBDoIAD4EcPQVxBQiGBDQRKCQwngQYRECBwUB46AEAAmcAwt8uPIgEOgb2DgER9DRBhhKBwEHBQMH48IwEBx5TDBYM8qNAgGAaIRxBgFnqtQgEeX4RxBgEXuOEPQPiIYuqlGAgeOngKEntTAYNcsJOEDoIGBg+4ZIIACgYoB4FP40QEIkb/uCzvHBQsGz///vBpBDFjjdBg2IBQsB4HnhggFBYX0qlgBQ0Aq+GBI8AjWOBRED9QgIgM44gWIv2mWoIACA="))

  const X = (g.getWidth() - 120) / 2;
  const Y = (g.getHeight() - 120) / 2;
  g.setBgColor(0,0,0).setColor(1,1,1).clear();

  let ff = g.findFont("touch to continue", {h: 16});
  g.setFontAlign(0, -1).drawString(ff.text, X+60, Y+130);
  ff = g.findFont("Fat Finger Federation", {h: 10});
  g.setFontAlign(1, 1, 3).drawString(ff.text, X-4, Y);
  ff = g.findFont("presents...", {h: 10});
  g.setFontAlign(-1, 1, 0).drawString(ff.text, X, Y-1);

  g.drawImage(frameL(), X,    Y);
  g.drawImage(frameR(), X+75, Y);
  g.drawImage(frameB(), X, Y+90);

  let n = Math.floor((s * 1000) / ms);
  const onTouch = ()=>{ n = 0; Bangle.removeListener("touch", onTouch); };
  Bangle.on('touch', onTouch);

  return new Promise((resolve) => {
    let i = setInterval(()=>{
      if (n > 0) {
        g.drawImage((n % 2) ? frame1 : frame2, X+45, Y);
        n -= 1;
      } else {
        clearInterval(i);
        resolve();
      }
    }, ms);
  });
}
