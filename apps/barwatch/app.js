// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function draw() {
  g.reset();

  if(g.theme.dark){
    g.setColor(1,1,1);
  }else{
    g.setColor(0,0,0);
  }

  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();

  // hour bars
  var bx_offset = 10, by_offset = 35;
  var b_width = 8, b_height = 60;
  var b_space = 5;

  for(var i=0; i<h; i++){
    if(i > 11){
      by_offset = 105;
    }
    var iter = i % 12;
    //console.log(iter);
    g.fillRect(bx_offset+(b_width*(iter+1))+(b_space*iter),
               by_offset,
               bx_offset+(b_width*iter)+(b_space*iter),
               by_offset+b_height);
  }

  // minute bar
  if(h > 11){
    by_offset = 105;
  }
  var m_bar = h % 12;
  if(m != 0){
    g.fillRect(bx_offset+(b_width*(m_bar+1))+(b_space*m_bar),
               by_offset+b_height-m,
               bx_offset+(b_width*m_bar)+(b_space*m_bar),
               by_offset+b_height);
  }

  // queue draw in one minute
  queueDraw();
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
