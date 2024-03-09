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

function consoleDebug(message) {
  //console.log(message);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function moveEnemyPosition(){
  score += 1;
  checkForNextLevel();
  if(level == 1){
    randomRoadPositionIndicator = getRandomInt(1, 4);
    if ((randomRoadPositionIndicator == 1)) {
      enemyPositonCenterX = 85;
    }else if((randomRoadPositionIndicator == 2)){
      enemyPositonCenterX = 120;
    }else {
      enemyPositonCenterX = 155;
    }
  }else if(level == 2||level==3){
    enemyPositonCenterX = getRandomInt(85, 155);
  }else if(level == 4 || level == 5 || level == 6 || level == 8 || level == 9 || level == 10 || level > 10){
    do{
      randomRoadPositionIndicator = getRandomInt(1, 4);
      randomRoadPositionIndicator2 = getRandomInt(1, 4);
    }while(randomRoadPositionIndicator==randomRoadPositionIndicator2);

    if ((randomRoadPositionIndicator == 1)) {
      enemyPositonCenterX = 85;
    }else if((randomRoadPositionIndicator == 2)){
      enemyPositonCenterX = 120;
    }else if((randomRoadPositionIndicator == 3)){
      enemyPositonCenterX = 155;
    }

    if ((randomRoadPositionIndicator2 == 1)) {
      enemyPositonCenterX2 = 85;
    }else if((randomRoadPositionIndicator2 == 2)){
      enemyPositonCenterX2 = 120;
    }else if((randomRoadPositionIndicator2 == 3)){
      enemyPositonCenterX2 = 155;
    }
  } // TODO: else if(level == 7)
}

function collision(){
  if(gameStatus == GAMEPLAYING){
    consoleDebug("Px:"+playerCarLeftX+", "+playerCarRightX);
    consoleDebug("1x:"+enemyCarLeftX+", "+enemyCarRightX);
    consoleDebug("2x:"+enemyCarLeftX2+", "+enemyCarRightX2);
    consoleDebug("Py:"+playerCarFrontY);
    consoleDebug("1y:"+enemyCarFrontY);
    consoleDebug("2y:"+enemyCarFrontY2);
    if
    (
      (enemyCarFrontY < 300 && enemyCarFrontY > playerCarFrontY)
      &&
      (
        (enemyCarLeftX > playerCarLeftX && enemyCarLeftX < playerCarRightX)
        ||
        (enemyCarRightX > playerCarLeftX && enemyCarRightX < playerCarRightX)
      )
    ){
      // hit car 1
      consoleDebug("1 HIT");
      enemyPositonCenterY = 300;
      numberofHearts -= 1;
      Bangle.buzz(50,50);
    }else if
    (
      (enemyCarFrontY2 < 300 && enemyCarFrontY2 > playerCarFrontY)
      &&
      (
        (enemyCarLeftX2 > playerCarLeftX && enemyCarLeftX2 < playerCarRightX)
        ||
        (enemyCarRightX2 > playerCarLeftX && enemyCarRightX2 < playerCarRightX)
      )
    ){
      // hit car 2
      consoleDebug("2 HIT");
      enemyPositonCenterY2 = 300;
      numberofHearts -= 1;
      Bangle.buzz(50,50);
    }
    setTimeout(collision, 50); // try again in 50 milliseconds.
  }
}

function checkForNextLevel(){
  if(score < 10){
    level = 1;
  }else if(score >= 10 && score < 20){
    level = 2;
  }else if(score >= 20 && score < 30){
    level = 3;
  }else if(score >= 30 && score < 40){
    level = 4;
  }else if(score >= 40 && score < 50){
    level = 5;
  }else if(score >= 50 && score < 60){
    level = 6;
  }else if(score >= 60 && score < 70){
    level = 7;
  }else if(score >= 70 && score < 80){
    level = 8;
  }else if(score >= 80 && score < 90){
    level = 9;
  }else if(score >= 90){
    level = 10;
  }
}

var accel = Bangle.getAccel();

var file = require("Storage").open("CarCrazy.csv","r");
var currentHighScore = file.readLine();
if (currentHighScore == undefined) currentHighScore = 0;

var BackgroundStartingPosition = 75;
var BackgroundYPosition = BackgroundStartingPosition;

var randomRoadPositionIndicator;
var randomRoadPositionIndicator2;
var enemyPositonCenterX;
var enemyPositonCenterX2;

var carScale = 0.5;
var carWidth = 30;
var carHeight = 60;

var playerCarCenterY = 130;
var playerCarCenterX;

var enemyPositonCenterY = 0 - carHeight/2;
var enemyPositonCenterY2 = 0 - carHeight/2;

var playerCarLeftX;
var playerCarRightX;
var playerCarFrontY;

var playerCarFrontY;
//var playerCarBackY;
var playerCarLeftX;
var playerCarRightX;

var enemyCarFrontY;
//var enemyCarBackY;
var enemyCarLeftX;
var enemyCarRightX;

var enemyCarFrontY2;
//var enemyCarBackY2;
var enemyCarLeftX2;
var enemyCarRightX2;

