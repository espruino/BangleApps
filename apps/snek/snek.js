function init() {
  this.titleScreen = true;
  this.min = 0;
  this.max = 160;
  this.step = 20;
  this.scoreMultiplier = 25;
  this.totalGrid = this.max / this.step;

  if (g.theme.dark) {
    this.textColor = 1;
  } else {
    this.textColor = 0;
  }

  this.getNewPosistion = () => {
    let newPos;
    while (!newPos) {
      // random bonus points for bad luck / lag
      if (currentPosition.length > 10) {
        this.score += 1;
      }
      const x = Math.floor(Math.random() * this.totalGrid + 1) * this.step;
      const y = Math.floor(Math.random() * this.totalGrid + 1) * this.step;
      const found = currentPosition.find(pos => {
        return pos.x === x && pos.y === y;
      });
      if (!found) {
        newPos = {x: x, y: y};
      }
    }
    return newPos;
  };

  this.restart = () => {
    g.clear();
    this.titleScreen = false;
    this.score = 0;
    this.paused = false;
    this.currentPosition = [{x: 2 * step, y: 3 * step},{x: 1 * step, y: 3 * step}];
    this.death = false;
    this.gameSpeed = 200;
    this.directionSet = null;
    this.direction = 1;
    this.createApple();
  };

  const game = () => {
    if (this.death && !this.paused) {
      g.clear();
      this.showDeathScreen();
    } else if (this.titleScreen && !this.paused) {
        this.showTitleScreen();
    } else if (!this.paused) {
      g.clear();
      this.drawApple();
      this.drawSnake();
      this.boundries();

    }

    setTimeout(() => {
      game();
    }, this.gameSpeed);
  };

  this.increaseDifficulity = () => {
    if (gameSpeed > 59) {
      gameSpeed -= 10;
    }
  };
      
  this.createApple = () => {
    this.applePosition = getNewPosistion();
  };
  
  this.drawApple = () => {
    g.setColor(0, 1, 0);
  
    g.drawImage(this.appleLeaf, this.applePosition.x - 15, this.applePosition.y - 10);
    g.setColor(1, 0, 0);

    g.drawImage(this.apple, this.applePosition.x - 15, this.applePosition.y - 2);
  };

  this.checkmax = (x) => {
    if (x > this.max) {
      return this.min;
    } else if (x < this.min) {
      return  this.max;
    }
    return x;
  };

  this.movement = (lastItem) => {
    let newPosition;
    switch(this.direction) {
      case 3:
        newPosition = {
          x: checkmax(lastItem.x + this.step),
          y: lastItem.y
        };
        break;
      case 1:
        newPosition = {
          x: checkmax(lastItem.x - this.step),
          y: lastItem.y
        };
        break;
      case 2:
        newPosition = {
          x: lastItem.x,
          y: checkmax(lastItem.y + this.step)
        };
        break;
      case 0:
        newPosition = {
          x: lastItem.x,
          y: checkmax(lastItem.y - this.step)
        };
        break;
    }
    this.directionSet = false;
    this.checkDeath(newPosition);
    this.currentPosition.push(newPosition);
    
  };

  this.snakeHead = (props) => {
    switch (this.direction) {
      case 0:
        return [this.snakeUp, props.x - 9, props.y - 12];
      case 1:
        return [this.snakeLeft, props.x - 20, props.y - 10];
      case 3:
        return [this.snakeRight, props.x - 12, props.y - 12];
      case 2:
        return [this.snakeDown, props.x - 12, props.y - 7];
      default:
        return [this.snakeDown, props.x - 12, props.y - 7];
    }
  };

  this.drawSnake = () => {
    const totalItems = this.currentPosition.length - 1;
    g.setColor(0, 1, 0);
    this.movement(this.currentPosition[totalItems]);
    this.currentPosition.forEach((props, index) => {
      if (index-1 === totalItems) {
        const head = this.snakeHead(props);

        g.drawImage(head[0], head[1], head[2]);
      } else {
        g.fillCircle(props.x, props.y, 10);
      }
    });
    if (this.currentPosition[totalItems].x === this.applePosition.x && this.currentPosition[totalItems].y === this.applePosition.y) {
      this.createApple();
      this.increaseDifficulity();
    } else {
      this.currentPosition.shift();
    }
  };

  this.checkDeath = (newPos) => {
    
    const found = this.currentPosition.find((oldPos) => {          
      return newPos.x === oldPos.x && newPos.y === oldPos.y;
    });
    if (found) {
      Bangle.buzz();
      g.clear();
      this.death = true;
    }
  };

  this.boundries = () => { 
    if (this.currentPosition.x >= this.maxPx) {
      this.currentPosition.x = this.maxPx;
    }
    else if (this.currentPosition.x < 10) {
      this.currentPosition.x = 10;
    }
    
    if ( this.currentPosition.y >= this.maxPy) {
      this.currentPosition.y = this.maxPy;
    } else if (this.currentPosition.y < 10) {
      this.currentPosition.y = 10;
    }
  };

  this.creatTopScrore = () => {
      require("Storage").writeJSON("snek_jd", {
      topScore: this.calculateScore()
    });
  };

  this.calculateScore = () => {
    return currentPosition.length * this.scoreMultiplier + this.score;
  }; 

  this.showDeathScreen = () => {
    this.paused = true;
    g.setFont('Vector', 25);
    g.setColor(1, 0, 0);
    g.drawString("GAME OVER",15, 50, "solid");
    g.setFont('Vector', 15);
    g.setColor(this.textColor, this.textColor, this.textColor);
    g.drawString("Score : " + this.calculateScore(), 50, 78, "solid");
    
    let storage = require("Storage").readJSON("snek_jd");
    if (storage && storage.topScore) {
      if (storage.topScore < this.calculateScore()) {
        g.setColor(0, 1, 1);
        g.drawString("New top score!", 20, 95, "solid");
        g.setFont('Vector', 22);
        g.drawString(this.calculateScore(), 20, 115, "solid");
        
        this.creatTopScrore();
      } else {
        g.setColor(this.textColor, this.textColor, this.textColor);
        g.drawString("Top score : " + storage.topScore, 20, 95, "solid");
      }
    } else {
      this.creatTopScrore();
    }
    g.setFont('Vector', 25);
  };

  /* Events */
  Bangle.on('tap', (data) => { 
    Bangle.setLCDPower(true);
    if (this.death) {
      this.showTitleScreen();
    } else if (this.titleScreen || this.paused) {
      this.restart();
    }
  });

  Bangle.on('accel', (xyz) => {
    if (Math.abs(xyz.x) > Math.abs(xyz.y)) {
      if (xyz.x < 0) {
        if (!this.directionSet && this.direction !== 1) {  
          Bangle.setLCDPower(true);
          this.direction = 3;
        }
      } else {
        if (!this.directionSet && this.direction !== 3) {
          Bangle.setLCDPower(true);
          this.direction = 1;
        }
      }
    } else {
      if (xyz.y < 0) {
        if (!this.directionSet && this.direction !== 0) {
          Bangle.setLCDPower(true);
          this.direction = 2;
        }
      } else {
        if (!this.directionSet && this.direction !== 2) {
          Bangle.setLCDPower(true);
          this.direction = 0;
        }
      }
    }
    this.directionSet = true;
  });

  this.showTitleScreen = () => {
    this.death = false;
    g.clear();
    g.setColor(0, 1, 0);
    g.setFont('Vector', 50);
    g.drawString("nek", 70, 15, "solid");
    g.drawImage(this.titleScreenImg, 20, 20);
    g.fillPoly([
      15, 66,
      152, 70,
      159, 79,
      21, 71 ]);
    g.setColor(this.textColor, this.textColor, this.textColor); 
    g.setFont('Vector', 15);
    g.drawString("Tilt to turn", 20, 100, "solid");
    g.drawString("Tap to start", 20, 120, "solid");

    g.setColor(0, 1, 0);
   
    g.setFont('4x6', 3);
    g.drawString("Jason de Belle", 5, 145, "solid");
 
   

  };

/* Graphics */
  this.snakeUp = Graphics.createImage(`
        XX    XX
        xx    xx
         xx  xx
           xx
           xx
           xx
           xx
           xx
        xxxxxxxx
       xxxx   xxxx
      xxxxxx xxxxxxx
    xxxxxxxxxxxxxxxx
   xxxxx  xXXx  xxxxx
  xxxxx    XX    xxxxx
  xxxxx    XX    xxxxx
  xxxxxx  xxxx  xxxxx
    xxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxx
      xxxxxxxxxxxxx
       xxxxxxxxxxx
  `);
  this.snakeDown = Graphics.createImage(`
      xxxxxxxxxx
      xxxxxxxxxx
      xxxxxxxxxx
    xxxxxxxxxxxxxx
    xxxxxxxxxxxxxx
    xxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxx
 xxxxxx  xxxx  xxxxxx
 xxxxxx  xxxx  xxxxxx
  xxxx    XX    xxxxx
  xxxx    XX    xxxxx
   xxxx  xXXx  xxxx
   xxxx  xXXx  xxxx
    xXxxxxxxxxxxxx
    xXxxxxxxxxxxxx
      xxx    xxx
      xxxx  xxxx
         xxxx
          xx
          xx
          xx
          xx
         x  x
        xx  xx
        xx  xx
      `);

  this.snakeRight = Graphics.createImage(`
      xxxxxxxxxx
      xxxxxxxxxx
     xxxxxxxxxxxx
     xxxxxxxxxxxx
    xXxxxxxx  xxxx
    xXxxxxxx  xxxx
   xxxxxxxX    xxx
   xxxxxxxX    xxx            xxxx
xxxxxxxxxxXX  xxxxxx         xxxx
xxxxxxxxxxXX  xxxxxx       xx
xxxxxxxxxxXXxxxxx  xxxxxxxx
xxxxxxxxxxXXxxxxx  xxxxxxxx
xxxxxxxxxxxx  xxxxx        xx
xxxxxxxxxxxx  xxxxx          xxx
    xxxxxxxx    xx            xxxx
    xxxxxxxx    xx
    xxxxxxxx  xxx
    xxxxxxxx  xxx
     xxxxxxxxxxx
     xxxxxxxxxxx
      xxxxxxxxx
      xxxxxxxxx
  `);
  this.snakeLeft = Graphics.createImage(`
                 xxxxxxxxxx
                 xxxxxxxxxx
                xxxxxxxxxxxx
                xxxxxxxxxxxx
                xXxxxxxxxxxxxx
                xX  xxxxxxxxxx
  x            xx    xXxxxxxxxx
    xx         xx    xXxxxxxxxx
  xx  xx      xxxx  xxXXxxxxxxxx
        xxxxxxx  xxxxxXXxxxxxxxx
        xxxxxxx  xxxxxXXxxxxxxxx
  xx  xx      xxxx  xxXXxxxxxxxx
    xx        xxx    xxxxxxxxxx
  x           xxx    xxxxxxxxx
              xxxx  xxxxxxxxx
              xxxx xxxxxxxxxx
                xxxxxxxxxxxxx
                xxxxxxxxxxxxx
                xxxxxxxxxxx
                xxxxxxxxxxx
                 xxxxxxxxx
                 xxxxxxxxx
  `);

  this.apple = Graphics.createImage(`
        xxxxxxxxxx
       xxxxxxxxxxxx
      xxxxxxxxxxxxxx
      xxxxxxxxxxxxxx
     xxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxx
    xxxxxxxxxxxxxxxxxx
     xxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxx
      xxxxxxxxxxxxxx
       xxxxxxxxxxxx
        xxxxxxxxxx
    `);

  this.appleLeaf = Graphics.createImage(`
                  xxxxxx
                  xxxxxx
                xxxx
          XXxxxxxxxx
          xx
          xx
          xx
          xx
          xx
  `);


this.titleScreenImg = Graphics.createImage(`
                                 sxxxxxxxs
                              xxsxxx  xxxxxs
                        xxxxxxxxsxx     xxxxsx
                 xxxxxxxxxxxxxxxsxxs      xxxxsxx
           xxxxxxxxxxxxxxxxxxxxxsxxxsssxxxxxxsxxxx
        xxxxxxxxxxxxxxxxxxxsxxxxsxxs      xxsxxx
       xxxxxxxxxxxxxxxxxxxxxxxxxsxx     xxxsxx
     xxxxxxxxxxxxxxxxxxxxx      sxxx  ssxxsx
   xxxxxxxxxxxxxxx                xxxxxxs
  xxxxxxxxxxxx                     ssss
 xxxxxxxxxxxxx
xxxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
 xxxxxxxxxxxxx
  xxxxxxxxxxxxx
    xxxxxxxxxxxxx
       xxxxxxxxxxxxx
          xxxxxxxxxxxxx
             xxxxxxxxxxxxx
                xxxxxxxxxxxxx
                     xxxxxxxxxxxxx
                         xxxxxxxxxxxx
                              xxxxxxxxxxxxx
                                  xxxxxxxxxxxxx
                                   xxxxxxxxxxxxx
                                   xxxxxxxxxxxxx
                                  xxxxxxxxxxxxx
                                xxxxxxxxxxxxx
                              xxxxxxxxxxxxxx
                          xxxxxxxxxxxxx
                    xxxxxxxxxxxx
                xxxxxxxxxxx
           xxxxxxxxxxxx
       xxxxxxxxxxxx
    xxxxxxxxxxxx
 xxxxxxxxxx
xxxxxxx
xxx
`);

  game();
}
init();