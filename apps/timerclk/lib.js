exports.pause_img = atob("GBiBAf///////////+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B+D/B////////////w==");
exports.play_img = atob("GBiBAf////////////P///D///A///Af//AH//AB//AAf/AAH/AAB/AAB/AAH/AAf/AB//AH//Af//A///D///P//////////////w==");
exports.reset_img = atob("GBiBAf////////////AAD+AAB+f/5+f/5+f/5+cA5+cA5+cA5+cA5+cA5+cA5+cA5+cA5+f/5+f/5+f/5+AAB/AAD////////////w==");
exports.remove_img = atob("GBiBAf///////////+P/x+H/h+D/B/B+D/g8H/wYP/4Af/8A//+B//+B//8A//4Af/wYP/g8H/B+D+D/B+H/h+P/x////////////w==");

exports.formatTime = function(t, short, tnthEnable, fullTime) {
  var negative = "";
  if (t < 0) {
    t = t*(-1);
    negative = "-";
  }
  let hrs = Math.floor(t/3600000);
  let mins = Math.floor(t/60000)%60;
  let secs = Math.floor(t/1000)%60;
  var tnth = "";
  if (tnthEnable) {
    tnth = Math.floor(t/100)%10;
    tnth = "."+tnth;
  }
  var hrsStr = hrs;
  if (hrs < 10 && !negative) hrsStr = "0"+hrs;
  var text;
  if (short) {
    if (hrs === 0) text = negative + ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2);
    else text = negative + hrsStr + "/" + ("0"+mins).substr(-2);
  } else {
    if (hrs === 0 && !fullTime) text = negative + ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2) + tnth;
    else text = negative + hrsStr + ":" + ("0"+mins).substr(-2) + ":" + ("0"+secs).substr(-2);
  }
  return text;
};

exports.getTime = function(e) {
  var time = e.timeAdd;
  if (e.start) {
    time += Date.now() - e.start;
  }
  return time;
};

exports.getCurrentTime = function() {
  var date = new Date();
  return date.getHours()*3600000+date.getMinutes()*60000+date.getSeconds()*1000+date.getMilliseconds();
};

exports.registerControls = function(o) {
  if (process.env.HWVERSION==1) {
    setWatch(()=>{
      if (o.editIndex == 0) o.buttons.play.callback();
      else o.edit(o.editIndex, 1);
      o.draw();
    }, BTN1, {repeat:true});
    setWatch(()=>{
      o.editIndex = !o.editIndex;
      o.draw();
    }, BTN2, {repeat:true});
    setWatch(()=>{
      if (o.editIndex == 0) o.buttons.reset.callback();
      else o.edit(o.editIndex, -1);
      o.draw();
    }, BTN3, {repeat:true});
    setWatch(()=>{
      if (o.editIndex) {
        o.editIndex++;
        if (o.editIndex > 3) o.editIndex = 1;
      } else if (o.current > 0) o.current--;
      o.update();
    }, BTN4, {repeat:true});
    setWatch(()=>{
      if (o.editIndex) {
        o.editIndex--;
        if (o.editIndex < 1) o.editIndex = 3;
      } else {
        o.current++;
        if (o.current == o.all.length) o.all.push(o.defaultElement.clone());
      }
      o.update();
    }, BTN5, {repeat:true});
  } else {
    setWatch(()=>load(), BTN1);
    Bangle.on('touch',(n,e)=>{
      for (var button of o.buttons) {
        if (e.x>=button.pos[0] && e.y>=button.pos[1] &&
          e.x<button.pos[2] && e.y<button.pos[3]) {
          button.callback();
          break;
        }
      }
    });
    var absX, lastX=0, lastY=0;
    Bangle.on('drag', e=>{
      if (!e.b) {
        if (lastX > 40) { // right
          o.current++;
          if (o.current == o.all.length) o.all.push(o.defaultElement.clone());
        } else if (lastX < -40) { // left
          if (o.current > 0) {
            o.current--;
          }
        } else if (lastY > 30) { // down
          if (absX < o.dragBorderHrsMins) {
            o.edit(3, -1);
          } else if (absX > o.dragBorderHrsMins && absX < o.dragBorderMinsSecs) {
            o.edit(2, -1);
          } else {
            o.edit(1, -1);
          }
        } else if (lastY < -30) { // up
          if (absX < o.dragBorderHrsMins) {
            o.edit(3, 1);
          } else if (absX > o.dragBorderHrsMins && absX < o.dragBorderMinsSecs) {
            o.edit(2, 1);
          } else {
            o.edit(1, 1);
          }
        }
        lastX = 0;
        lastY = 0;
        o.update();
      } else {
        absX = e.x;
        lastX = lastX + e.dx;
        lastY = lastY + e.dy;
      }
    });
  }
};

exports.timerExpiresIn=t=>t.time-(Date.now()-t.start);
