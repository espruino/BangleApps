Graphics.prototype.setFontSixCaps = function(scale) {
  // Actual height 60 (59 - 0)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADMzMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADMzMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0VniarM3u4AAAAAAAAAAAAAAAAAAAAAAAAAAABEZoiqzN3u////////8AAAAAAAAAAAAAAAAAAAJFZ4iqzN3u////////////////8AAAAAAAAAAARGZ4mrzd7v////////////////////////8AAAAAAAqszd7v////////////////////////////7u3MoAAAAAAA//////////////////////////7t3MqohmRCAAAAAAAAAA//////////////////7t3MqohmRAAAAAAAAAAAAAAAAAAA/////////+7dzKqYdlQwAAAAAAAAAAAAAAAAAAAAAAAAAA/+7dzKqIZkQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZkQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWazMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMqVAAAAAAAAAa7//////////////////////////////////+oQAAAAAAC/////////////////////////////////////+wAAAAAAf//////////////////////////////////////3AAAAAA3///7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u///9AAAAAA///GREREREREREREREREREREREREREREREREbP//AAAAAA//8wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA///AAAAAA///GREREREREREREREREREREREREREREREREbP//AAAAAA3///7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u///9AAAAAAf//////////////////////////////////////3AAAAAAC/////////////////////////////////////+wAAAAAAAa7//////////////////////////////////+oQAAAAAAAAWazMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMqVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACqoAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8AAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8AAAAAAA//3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3/8AAAAAAA//////////////////////////////////////8AAAAAAA//////////////////////////////////////8AAAAAAA//////////////////////////////////////8AAAAAAA3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADu4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAes3d3d3d0AAAAAAAAAAAAAAAAAAAAAAAADVorAAAAAAAA8////////8AAAAAAAAAAAAAAAAAAAAlaKze///wAAAAAAHf////////8AAAAAAAAAAAAAAAFGis3v///////wAAAAAAn/////////8AAAAAAAAAAARom83v///////////wAAAAAA7//+3d3d3d0AAAAAAEV5rN7//////////////v/wAAAAAA//xTAAAAAAAAA1eKze//////////////7cqXVP/wAAAAAA//UAAAAAFGis3v/////////////+3Kl2QAAAAP/wAAAAAA//6XZoq83v/////////////+26hkEAAAAAAAAP/wAAAAAA3//////////////////tyoZSAAAAAAAAAAAAAP/wAAAAAAb//////////////tuoZAAAAAAAAAAAAAAAAAAP/wAAAAAACv/////////tuXUwAAAAAAAAAAAAAAAAAAAAAP/wAAAAAAAI3////9yoZAAAAAAAAAAAAAAAAAAAAAAAAAAP/wAAAAAAAAJ4qodRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKqgAAAAAAAAWazMzMzMzMzAAAAAAAAAAAAAzMzMzMzMzMqVAAAAAAAAAa7//////////wAAAAAAAAAAAA///////////+oQAAAAAADP///////////wAAAAAAAAAAAA/////////////AAAAAAAf////////////wAAAAiIgAAAAA/////////////3AAAAAA3///7u7u7u7u7gAAAA//8AAAAA7u7u7u7u7u///9AAAAAA//11RERERERERAAAAA//8AAAAAREREREREREV9//AAAAAA//QAAAAAAAAAAAAAAB//8QAAAAAAAAAAAAAAAE//AAAAAA//11RERERERERERERa//+lREREREREREREREV9//AAAAAA3///7u7u7u7u7u7u7/////7u7u7u7u7u7u7u///9AAAAAAf//////////////////////////////////////3AAAAAAC/////////////////+q//////////////////+wAAAAAAAa7///////////////0i3////////////////+oQAAAAAAAAWazMzMzMzMzMzMyoIAKKzMzMzMzMzMzMzMqVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkRGZniIqqoAAAAAAAAAAAAAAAAAAAAAAkRGZniIqqrMzd3u7v//////8AAAAAAAAAAAAAAAqqrMzd3u7v////////////////////8AAAAAAAAAAAAAAA//////////////////////////////8AAAAAAAAAAAAAAA//////////////////////////////8AAAAAAAAAAAAAAA///////////////+7t3czKqpiHZm//8AAAAAAAAAAAAAAA//7u3dzMuqqIhmZUQwAAAAAAAAAA//8AAAAAAAAAAAAAAAZmREAAAAAAAAAARERERERERERERE//9EREREREQAAAAAAAAAAAAAAAAAAAAA7u7u7u7u7u7u7u///u7u7u7u4AAAAAAAAAAAAAAAAAAAAA////////////////////////8AAAAAAAAAAAAAAAAAAAAA////////////////////////8AAAAAAAAAAAAAAAAAAAAA////////////////////////8AAAAAAAAAAAAAAAAAAAAAzMzMzMzMzMzMzMzMzMzMzMzMwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARERERERERERERERERERAAABEREREREREREREAAAAAAAAAA7u7u7u7u7u7u7u7u7u7gAADu7u7u7u7u7u7u2TAAAAAAAA///////////////////wAAD//////////////+YAAAAAAA///////////////////wAAD///////////////4wAAAAAA///////////////////wAAD///////////////+gAAAAAA//zMzMzMzMzMzMzM3//AAADMzMzMzMzMzMzM7//wAAAAAA//AAAAAAAAAAAAAG//cAAAAAAAAAAAAAAAAAKf/wAAAAAA//AAAAAAAAAAAAAN//UAAAAAAAAAAAAAAAAAB//wAAAAAA//AAAAAAAAAAAAAP//6qqqqqqqqqqqqqqqqqv//wAAAAAA//AAAAAAAAAAAAAP///////////////////////AAAAAAA//AAAAAAAAAAAAAN//////////////////////9AAAAAAA//AAAAAAAAAAAAAF7/////////////////////gAAAAAAA//AAAAAAAAAAAAAAWu//////////////////7GAAAAAAAAZmAAAAAAAAAAAAAAADZmZmZmZmZmZmZmZmZmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADREREREREREREREREREREREREREREREREMAAAAAAAAAADne7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7ZMAAAAAAABd////////////////////////////////////1QAAAAAALv/////////////////////////////////////iAAAAAAr//////////////////////////////////////6AAAAAA///szMzMzMzMzMzMzP//zMzMzMzMzMzMzMzM3///AAAAAA//ogAAAAAAAAAAAAC//5AAAAAAAAAAAAAAAACf//AAAAAA//cAAAAAAAAAAAAAD//zAAAAAAAAAAAAAAAABf//AAAAAA//+6qqqqqqqqAAAAD//8qqqqqqqqqqqqqqqqrv//AAAAAAz///////////AAAAD//////////////////////8AAAAAAT///////////AAAADv/////////////////////0AAAAAACP//////////AAAAB/////////////////////+AAAAAAAAGzv////////AAAAAGzv/////////////////sYAAAAAAAAABGZmZmZmZmAAAAAABGZmZmZmZmZmZmZmZmZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACQAAAAAAA//AAAAAAAAAAAAAAAAAAAAAAAAACRGZ4iqrM3e4AAAAAAA//AAAAAAAAAAAAAAACRGZ4iqrM3e7v////////8AAAAAAA//AAAAACRGZ4iqrM3e7v//////////////////8AAAAAAA//iqrM3e7v////////////////////////////8AAAAAAA//////////////////////////////////7u3cwAAAAAAA///////////////////////+7t3MyqmIZmRCAAAAAAAAAA/////////////u3dzLqoiGZUQgAAAAAAAAAAAAAAAAAAAA//7t3cyqqIhmVEEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZlRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWazMzMzMqphjAAAAAAAAAARniqrMzMzMzMqVAAAAAAAAAa7//////////+yWEAAAAVi97////////////+oQAAAAAAC///////////////2VAGrf////////////////+wAAAAAAf////////////////+vP///////////////////3AAAAAA3///7u7u7u7/////////////////7u7u7u7u///9AAAAAA///GRERERERmis3////////typhmREREREREbP//AAAAAA//8wAAAAAAAAAAJ8/////8hgAAAAAAAAAAAAA///AAAAAA///GRERERERWis3////////typhmREREREREbP//AAAAAA3///7u7u7u7/////////////////7u7u7u7u///9AAAAAAf////////////////+vP///////////////////3AAAAAAC///////////////2VAGrf////////////////+wAAAAAAAa7//////////+yWIAAAAVi97////////////+oQAAAAAAAAWazMzMzMqphjAAAAAAAAAARniqrMzMzMzMqVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1ZmZmZmZmZmZmZmZmQgAAAAAAZmZmZmZmYwAAAAAAAAAFvv////////////////7rUAAAAA/////////rUAAAAAAAB+////////////////////9gAAAA//////////9wAAAAAAP//////////////////////gAAAA///////////zAAAAAAv//////////////////////wAAAA///////////7AAAAAA///7qqqqqqqqqqqqqqqq3//wAAAAqqqqqqqqrP//AAAAAA//9wAAAAAAAAAAAAAAAAT//wAAAAAAAAAAAAAH//AAAAAA//9wAAAAAAAAAAAAAAAAn//AAAAAAAAAAAAAAZ//AAAAAA///8zMzMzMzMzMzMzMzM///MzMzMzMzMzMzMzf//AAAAAAv//////////////////////////////////////7AAAAAAP//////////////////////////////////////zAAAAAABu////////////////////////////////////5gAAAAAAAEre7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7aQAAAAAAAAAAUREREREREREREREREREREREREREREREREQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMzMwAAAAAAAAAAAzMzAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//8AAAAAAAAAAA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAP//8AAAAAAAAAAA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAP//8AAAAAAAAAAA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAP//8AAAAAAAAAAA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAMzMwAAAAAAAAAAAzMzAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("CAwODQ4PDw8QDA8QCA=="), 69+(scale<<8)+(4<<16));
  return this;
};

const offset = 25;
const width = g.getWidth();
const height = g.getHeight();

var drawTimeout;
var fgTime = 0xf800;
var bgTime = 0x3333ff;
var dayDate = 0x000;

function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function time() {
  require("Font4x5").add(Graphics);
  var d = new Date();
  var day = d.getDate();
  var time = require("locale").time(d,1);
  //var date = require("locale").date(d);
  var mo = require("date_utils").month(d.getMonth()+1,0);

  g.setFontAlign(0,0);
  g.setFontSixCaps(2).setColor(fgTime).drawString(time, width/2, height/2+10);
  
  g.setFont("4x5",2);
  g.setFontAlign(0,0);
  g.setColor(dayDate).drawString(mo,width-55, height-16);
  g.drawString(day,width-10, height-16);
}

function draw() {
  g.setColor(bgTime).fillRect(0,40,width,height-offset);
  time();
  queueDraw();
}

//program start
g.clear(); // Clear the screen once, at startup

if (g.theme.dark==true){
  dayDate = 0xffff;
}
else {
  dayDate=0x000;
}

draw(); // draw immediately at first



// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
