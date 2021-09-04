Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
var numberofHearts = 3;

Bangle.setLCDMode("doublebuffered");


//var popUp = require("heatshrink").decompress(atob("isFwMBCJoA=="));

var backgroundImage = require("heatshrink").decompress(atob("isZxH+woAB6YBBBodXAgYLCCIQUJAgoUOFP4p/FP4p/FP4p/FP4pYA=="));

var heartImage = require("heatshrink").decompress(atob("hUKxH+ABckAAYIDpFstlIudzpARCtmQyGXz2luYVBkgIBBQXCy4JCCYQKCtgpCE4IJCFQIyFBAwKDBAw/CAogA=="));

var gameOverImage = require("heatshrink").decompress(atob("kcV4MB+Nj/4AJwATBgfwDAV+AYUP4ADBgP4BAU/AYUHERMP+AiBgP+EQU/4AiBg/4EQX/EQUf8EH8ED/kAAIN/wEfEQ9/FwX+A=="));

var RedCar =
require("heatshrink").decompress(atob("ol7xH+ABWBqwAqwI5LABKAtIf4AClZASq0rp9zudIDYNIABgSBABd5AAtPEoNPAoUrqxDPlcAkmXy9OIYVsABYSBABWdzwAFIYVzAoMkRSJDCNAJDBkhDiuckFQOevMqklPZBo7DZAUkHagAKIoyKCkl5IwIwBwJDLYYRDrWoMAAgJDCqxDZyxDXzoABIcpAXRRRD/If5D/If5D/If5D9uYASId9OBoIAPpxDvBoRD2AAlOADlPAAckIbJ0QABjeNIf4ACkhDUIgNIUQQEBAAtyIaOXvIAFp4lBp4FBIapFCA4wACyxCRzo2BAAlzEoNzA4ZDVQ4ZDGQyRDHQ4RDgHyQAHIf5DhklIHoRDrudzA4RDNIoRDtFYRD/Iac5rsykgABaANyILQACzudIgTGClcrrowBIZ9ktdkRQhCdRQ8rGAxD/If5D/If4ACzpD/Io5D/IbOI2eIIdowBwJDP1nX1hDtGAJD/Ialkx7eCZdgwDIZ1rIdwwEIf5D/If5DZmU5mRDtGAhDNAAhDrAAhD/IaM5rrLmzpCCIYYwEIZtktdkIcpBCIYgwEIf5DZAARD/If8ylcrpFIIcd5uYpBmRDUAAUyA4JECIb9zEoNdFoZDVnJDkp5DZx+z2YHCIbudAAJDFFYOPIanX65DgIAIACIYWBFYJD/IYSHBx5DQ1idCx5DFAAjITIIjLFFYIvBwJDQLINrtc5IZOWIbq1DIaJXBslkmUHg9IAA1yRCV5AAtPg8rnIrBQ6VkbwcyDQMrAoIAEpxCRpwaGmSwBmUAg4wEIZ1rIYYdBg5DZpBDLGAt6II+BwJ8CIY85mQAFp9OACFPDQ1dIZMrHYJCFLghDHAA4lCAB85DpgwEAARD9rpDHq0rp9zAAcrmTQCIZVkroAQGoNr2YABIY4wCHAlPldWBgMky4ADkhTDIZQAV2fXIZA4JlYABQ4pDCg8HIcePAAJDCFYJDCYAoABZoOBdw0HoFAVoQAdIASKFslkIgSMEIAIACIZBBgIonXZwpDHgBDE/1Wq0rIe8rHYJDFIoRD3IJBD6vRD1AASH/AA5DWoFkAARD9IgIADoA+hrooEGQhDQAAk5IcM5FpJDNkgAGnNAaQjTTC4gACmUklQAEkhDPpFsAAoYCR68yDQ1PzwAFvJD/IbNyuVOAA1WnIAQp4aGuedzpDauWXABFIOgwAKpwdJIghDgpxD/AAVzACRDvADpD/If5D/If5D/If5D/If5D/If5D/If5DGthD/AApD/If8kkhFGuVyIMJCDp4ABIZ5FCRIyKgQgmekgzDIf5DRp1zpzOIZ4I+dZAUqldzvLLQueXuaKiIQ2elYrBAgN5IaSHBRAIADIcOdp8klSSBOgRDNHIQiBpzjDRjDIEvMkEYdzBAIPBIbUAIboiEIaWBq1WYYVyy9yZwTQGAAVOp9OABlzAAdPAAlzzuduYeBGoJCJAAcrYYZFBAAReCADUkRgeezomBaYMrIJpD/Z496YoRFEUoIAaYoQgBEIMkp+BwJCQAARkCRQKJDAD2WEoKEBgBBTZw1zIcNyIYbIRAA1WRQQABEQIAbEAQlBY6hDIAARCcpAiEIbWBlYADpAAcEQhCZAAyrCADI+hAAhCbIc+BqwAawIwS"));

