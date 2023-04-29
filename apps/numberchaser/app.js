var randomNumber;
var guessNumber = 1;

function mathRandomInt(a, b) {
  if (a > b) {
    // Swap a and b to ensure a is smaller.
    var c = a;
    a = b;
    b = c;
  }
  return Math.floor(Math.random() * (b - a + 1) + a);
}

/**
 * Describe this function...
 */
function game() {

  g.drawString('',0,20,true);
  E.showMenu(numMenu);
  console.log(randomNumber);
}

var numMenu = {
   "" : {
    "title" : "Number Chaser",
  },
  "Guess Number" : {
    value : guessNumber,
    min:1,max:100,step:1,
    onchange : v => { guessNumber=v; }
  },
  "OK" : function () {
    g.clear();
    if (guessNumber == randomNumber) {
      //if guess is correct
      g.setFont("Vector",13);g.setFontAlign(-1,-1);
      status = "You won! ";
      gameOver();
    } else {
      //if guess is incorrect
      g.setFont("Vector",13);g.setFontAlign(-1,-1);
      if (guessNumber > randomNumber) {
        //Decreases number if guess is greater
        randomNumber = randomNumber - 1;
        status = "Too high!";
      } else if (guessNumber < randomNumber) {
        //Increases number if guess is lower
        status = "Too low!";
        randomNumber = randomNumber + 1;
      }
      if (randomNumber < 0 || randomNumber > 100) {
        //You lose when the number is out of the 1 to 100 range
        g.setFont("Vector",13);g.setFontAlign(-1,-1);
        g.drawString('You have lost\nNumber is out\nof range.',10,10,true);
        status = "You lost!";
      } else {
        g.drawString(status+"\nTry again!",10,10);
        Bangle.on('tap', function() {
          delay(3000).then(() => game());
        }
       );
      }
    }
  }   
};

function gameOver() 
{
  E.showPrompt(status+'Play again?',{title:""+'Number Chaser'}).then(function(a)   {
      if (a) { 
        randomNumber = mathRandomInt(1, 100);
        game();
      } else {
        load(); 
      }
    }
  );
}

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function instructions()
{
  g.setFont("Vector",13);g.setFontAlign(-1,-1);
  g.drawString('Guess the number\nbetween 1 and 100.\nGuess too high, it\ndecreases by 1.\nToo low, it increases\nby 1.\nIf the number\ngoes below 0 or\nabove 100, it\nis out of range\nand you have\nlost.',10,10,true);
  randomNumber = mathRandomInt(1, 100); 
  delay(10000).then(() => game());
}


g.clear();
E.showPrompt('Do you need instructions?',{title:""+'Number Chaser'}).then(function(a) 
  { if (a) {
    instructions(); 
  } else 
  {   
     randomNumber = mathRandomInt(1, 100);
     game(); 
   }
  }
);
