//MMind

//set vars
const H = g.getWidth();
const W = g.getHeight();
var touch_actions = [];
var cols = ["#FF0000","#00FF00","#0000FF", "#FF00FF", "#FFFF00", "#00FFFF", "#000000","#FFFFFF"];
var turn = 0;
var col_menu = false;
//pinsRow = 6;
//pinsThick = 10;
//pinsRow = 5;
//pinsThick = 10;
var pinsRow = 4;
var pinsThick = 10;
var play = [-1, -1, -1, -1];

var pinsCol = 5;
var playx = -1;
var sx = (W - 30 )/pinsRow;
var sy = (H - 20 )/7;
var touch_actions = [];
var secret = [];
var secret_no_dub = true;
var endgame = false;

g.clear();
g.setColor("#FFFFFF");
g.fillRect(0, 0, H, W);
g.setFont("Vector12",45);

function draw() {
  touch_actions = [];
  g.clear();
  g.setColor("#FFFFFF");
  g.fillRect(0, 0, H, W);
  g.setColor("#000000");
  //draw scores
  for (y=0;y<game.length;y+=1) {
    pp = game[y][0];
    ps = game[y][1];
    g.setColor("#000000");
    //g.fillRect(W-30,10, W-30, 15);
    g.setColor("#000000");
    g.setFont("Vector30",10);
    g.drawString(ps[0],W-31,y*sy+8);
    g.setColor("#000000");
    g.drawString(ps[1],W-15,y*sy+8);
    g.setColor("#000000");
    for (x=0;x<pinsRow;x+=1) {
      xx = sx*x + pinsThick + 5;
      yy = sy*y+20;
      xc = pp[x];
      g.setColor(cols[xc]);
      g.fillCircle(xx,yy , pinsThick );
      g.setColor("#000000");
      g.drawCircle(xx,yy,pinsThick+1);
      g.drawCircle(xx,yy,pinsThick);
      }
    }
    //draw play input
    for (k=0; k<pinsRow; k+=1){
        xx = sx*k + pinsThick + 5;
        yy = sy*7;  
        touch_actions.push([[xx-pinsThick-5, yy-pinsThick-10, xx+pinsThick+5, yy+pinsThick+20],[1,k]]);
         if (play[k] < 0) {
           //col not choisen, draw small dot
           g.setColor("#000000");
           g.fillCircle(xx,yy , 3 );
        } else {
          g.setColor(cols[play[k]]);
          g.fillCircle(xx,yy , pinsThick );

        }
   }
  // draw action button
  // score, men
  if (!endgame) { 
      if (col_menu) {
        draw_col_choice();
      } else {
        // check if all pins are set yet
        if (Math.min.apply(null,play) < 0) {
          g.setColor("#FF0000");
          } else {
            g.setColor("#00FF00");
            touch_actions.push([[W-30, H-30,192, 190], [3,1]]);
          }
      g.fillRect(W-30, H-30, W-1, H-10);
      } 
  } else { 
     g.setColor("#0000FF");
     touch_actions.push([[W-30, H-30,192, 190], [4,1]]);
     g.fillRect(W-30, H-30, W-1, H-10);
  } 
  
}

function get_secret() {
  //secret=[]; 
  for (i=0; i<pinsRow; i+=1) {
    s = Math.round(Math.random()*pinsCol);
    if (secret_no_dub) 
       while(secret.indexOf(s) >= 0) s = Math.round(Math.random()*pinsCol);
    secret[i]= s;
      }
   }

function score() {
  bScore = 0;
  wScore = 0;
  for (i=0; i<pinsRow; i+=1) {
    if (secret[i] == play[i]) {
      bScore +=1;
      }
    else {
      for (s=0; s<pinsRow; s+=1) {
        if (secret[i] == play[s]) {
          wScore +=1;
          break;
          }
        } 
      }
    }

  return([bScore, wScore]);
}

function draw_col_choice(){
  var cc = g.getColor();
  var boxw = 30;
  var boxh = H/pinsRow-20;
  for (i=0; i<=pinsCol; i+=1) {
      g.setColor(cols[i]);
      g.fillRect(W-boxw, i*boxh, W-1, i*boxh+boxh);
      touch_actions.push([[150, i*boxh, 191, i*boxh+boxh], [2,i]]);
   g.setColor(cc);  
 }

}

Bangle.on('touch', function(zone,e) { 
    //console.log(e.x, e.y);
    // check touch actions array to see what to do
    for(i=0; i<touch_actions.length; i+=1) {
      if (e.x > touch_actions[i][0][0] && e.x < touch_actions[i][0][2] && 
         e.y > touch_actions[i][0][1] && e.y < touch_actions[i][0][3]) {
        // a action is hit, add acctions here, todo: start, stop, new, etc. 
        switch (touch_actions[i][1][0]) {
          case 1:
            //get pins col menu
            col_menu = 1;
            playx = touch_actions[i][1][1];
            break;
          case 2:
            //copy choice col to play
            play[playx] =  touch_actions[i][1][1];
            col_menu = 0;
            break;
          case 3:
            //score play
            var sc;
            sc = score();
            game.push([play, sc]);
            play = [-1,-1,-1,-1];
            turn+=1;
            if (turn==6 || sc[0]==pinsRow) {
              play = secret;
              col_menu = 0;
              endgame = true;
            }
            break;
          case 4:
            //new game
            turn = 0;
            play = [-1,-1,-1,-1];
            game = [];
            endgame=false;
            break;
        }
      }
    }
    //console.log(touch_actions[i][1][0], touch_actions[i][1][1]);
  
   draw();
  }
);


game = [];
get_secret();
draw();
