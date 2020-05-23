// Berlin Clock see https://en.wikipedia.org/wiki/Mengenlehreuhr
const fields = [ 4 , 4 , 11 , 4 ];
const offset = 20; 
const width = g.getWidth() - 2*offset;
const height = g.getHeight() - 2*offset;
const rowHeight = height/4;

//const settings = require("Storage").readJSON("berlin-clock.json", 1);
const show_date = true; // settings.show_date || true;

rowlights = [];

function drawBerlinClock() {
    g.clear();

    var now = new Date();
    if (show_date) {
      var yr = now.getFullYear();
      var month = now.getMonth()+1;
      var day = now.getDate();
      var dateString=`${yr}-${month<10?'0':''}${month}-${day<10?'0':''}${day}`;  
      var strWidth = g.stringWidth(dateString);
      g.drawString(dateString,(g.getWidth()-strWidth)/2,height+offset+2);
    }
    rowlights[0] = Math.floor(now.getHours() / 5);
    rowlights[1] = now.getHours() % 5;
    rowlights[2] = Math.floor(now.getMinutes() / 5);
    rowlights[3] = now.getMinutes() % 5;
  
    g.drawRect(offset,offset,width+offset,height+offset);
    for (row = 0 ; row < 4 ; row++) {
      nfields = fields[row];
      boxWidth = width/nfields;

      for (col = 0 ; col < nfields ; col++) {
        x1 = col*boxWidth + offset ;
        y1 = row*rowHeight + offset;
        x2 = (col+1)*boxWidth + offset;
        y2 = (row+1)*rowHeight + offset;

        g.setColor(1,1,1);
        g.drawRect(x1,y1,x2,y2);
        if (col<rowlights[row]) {

          if (row === 2 ) {
            if (((col+1) % 3) === 0) {
              g.setColor(1,0,0);
            } else {
              g.setColor(1,1,0);
            }
          } else {
              g.setColor(1,0,0);
          }

          g.fillRect(x1+2,y1+2,x2-2,y2-2);
        }
      }
    }
}

// special function to handle display switch on
Bangle.on('lcdPower', (on) => {
  g.clear();
  if (on) {
  	Bangle.drawWidgets();
  // call your app function here
  drawBerlinClock();
}});

// refesh every 15 sec
setInterval(drawBerlinClock, 15E3);

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawBerlinClock();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