var OrangeCar = require("heatshrink").decompress(atob("ol7xH+ABXGAFfHHJYAJQFpD/Ia1OgEkpwDBAAUqABYSBABd4AAskEgQFBAgOcQiQXBlQdCGhdyGowAFznGAAnHNQVO4/GRSQSCGIJDPIRhDH4xDD0SHCkhAMCAQ7BIAQbBHaYAKIoyEDKII1C45DJLIRDw0XHIYXGIa5BYZwWiIZKHDIeZFCIf5D/If5D/If5D/If4ADBQgAMIeEkBoQAOlRDvISJDnAAkklQAWDAQbGIcB0JABreNIf5DYIgJFEW4xCRJZYeBznGIagABIQYHDAAQ7SGwQAD44mCp3HBARD64xDDA4ZDbYzRDdPghDs45DQgEkHoRDrE4MkIaCKDIdYyEIf5DRzjeDaAZBaAAOcAAI9B0RmBlQqB0QwDIZvP5/ORQhCcRRAqCGAhD1Q4RD/If5D/ABOiIf6KHIf5DZ63X55DtGAhDN6/X6xDtGAPQIf5DT5/WZdwwB5xDQ54SCIdgwDIf5D/If5DZvHGAgRDrGAhDNAApDqAAhD/IaOc494Icui0RCBIYeiGAZDN5/P5xDkQgRDFGAhD/IbIABuRD/AAZD658qkkAlUqIcdyuUkkkqIaoABvAHBIgRDfFoXGFoZD+45DW6HX6+cIb+czmiIYnOFYJDU6wXB4xDfIAIACIYvQIf5DVCgPX63WZYoAEZCZBEIYnHFYLNCIaSKBvBDoFYKJCIafOIYUklQAFZKecAAsqEoOi5xDCQ6BYBCQVO5zjCAApESkgaGpwqBIwQEBFYRDPCQRD54/HDARDHzlOAAdyuTTHABd4CwIACp3HIZMAHYJCEPQpDHAAjYCTQQAPzgWCAAxDIAAJDXIgRDi5pDHpy0BXokAdoZDK56lBAB4UC64ABIY4wCHAkkkl4BgV4AAZTEIZYAUIZY4LI4IACuQUFITxDD6HQA4TpFIY7NB47vHQj4AE6yKG5w1HIAIACBpBDk6DOHIZn+lTdFIekqpxDFAALeFIeXGII5D/IeHP63X6xD/ABBD/IbIAE45Dh44tJIfHGIb9445FCaCzrGvBDXlVOAAodIISI7HknGAAtyIeQzCIZhTCIad4vEqkgAFp2cACAZGDQZDaIQIAIeZIAIlQdJ0RDkkhD/AAbbEABgcKIcwAcIf5D/If5D/If5D/If5D/If5D/If5D/If5DKI1BDVIQxD8AAMkIc+cAAJBCp0qGYRDPRVBBDAAIyEIf5DRlSbDZwtOuQ+eAAIrCNQIECIZofBRgaJfIQyED43HvBDPPYJDKRC6GD0WcAAUkFQILBIaB9EToRIJRqDIEzgiFBAR0DIZsqPgZDp46FBIZ3OGAMkkkqCogACBQIAFKwIATEQl4aIIJBD4RCJAAZ/EN4olEADCMDZAQlDIJpD/Z47pCZwQACYSgAIzg/CvEqeAPH5xCQRRoAdEoKETIdlyIbQABcgZIDADYiE45BXAAPGIcMqEQnPIbPOEAkqADgiEITIAGEogAYH0BD/ABHH4wAa5wwSA"));

var PurpleCar = require("heatshrink").decompress(atob("ol74UBitg///BIP/7lVqtUDJUVBwIABq2qABOVCCkolQJC0AwDgWolAQD1EqwBCH0EqCCdKxQuEAAkKwGhCH4Q/CGD7ECDINEAAoQIwBACgQQYwQ+EAAcC1EACAeAlQfDAAheBCG2oCBUCCB8qCCiQBdp3+fxW/CH4Q/CH4QxgQQKwAQD1QQK1QQUmQQKxiH/CBGqCB3/5WACA+j/4Qf14Q/KhWqRI0CCAv+x4QBEYcC1Wo/SpFCBtUlQQBBgISBAAUAgYQB1fVr2qCAP//8qB4WoAwIQB1WVCCEoFwIQCAA36GwMo1AQOlQQM+QQCqWq1YPIAAPqKgYQOqwQOiqpBCBi6DCH4QDYoIOH/gKBCAs/CD2AZoISEBwUAgAQYAYIABgWqfIIQGAAISBAAQHCCDIAICH4Q/CH4Q/CAWoB5UKCB8qCCmK0AxJwQQDgQQKwAQE1Q0ICAuAlQQHlQrBCCdy1EK1QABCAmq0EKgoQBqofBIoIAFWYMqB4QQRuQ5BCAxlBxoQDqyHKyoQUZpLJDCBmq1oQFvRTGAAOlCApFBB4xBFCCdUIY3VBgY="));

