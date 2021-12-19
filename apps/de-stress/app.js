g.setBgColor(0).clear();

var img = require("heatshrink").decompress(atob("plB4X/ln7A4OGmMs5dVAANa1WlAoQADBI9W1QAByoJNtWv4f61ISEtWrBI2q4EAgeqCQgJHq2sLoU6IYdaBIg5CrWAn2q2EDF4dq4EO1W8gQcCtUD1fP9cA9QSC1cA9f/9XADgWohxBBh2whQvBq2gAwMAh+wlQSB1k7IIXogYvBrXAlYJC9k6DYOw9gIChXA9JBC0AJCncOytWwAtBAAMDF4RBDAAMOgWVrXDwDjD9kKy2gIIcAgXD0taDYgvCRIJBDF4OA0trhwIDJgK2B4BKDAAXptcLA4kC4HrD4IJE8HptE4BAhfBLAJBEgEslISGL4JOBBAoSB1ksBIs6/70DBIgSHh+q+AIFnASIABASU0EgCR0IhWgEp4SBHCBxJLzusXowAIaBISLhYSO8EptcOCR2w9NagXACJkDwGlrXDwASMgXDCQOA2ASMh0C0tW2HgCRkLh2Vq2glASMlEKytV1iFN9k6qtVtEOORcD2EpCQNqOwJwL4GpCQNa4GgCRUKgelCQJyBlgSKnBwBCQWgnZdLOAQAB1BfKLoMqCIVVtYHBXZPA9ISDL4PsCRE7LoZfDnRKJLoYAC1kOTI8CDoIREJgMA1gSGFwJKEJgaGH9hKFTIaGGPQKVEAAeogbTFhXASogADtXAlYSE9cDeYRMG2A5EG4MOJQxMC1g5EG4M6JQ4AB1Q5E9ED1QRIHIatBG5Y5EVoM6G5Y5DnXDCwJvIHIsD32AG5Y5C1aUBgHqG5atDLwI3MHIReCG5hgD4aUKHI2+G5xgC1RcNAAdpBJA"))


function hr(){
  Bangle.buzz(100,0.1).then(()=>{
    g.clear();
    return new Promise(resolve=>setTimeout(resolve,250)); // wait 250ms
  }).then(()=>{
    return Bangle.buzz(150);
  }).then(()=>{
    g.drawImage(img, g.getWidth()/2 - 76, g.getHeight()/2 - 65, {scale:2});
  });
}
setInterval(hr, 2000);

g.flip();

//  TODO - not clock but we still want a press to show launcher when button pressed
Bangle.setUI("clock");
