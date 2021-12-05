// Scramble code from: https://raw.githubusercontent.com/bjcarlson42/blog-post-sample-code/master/Rubik's%20Cube%20JavaScript%20Scrambler/part_two.js
const makeScramble = () => {
  const options = ["F", "F2", "F'", "R", "R2", "R'", "U", "U2", "U'", "B", "B2", "B'", "L", "L2", "L'", "D", "D2", "D'"];
  const numOptions = [0, 1, 2, 3, 4, 5]; // 0 = F, 1 = R, 2 = U, 3 = B, 4 = L, 5 = D
  const scrambleMoves = [];
  let bad = true;

  while (bad) {
      let scramble = [];
      for (let i = 0; i < 20; i++) {
          scramble.push(numOptions[getRandomInt(6)]);
      }
      // check if moves directly next to each other involve the same letter
      for (let i = 0; i < 20 - 1; i++) {
          if (scramble[i] == scramble[i + 1]) {
              bad = true;
              break;
          } else {
              bad = false;
          }
      }
  }
  // switch numbers to letters
  let move;
  for (let i = 0; i < 20; i++) {
      switch (scramble[i]) {
          case 0:
              move = options[getRandomInt(3)]; // 0,1,2
              scrambleMoves.push(move);
              break;
          case 1:
              move = options[getRandomIntBetween(3, 6)]; // 3,4,5
              scrambleMoves.push(move);
              break;
          case 2:
              move = options[getRandomIntBetween(6, 9)]; // 6,7,8
              scrambleMoves.push(move);
              break;
          case 3:
              move = options[getRandomIntBetween(9, 12)]; // 9,10,11
              scrambleMoves.push(move);
              break;
          case 4:
              move = options[getRandomIntBetween(12, 15)]; // 12,13,14
              scrambleMoves.push(move);
              break;
          case 5:
              move = options[getRandomIntBetween(15, 18)]; // 15,16,17
              scrambleMoves.push(move);
              break;
      }
  }
  return scrambleMoves;
};

const getRandomInt = max => Math.floor(Math.random() * Math.floor(max)); // returns up to max - 1

const getRandomIntBetween = (min, max) => Math.floor(Math.random() * (max - min) + min);

const presentScramble = () => {
  showPrompt(makeScramble().join(" "), {
    buttons: {"solve": true, "reset": false}
  }).then((v) => {
    if (v) {
      const start = new Date();
      showPrompt(" ", {
        buttons: {"stop": true}
      }).then(() => {
        const time = parseFloat(((new Date()).getTime() - start.getTime()) / 1000);
        showPrompt(String(time.toFixed(3)), {
          buttons: {"next": true}
        }).then(() => {
          presentScramble();
        });
      });
    } else {
      presentScramble();
    }
  });
};

const showPrompt = (text, options = {}) => {
  options.title = options.title || "cube scramble";
  return E.showPrompt(text, options);
};

const init = () => {
  Bangle.setLCDTimeout(0);
  Bangle.setLCDPower(1);
  presentScramble();
};

init();
