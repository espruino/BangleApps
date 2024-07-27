var init_message = true;
var acc_data;
var die_roll = 1;
var selected_die = 0;
var roll = 0;
const dices = [4, 6, 10, 12, 20];

g.setFontAlign(0,0);

Bangle.on('touch', function(button, xy) {
  // Change die if not rolling
  if(roll < 1){
    if(selected_die <= 3){
      selected_die++;
    }else{
      selected_die = 0;
    }
  }
  //Disable initial message
  init_message = false;
});

function rect(){
  x1 = g.getWidth()/2 - 35;
  x2 = g.getWidth()/2 + 35;
  y1 = g.getHeight()/2 - 35;
  y2 = g.getHeight()/2 + 35;
  g.drawRect(x1, y1, x2, y2);
}

function pentagon(){
  x1 = g.getWidth()/2;
  y1 = g.getHeight()/2 - 50;
  x2 = g.getWidth()/2 - 50;
  y2 = g.getHeight()/2 - 10;
  x3 = g.getWidth()/2 - 30;
  y3 = g.getHeight()/2 + 30;
  x4 = g.getWidth()/2 + 30;
  y4 = g.getHeight()/2 + 30;
  x5 = g.getWidth()/2 + 50;
  y5 = g.getHeight()/2 - 10;
  g.drawPoly([x1, y1, x2, y2, x3, y3, x4, y4, x5, y5], true);
}

function triangle(){
  x1 = g.getWidth()/2;
  y1 = g.getHeight()/2 - 57;
  x2 = g.getWidth()/2 - 50;
  y2 = g.getHeight()/2 + 23;
  x3 = g.getWidth()/2 + 50;
  y3 = g.getHeight()/2 + 23;
  g.drawPoly([x1, y1, x2, y2, x3, y3], true);
}

function drawDie(variant) {
  if(variant == 1){
    //Rect, 6
    rect();
  }else if(variant == 3){
    //Pentagon, 12
    pentagon();
  }else{
    //Triangle, 4, 10, 20
    triangle();
  }
}

function initMessage(){
    g.setFont("6x8", 2);
    g.drawString("Dice-n-Roll", g.getWidth()/2, 20);
    g.drawString("Shake to roll", g.getWidth()/2, 60);
    g.drawString("Tap to change", g.getWidth()/2, 80);
    g.drawString("Tap to start", g.getWidth()/2, 150);
}

function rollDie(){
    acc_data = Bangle.getAccel();
    if(acc_data.diff > 0.3){
      roll = 3;
    }
    //Mange the die "roll" by chaning the number a few times
    if(roll > 0){
      g.drawString("Rolling!", g.getWidth()/2, 150);
      die_roll = Math.abs(E.hwRand()) % dices[selected_die] + 1;
      roll--;
    }
    //Draw dice graphics
    drawDie(selected_die);
    //Draw dice number
    g.setFontAlign(0,0);
    g.setFont("Vector", 45);
    g.drawString(die_roll, g.getWidth()/2, g.getHeight()/2);
    //Draw selected die in right corner
    g.setFont("6x8", 2);
    g.drawString(dices[selected_die], g.getWidth()-15, 15);
}

function main() {
  g.clear();
  if(init_message){
    initMessage();
  }else{
    rollDie();
  }
  Bangle.setLCDPower(1);
}

setInterval(main, 300);