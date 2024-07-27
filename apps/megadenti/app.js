var counter = 10;
var counterInterval;

var img = Graphics.createImage(`

      #####    #####
    #     #####     #
    #               #
    #               #
     ##           ##
      ##         ##
      ##        ##
       #  ####  #
       #  #  #  #
       #  #  #  #
        ##    ##
        ##    ##
`);
var img1 = Graphics.createImage(`


 ### #    #####    ##   ####
#    #    #       #  #  #  #
#    #    ###    #    # ####
#    #    #      ###### #  #
 ### #### #####  #    # #   #

        #####    #####                   
      #     #####     #               
      #               #             
      #               #
       ##           ##                  
        ##         ##
        ##        ##
         #  ####  #
         #  #  #  #                        
         #  #  #  #
          ##    ##                  
          ##    ##
`);
g.setColor('#012345');

function outOfTime() {
  if (counterInterval) return;
  E.showMessage("Out of Time", "My Timer");
  Bangle.beep(200, 4000)
    .then(() => new Promise(resolve => setTimeout(resolve,200)))
    .then(() => Bangle.beep(200, 3000));
  // again, 10 secs later
  setTimeout(outOfTime, 10000);
  g.setColor('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
}

function immagine(){
 g.drawImage(img1, 90, 20, {scale:2}); 
}

function countDown() {
  counter--;
  // Out of time
  if (counter<=0) {
    clearInterval(counterInterval);
    counterInterval = undefined;
    setWatch(startTimer, (process.env.HWVERSION==2) ? BTN1 : BTN2);
    g.clear(img);
    outOfTime();
    return;

  }
  g.clear(1);
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",80); // vector font, 80px 
  // draw the current counter value
  g.drawImage(img, 90, 20, {scale:2});
  g.drawString(counter,120,120);
  g.drawLine(50,50,180,50);
  g.drawLine(50,51,180,51);
  g.drawLine(50,52,180,52);
  // optional - this keeps the watch LCD lit up
  Bangle.setLCDPower(1);
  if (counter<=5){
    immagine();
  }
}



function startTimer() {
  counter = 10;
  countDown();
  if (!counterInterval)
    counterInterval = setInterval(countDown, 1000);


}


startTimer();
