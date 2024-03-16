//////////////////////////////
// Tic - Tac - Toe
// Stable Version 1.0 - 12/31/2022 
// MissionMake
//////////////////////////////

////////////////////////////
// TODO:
// Implement Computer Player
// Beginning Screen (pick player to go first, pick one or two player)
////////////////////////////


//create 3x3 array to log plays Xs defined as 1, Os defined as -1, blank is undefined, array is initialized undefined, player is which players turn is active (using 1,-1 definition to match matrix), active is if a game is being played

var arr1 = new Array(3);
var arr2 = new Array(3);
var arr3 = new Array(3);
var arr = new Array(arr1,arr2,arr3);
var val = 0;
var player;
var active = false;
var select = false;
var winval =0;
var ex = require("heatshrink").decompress(atob("mEwwI63jACEngCEvwCEv4CB/wCBn+AgP8AoMf4ED/AFBh/gg/wAoIDBA4IFBB4ITBAoIbBD4I8C/wrCGAQuCGAQuCGAQuCGAQuCAo4RFDoopFGohBFJopZFMopxFPoqJFSoqhFVooA0A"));
var oh = require("heatshrink").decompress(atob("mEwwIdah/wAof//4ECgYFB4AFBg4FB8AFBj/wh/4AoM/wEB/gFBvwCB/wCBBAU/AQIUCj8AgIzCh+AgYmCg/AgYyCAYIHBAoXgg+AAoMBApkPLgZKBAtBBRLIprDMoJxFPoqJFSoyhCAQStFXIrFFaIrdFdIwAVA"));

//calculates sum of rows, colums, and diagonals for a win condition. passes winner to win() and breaks out of calcs
function calcWin(){
  winval = 0;
  //sum of row
  for(let i = 0; i<3; i++){
    val=0;
    for(let j = 0; j<3; j++){
      val = arr[i][j]+val;
    }
    if (Math.abs(val)==3) {
      winval = val;
    } 
  }

  //sum of columns
  for(let j = 0; j<3; j++){
    val=0;
    for (let i = 0; i<3; i++){
      val = arr[i][j]+val;
    }
    //if win set winval to val
    if (Math.abs(val)==3) {
      winval = val;
    }
  }

  //Sum of ul to lr
  val=0;
  val = arr[0][0]+arr[1][1]+arr[2][2];
  //if win set winval to val
  if (Math.abs(val)==3) {
    winval = val;
  }
  
  //sum of ur to ll
  val=0;
  val = arr[0][2]+arr[1][1]+arr[2][0];
  //if win set winval to val
  if (Math.abs(val)==3){      
    winval = val;
  }
  
  //draw check
  // drawChk is sum absolute value of array, if drawChk = 9 then there is a draw
  let drawChk = 0;
  for(let i = 0; i<3; i++){
    for(let j = 0; j<3; j++){
      drawChk = drawChk + Math.abs(arr[i][j]);
    }
  }
  
  //checks for win cases and posts correct message, otherwise play
   if (winval == 3){
    active = false;
    E.showAlert("Player X Wins").then(start);
  } else if (winval == -3){
    active = false;
    E.showAlert("Player O Wins").then(start);
  } else if (drawChk == 9) {
    active = false;
    E.showAlert("Draw").then(start);
  }else{
  //If no win then play
    draw();
  }
}

function draw(){
  g.clear();
  let playerIcon;
  if (player ==1){
    playerIcon = "X";
  } else if(player == -1){
    playerIcon = "O";
  }
  //Banner Displays player turn
  E.showMessage("","Player "+ playerIcon);
  //drawboard
  g.drawLine(62,24,62,176);
  g.drawLine(112,24,112,176);
  g.drawLine(12,74,164,74);
  g.drawLine(12,124,164,124); 

  //loop through array and draw markers
  for(let i = 0; i<3; i++){
    for(let j = 0; j<3; j++){
      if(arr[j][i] == -1){         
        g.drawImage(oh,i*50+12,j*50+24);//, {scale:1.05});
      } else if (arr[j][i] == 1){
        g.drawImage(ex,i*50+12,j*50+24);//, {scale:1.05}); 
      } else {
        //blank spot
      }  
    }
  }
  select=false;
  wait();
}

// Square locations
//12,24;62,24,112,24
//12,74;62,74,112,74
//12,124;62,124,112,124

function placeMarker(){
  ///Determine marker square
  if (x <= 62) {
    b = 0;
  } else if (x <= 112){
    b = 1;
  } else {
    b = 2;
  }
  
  if (y <= 74) {
    a = 0;
  } else if (y <= 124){
    a = 1;
  } else {
    a = 2;
  }
  
  //if empty
  if( arr[a][b] == undefined){
    //record in array
    arr[a][b] = player;
    player=player*-1;
    select = false;
    calcWin();
  } else{ //if filled
    // This could just do nothing
    
    E.showAlert("SpaceFilled Try again").then(draw);
    } 
}





// Wait loop which is run until a tap is selected
function wait(){
  //Terminal.println("wait");
  if(select == true){
    placeMarker();
  } else {
    setTimeout(wait,300);
  }
}


// Starts new game
// Draws the start pattern, sets first player to x and goes to play
function start(){
  //reset array to undefined
  arr1.fill(undefined);
  arr2.fill(undefined);
  arr3.fill(undefined);
  g.clear();
  active =true;
  player=1;
  draw();
}


//Looks for touch
Bangle.on('touch', function(zone,e) {
  x = Object.values(e)[0];
  y = Object.values(e)[1];
  //if game is active 
  if(active == true){
    g.fillCircle(x, y, 10);
    select = true;
  }
  if(active == false){
     start();
  }
 });


start();