var GAMEPLAYING = 1;
var GAMEOVER = 2;
var GAMESTART = 3;
var gameStatus = GAMESTART;
var score = 0;
var level = 1;


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
    playerCarCenterX = Math.round(120-accel.x*120);
    if (playerCarCenterX > 170) { playerCarCenterX = 170; }
    if (playerCarCenterX < 70) { playerCarCenterX = 70; }
    g.flip();
    g.drawImage(backgroundImage,125,BackgroundYPosition, {scale:13,rotate:0});
    g.drawImage(RedCar,playerCarCenterX,playerCarCenterY, {scale:carScale,rotate:3.142});
    g.drawImage(OrangeCar,enemyPositonCenterX,enemyPositonCenterY, {scale:carScale,rotate:0});
    if(level>=4){
      g.drawImage(OrangeCar,enemyPositonCenterX2,enemyPositonCenterY2, {scale:carScale,rotate:0});
    }

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

    playerCarFrontY = playerCarCenterY-carHeight/2;
    //playerCarBackY = playerCarCenterY+carHeight/2;
    playerCarLeftX = playerCarCenterX-carWidth/2;
    playerCarRightX = playerCarCenterX+carWidth/2;

    enemyCarFrontY = enemyPositonCenterY+carHeight/2;
    //enemyCarBackY = enemyPositonCenterY-carHeight/2;
    enemyCarLeftX = enemyPositonCenterX-carWidth/2;
    enemyCarRightX = enemyPositonCenterX+carWidth/2;

    enemyCarFrontY2 = enemyPositonCenterY2+carHeight/2;
    //enemyCarBackY2 = enemyPositonCenterY2-carHeight/2;
    enemyCarLeftX2 = enemyPositonCenterX2-carWidth/2;
    enemyCarRightX2 = enemyPositonCenterX2+carWidth/2;

    g.setColor(255,0,0);
    //g.drawRect(playerCarLeftX, playerCarFrontY, playerCarRightX, playerCarBackY);
    //g.drawRect(enemyCarLeftX, enemyCarFrontY, enemyCarRightX, enemyCarBackY);
    //g.drawRect(enemyCarLeftX2, enemyCarFrontY2, enemyCarRightX2, enemyCarBackY2);

    g.setColor(0,0,0);
    g.drawString("Score:  "+score,180,5);
    g.drawString("HighScore:",178,15);
    g.drawString(currentHighScore,205,25);
    g.drawString("Level: "+level,180,150);

    //g.drawString("P:"+playerCarLeftX+", "+playerCarRightX,180,90);
    //g.drawString("1:"+enemyCarLeftX+", "+enemyCarRightX,180,100);
    //g.drawString("2:"+enemyCarLeftX2+", "+enemyCarRightX2,180,110);
    //g.drawString("P:"+playerCarFrontY,180,120);
    //g.drawString("1:"+enemyCarFrontY,180,130);
    //g.drawString("2:"+enemyCarFrontY2,180,140);

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
  }
}
setInterval(draw, 50);


function moveEnemyCar(){
  if(gameStatus == GAMEPLAYING){
    if(level==1||level==2){
      enemyPositonCenterY = enemyPositonCenterY + 10;
      enemyPositonCenterY2 = 0;
    }else if(level==3){
      enemyPositonCenterY = enemyPositonCenterY + 12;
      enemyPositonCenterY2 = 0;
    }else if(level==4){
      enemyPositonCenterY = enemyPositonCenterY + 8;
      enemyPositonCenterY2 = enemyPositonCenterY2 + 8;
    }else if(level==5){
      enemyPositonCenterY = enemyPositonCenterY + 9;
      enemyPositonCenterY2 = enemyPositonCenterY2 + 9;
    }else if(level==6){
      enemyPositonCenterY = enemyPositonCenterY + 9.5;
      enemyPositonCenterY2 = enemyPositonCenterY2 + 8;
    }else if(level==7){
      enemyPositonCenterY = enemyPositonCenterY + 10;
      enemyPositonCenterY2 = enemyPositonCenterY2 + 8;
    }else if(level==8){
      enemyPositonCenterY = enemyPositonCenterY + 11.5;
      enemyPositonCenterY2 = enemyPositonCenterY2 + 11.5;
    }else if(level>=9){
      enemyPositonCenterY = enemyPositonCenterY + 13;
      enemyPositonCenterY2 = enemyPositonCenterY2 + 14;
    }
    if(enemyPositonCenterY > 200){
      enemyPositonCenterY = 300;
    }
    if(enemyPositonCenterY2 > 200){
      enemyPositonCenterY2 = 300;
    }
    if(enemyPositonCenterY > 200 && (enemyPositonCenterY2 > 200 || level < 4)){
      enemyPositonCenterY = 0 - carHeight/2;
      if (level >= 4) { enemyPositonCenterY2 = 0 - carHeight/2; }
      moveEnemyPosition();
    }
  }
}
setInterval(moveEnemyCar,50);

setWatch(() => {
  if(gameStatus == GAMESTART){
    gameStatus = GAMEPLAYING;
    collision();
    numberofHearts = 3;
    enemyPositonCenterX = 120;
    enemyPositonCenterY = 0 - carHeight/2;
    enemyPositonCenterX2 = 120;
    enemyPositonCenterY2 = 0 - carHeight/2;
    score = 0;
    level = 1;
    checkForNextLevel();
  }else if(gameStatus == GAMEOVER){
    gameStatus = GAMEPLAYING;
    collision();
    enemyPositonCenterX = 120;
    enemyPositonCenterY = 0 - carHeight/2;
    enemyPositonCenterX2 = 120;
    enemyPositonCenterY2 = 0 - carHeight/2;
    numberofHearts = 3;
    score = 0;
    level = 1;
    checkForNextLevel();
  }
}, BTN2, {repeat:true});