var LightGreenCar = require("heatshrink").decompress(atob("ol74UBocF///BIP1z9VqtUDJUVBwIABq2qABOVCCkolQJC0AwDgWolAQD1EqwBCH0EqCCdKxQuEAAkKwGhCH4Q/CGD7ECDINEAAoQIwBACgQQYwQ+EAAcC1EACAeAlQfDAAheBCG2oCBUCCB8qCCiQBdp3+fxW/CH4Q/CH4QxgQQKwAQD1QQK1QQUmQQKxiH/CBGqCB3/5WACA+j/4Qf14QxKjGqRI0CCAv+x4QBEYcC1Wo/SpFCBtUlQQBBgISBAAQGBCAOo6te1QQB///lQPC1AGBCAOqyoQQlAuBCAXPAQIAD/Q2BlGoCAgAGCAUqCBnyCAVS1WrB5AAB9RUDCB1WCB0VVIIQMXQYQ/CAbFBBw/8BQIQFn4QewDNBCQgOCgEACDADBAAMC1T5BCAwABCQIACA4QQZABAQ/CH4Q/CH4QC1APKhQQPlQQUxWgGJOCCAcCCBWACAmqGhAQFwEqCA8qFYIQTuWohWqAAIQE1WghUFCANVD4JFBAAqzBlQPCCCNyHIIQGMoONCAdWQ5WVCCjNJZIYQM1WtCAt6KYwAB0oQFIoIPGIIoQTqhDG6oMDA"));

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function moveEnemyPosition(){
  score += 1;
  randomRoadPositionIndicator = getRandomInt(1, 4);
  if ((randomRoadPositionIndicator == 1)) {
    randomRoadPosition = 85;
  }else if((randomRoadPositionIndicator == 2)){
    randomRoadPosition = 120;
  }else {
    randomRoadPosition = 155;
  }
}

function collision(){
  if(gameStatus == GAMEPLAYING){
    if
    (
      (enemyCarFrontY > playerCarFrontY) 
      &&
      (
        (enemyCarLeftX > playerCarLeftX && enemyCarLeftX < playerCarRightX)
        ||
        (enemyCarRightX > playerCarLeftX && enemyCarRightX < playerCarRightX)
      )
    ){
      // hit
      setTimeout(collision, 2500); // wait 2.5 second for the function to actiavte agian.
      numberofHearts -= 1; 
      score -= 1;
      Bangle.buzz();
    }else{
      // miss
      setTimeout(collision, 1); // try again in 1 milliseconds.
    }
  }
}

function storeMyData(data) {
  // ensure there are less than 500 elements in the array
  while (log.length >= 500) log.shift();
  // append a new item to the array
  log.push(data);
}


var file = require("Storage").open("CarCrazy.csv","r");
var currentHighScore = file.readLine();
if (currentHighScore == undefined) currentHighScore = 0;
var BackgroundStartingPosition = 75;
var carScale = 0.5;
var accel = Bangle.getAccel();
var playerCarPosition = 120-accel.x*40;
var BackgroundYPosition = BackgroundStartingPosition;
var randomRoadPositionIndicator = getRandomInt(1, 3);
var randomRoadPosition = 120;
var enemyPositonY = 30;
var carWidth = 30;
var carHeight = 60;
var playerCarY = 130;
var enemyCarLeftX;
var enemyCarRightX;
var playerCarLeftX;
var playerCarRightX;
var enemyCarFrontY;
var playerCarFrontY;
var GAMEPLAYING = 1;
var GAMEOVER = 2;
var GAMESTART = 3;
var gameStatus = GAMESTART;
var score = 0;

moveEnemyPosition();
collision();


g.setFontAlign(-1,-1);

function clearHighScore() {
  currentHighScore  = 0;
  file = require("Storage").open("CarCrazy.csv","w");
  file.erase();
}

