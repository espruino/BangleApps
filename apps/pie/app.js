function end(){
  clearInterval(m);
  clearWatch(w);
  gfx.clear();
  gfx.setColor(1,0,0);
  gfx.setFont("Vector30");
  gfx.drawString('Game over!\n Score: '+score+'\nPress BTN1', gfx.getWidth()*0.15,gfx.getHeight()*0.4);
  setWatch(function(){init();}, BTN1);
}
function scrollX(){
  gfx.clearRect(0,gfx.getHeight()*(1/4),gfx.getWidth(),0);
  gfx.scroll(0,gfx.getHeight()/4);
  score++;
  if(typeof m !== 'undefined' && score>0){
  clearInterval(m);
  m = setInterval(scrollY,Math.abs(100/score+15-0.1*score));}
  gfx.setColor(1,1,1);
  gfx.drawString(score,gfx.getWidth()*(4.2/5),gfx.getHeight()*(0.5/5));
  gfx.setColor(Math.random(),Math.random(),Math.random());
  gfx.setColor(col[0],col[1],col[2]);
  gfx.fillRect(colm[0],colm[1],colm[2],colm[3]);
  col = [Math.random(),Math.random(),Math.random()];
  gfx.setColor(col[0],col[1],col[2]);
  block[0] = gfx.getWidth();
}
function scrollY(){
  block[0] -= 2;
  block[2] = block[0]+colm[2]-colm[0];
  gfx.clearRect(block[2], block[1], gfx.getWidth(), block[3]);
  gfx.fillRect(block[0],block[1],block[2],block[3]);
  if(block[2]<colm[0])end();
}
function coldet(){
  if(block[0]<colm[2]){
    gfx.clearRect(block[0],block[1],block[2],block[3]);
    if(colm[2]>block[2] && colm[0]<block[2])colm[2]=block[2];
    if(colm[0]<block[0] && block[0]<colm[2])colm[0]=block[0];
    scrollX();
  }else{end();}
}
function init(){
  gfx = Graphics.getInstance();
  col = [Math.random(),Math.random(),Math.random()];
  gfx.clear();
  colm = [gfx.getWidth()*(1/5),gfx.getHeight()*(3/4),gfx.getWidth()*(4/5),gfx.getHeight()/2];
  block = [gfx.getWidth(),gfx.getHeight()/4,gfx.getWidth(),gfx.getHeight()/2];
  score = -3;
  gfx.setFont("Vector15");
  gfx.fillPoly(colm);
  scrollX();
  scrollX();
  scrollX();
  w = setWatch(coldet, BTN1, {repeat:true});
  m = setInterval(scrollY,110);
}
init();
