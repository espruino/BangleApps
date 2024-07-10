/* sox Rear_Right.wav -r 4k -b 8 -c 1 -e unsigned-integer 0.raw vol 2 
   aplay -r 4000 /tmp/0.raw
*/

/* https://forum.espruino.com/conversations/348912/ */

let pin = D19;

function play(name, callback) {  
  function playChar(offs) {
    var l = 10240;
    var s = require("Storage").read(name, offs, l);
    //print("Waveform " + name + " " + s.length);
    if (!s.length) {
      digitalWrite(pin,0);
      if (callback) callback();
      return;
    }
    var w = new Waveform(s.length);
    var b = w.buffer;
    b.set(s);
    //print("Buffer", s.length);
    //for (var i=s.length-1;i>=0;i--)b[i]/=4;
    w.startOutput(pin, 4000);
    w.on("finish", function(buf) {
      playChar(offs+l);
    });
  }
  analogWrite(pin, 0.1, {freq:40000});
  playChar(0);
}

function video(name, callback) {  
  function frame() {
    var s = require("Storage").read(name, offs, l);
    if (!s)
      return;
    g.drawImage(s, 0, 0, { scale: 2 });
    g.flip();
    offs += l;
  }
  g.clear();
  var offs = 0;
  //var l = 3875; for 176x176
  //var l = 515; for 64x64
  var l = 971;
  setInterval(frame, 200);
}

function run() {
  clearInterval(i);
  print("Running");
  play('bad.araw');
  t1 = getTime();
  video('bad.vraw');
  print("100 frames in ", getTime()-t1);
  // 1.7s, unscaled
  // 2.68s, scale 1.01
  // 5.73s, scale 2.00
  // 9.93s, scale 2, full screen
  // 14.4s scaled. 176/64
}

print("Loaded");
i = setInterval(run, 100);