function draw(){
  if(gameStatus == GAMEPLAYING){
    BackgroundYPosition += 10;
    accel = Bangle.getAccel();
    playerCarPosition = 120-accel.x*40;
    g.flip();
    g.drawImage(backgroundImage,125,BackgroundYPosition, {scale:13,rotate:0});
    g.drawImage(RedCar,playerCarPosition,playerCarY, {scale:carScale,rotate:3.142});
    g.drawImage(OrangeCar,randomRoadPosition,enemyPositonY, {scale:carScale,rotate:0});

    if(numberofHearts==3){
    g.drawImage(heartImage,10,10, {scale:2,rotate:0});
    g.drawImage(heartImage,10,50, {scale:2,rotate:0});
    g.drawImage(heartImage,10,30, {scale:2,rotate:0});
    }else if(numberofHearts==2){
    g.drawImage(heartImage,10,50, {scale:2,rotate:0});
    g.drawImage(heartImage,10,30, {scale:2,rotate:0});
    }else if(numberofHearts==1){
    g.drawImage(heartImage,10,50, {scale:2,rotate:0});
    }else{
      gameStatus = GAMEOVER;
      //clearHighScore();
      if(score >= currentHighScore){
        currentHighScore = score;
        file = require("Storage").open("CarCrazy.csv","w");
        file.erase();
        file = require("Storage").open("CarCrazy.csv","w");
        file.write(currentHighScore+"\n");
      }
    }

    playerCarFrontY = playerCarY-carHeight/2;
    playerCarBackY = playerCarY+carHeight/2;
    playerCarLeftX = playerCarPosition-carWidth/2;
    playerCarRightX = playerCarPosition+carWidth/2;

    enemyCarFrontY = enemyPositonY+carHeight/2;
    enemyCarBackY = enemyPositonY-carHeight/2;
    enemyCarLeftX = randomRoadPosition-carWidth/2;
    enemyCarRightX = randomRoadPosition+carWidth/2;

    //g.drawRect(playerCarLeftX, playerCarFrontY, playerCarRightX, playerCarBackY);
    //g.drawRect(enemyCarLeftX, enemyCarFrontY, enemyCarRightX, enemyCarBackY);

    g.setColor(0,0,0);
    g.drawString("Score:  "+score,180,5);
    g.drawString("HighScore:",178,15);
    g.drawString(currentHighScore,205,25);

    if(BackgroundYPosition > 170){
      BackgroundYPosition = BackgroundStartingPosition;
    }


  }else if(gameStatus == GAMEOVER){

    BackgroundYPosition += 10;
    g.flip();
    g.drawImage(backgroundImage,125,BackgroundYPosition, {scale:13,rotate:0});
    g.drawImage(gameOverImage,125,80, {scale:8,rotate:0});
    if(BackgroundYPosition > 170){
      BackgroundYPosition = BackgroundStartingPosition;
    }
    g.setColor(255,0,0);
    g.setFont("6x8",4);
    g.drawString("Game Over",13,17);
    g.setFont("6x8",1.5);
    g.drawString("Score: "+score,10,75);
    g.drawString("High",10,100);
    g.drawString("Score:  " + currentHighScore,10,110);
    g.drawString("Hold Button",10,130);
    g.drawString("2 To Play",10,140);
    g.drawImage(LightGreenCar,180,115, {scale:0.5,rotate:3});
    g.drawImage(PurpleCar,215,115, {scale:0.5,rotate:3});
  }else if(gameStatus == GAMESTART){
    g.flip();
    g.drawImage(backgroundImage,125,BackgroundYPosition, {scale:13,rotate:0});
    g.setColor(255,0,0);
    BackgroundYPosition += 10;
    g.setFont("6x8",3);
    g.drawImage(gameOverImage,125,80, {scale:8,rotate:0});
    g.drawString("Welcome to",13,11);
    g.drawString("Car Crazy",13,31);
    g.setFont("6x8",1.8);
    g.drawString("High",10,80);
    g.drawString("Score: "+currentHighScore,10,90);
    g.drawString("Hold Button",10,120);
    g.drawString("2 To Start",10,130);
    g.drawImage(LightGreenCar,180,115, {scale:0.5,rotate:3});
    g.drawImage(PurpleCar,215,115, {scale:0.5,rotate:3});
    //setTimeout(displayPopup, 3000);
  }
}
setInterval(draw ,10);


function moveEnemyCar(){
  if(gameStatus == GAMEPLAYING){
    enemyPositonY = enemyPositonY + 10;
    if((enemyPositonY > 200)){
    enemyPositonY = 30;
      moveEnemyPosition();
    }
  }
}
setInterval(moveEnemyCar,10);

setWatch(() => {
  if(gameStatus == GAMESTART){
    gameStatus = GAMEPLAYING;
    collision();
    enemyPositonY = 0;
    score = 0;
  }else if(gameStatus == GAMEOVER){
    gameStatus = GAMEPLAYING;
    collision();
    enemyPositonY = 0;
    numberofHearts = 3;
    score = 0;
  }
}, BTN2, {repeat:true});







