// GPL TAMAGOTCHI CLONE FOR THE BANGLEJS2 SMARTWATCH BY pancake 2022
// TABANCHI -- たばんち

const scale = 6;
const w = g.getWidth();
const h = g.getHeight();
const yy = 34;
const y = 40 - scale;
let tool = -1;
let hd = 1;
let vd = 1;
let x = 20;
let sx = 0; // screen scroll x position
let cacaLevel = 0;
//let cacaBirth = null;
let angryState = 0;
//let animated = true;
let transition = false;
let caca = null;
let egg = null;
let mode = '';
let evolution = 1;
let callForAttention = false; // TODO : move into tama{}
let useAmPm = true;
let oldMode = '';
let gameChoice = 0;
let gameTries = 0;
let gameWins = 0;
let statusMode = 0;
let lightSelect = 0;
let lightMode = 0; // on is zero
let frame = 0;

const tama = {
  age: 0,
  weight: 1,
  aspect: 6,
  discipline: 0,
  happy: 3,
  sick: false,
  hungry: 3,
  cacas: 0,
  // hidden
  sickness: 0,
  defenses: 100,
  tummy: 100,
  awake: 3
};


g.setBgColor(0);

const sun = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('773nW9rnvfc=')
};

const tama06eat0 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////4A/vd+B7+N3g/e714P39/f39/f3++/8H/////8=')
};
const meal0 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('gXp6tbW1tYE=')
};
const meal1 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('v19htbW1tYE=')
};

const meal2 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////5+htYE=')
};
const snack0 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('358D08vA+fs=')
};
const snack1 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('///708vA+fs=')
};
const snack2 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////+vA+fs=')
};

const angry0 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////8/Pv/8=')
};

const angry1 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('8/Dg4fn/v/8=')
};

const right = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('7+eDgYPn7/8=')
};

const left = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('9+fBgcHn9/8=')
};

const img_on = {
  width: 16,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('//+M73VvdW91r3Wvjc///w==')
};

const img_off = {
  width: 16,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('//+MIXXvdGN173Xvje///w==')
};

const right0 = {
  width: 3,
  height: 5,
  bpp: 1,
  transparent: 1,
  buffer: atob('d1Y=')
};

const right1 = {
  width: 3,
  height: 5,
  bpp: 1,
  transparent: 1,
  buffer: atob('ZBY=')
};

const am = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('w7mBuf+Rqak=')
};

const pm = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('g52Dn/+Rqak=')
};
const numbers = [
  { // 0
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('lmZmnw==')
  }, { // 1
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('2d3d3w==')
  }, { // 2
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('lu23Dw==')
  }, { // 3
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('Hu3uHw==')
  }, { // 4
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('lVVQ3w==')
  }, { // 5
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('B3HuHw==')
  }, { // 6
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('l3Fmnw==')
  }, { // 7
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('Bm7d3w==')
  }, { // 8
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('lmlmnw==')
  }, { // 9
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('lmjunw==')
  }
];

const snumbers = [
  { // 0
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/4qqjw==')
  }, { // 1
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/93d3w==')
  }, { // 2
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/46Ljw==')
  }, { // 3
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/46Ojw==')
  }, { // 4
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/6qO7w==')
  }, { // 5
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/4uOjw==')
  }, { // 6
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/4uKjw==')
  }, { // 7
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/4ru7w==')
  }, { // 8
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/4qKjw==')
  }, { // 9
    width: 4,
    height: 8,
    bpp: 1,
    transparent: 1,
    buffer: atob('/4qOjw==')
  }
];

const colon = {
  width: 4,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/f/9/w==')
};

const egg00 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////////D/7n/GP8e/n9+537nfvx/OP+Z/wD/////8=')
};

const h24 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('ldWxnf/bw9s=')
};

const discipline = {
  width: 32,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('///v/x//7/9v/i//akqqI27erqtqWiqja1rqrxpK6qM=')
};

const linebar = {
  width: 32,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////4AAAA9////3f///93////d////3f///94AAAA8=')
};

const hungry = {
  width: 32,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////2////9qiKr/aqqa/wqquv9qqLz/aK6+/2/4+f8=')
};

const happy = {
  width: 32,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////2/iP/9v6qv/bGqr/w9iK/9obvP/a277/2yu5/8=')
};

const vs = {
  width: 16,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('Uf9V/1f/W/9d/7X/sf///w==')
};

const egg01 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('///////////8P/uf8Y/x7+P37nfud/PP+Z/gB/////8=')
};

const tama06no0 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('//////w/+9/3gey974Hv3e/B7/fv9+/39+/4H/////8=')
};

const tama06no1 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('//////w/+9+B7703gfe794P37/fv9+/39+/4H/////8=')
};

const caca00 = {
  width: 12,
  height: 12,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////733v72/+f4vw3wH////')
};

const caca01 = {
  width: 12,
  height: 12,
  bpp: 1,
  transparent: 1,
  buffer: atob('////v/33v7+3+f4v0HwH////')
};

const tama00 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('///////////8H/vv9oHvveuB793vwd/34A////////8=')
};
const tama01 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////////AH7vfeB7sfvwevd78Hv7+/v7+/33/g///8=')
};

const tool00 = {
  width: 30,
  height: 30,
  bpp: 1,
  transparent: 1,
  buffer: atob('//////7v4f8zHwP8zHwP8zHwP8zHwP8THwP8DHwP8BHgP8AHgP8AHgP+AHgP+APgP/AfAP/g/AP/x/AP/x/AP/x/AP/w/gP/w/8P/w/8P/gf8P/gf8P/AP8P/AP4P/AP4P/gf4P/wf4P/4/8f/////A=')
};

const tool01 = {
  width: 30,
  height: 30,
  bpp: 1,
  transparent: 1,
  buffer: atob('///////D///fD4/+Pn4/+P/4//P/7/v+Af3n4APjDwAHDjgADP/AGD//DPh/+H/h/+O5x/GOkxxCOkxBOG8xh/GYz//HBz//jBn//xjmPw4/ODx///Dx+AfH/8AP///////+Af//8AP///////////A=')
};

const tool02 = {
  width: 30,
  height: 30,
  bpp: 1,
  transparent: 1,
  buffer: atob('///////////////+D///4B///x8///xUf/hmTf+An/f4AmTfwAmTfgAl8fABx8+AD4B8AH8D4AP//wAf//gA///AB//+AH//8AP//4A///wD//8AP//4A///4H///4H///8H///+P/////////////A=')
};

const tool03 = {
  width: 30,
  height: 30,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////////////x////g////gf//fwP/+P4P/+OMH/+GEH/8DCD/4BjB/wxhB/h4xg/D8Qw8H8Yw4H+M5wH+H/gD/H/gD/D/wB8B/wAwB/wAAz/wAD//gAH//CAf//PB////n//////////////////A=')
};

const tool10 = {
  width: 30,
  height: 30,
  bpp: 1,
  transparent: 1,
  buffer: atob('////////////////wf///AH//yAD/Dkfh8B0/wAA8/wA44vnD545Bgx8ZA4x4H58xznP8RjjH8ZnmP8ZmGPw5gPAB58fAHx8fw/x4///j8///j8f//D8f/8H+D/gf/AAA//gAD//+Af///////////A=')
};

const tool11 = {
  width: 30,
  height: 30,
  bpp: 1,
  transparent: 1,
  buffer: atob('//////////////////////B///wAD/+AAA/8D/wPwfz+Hg/z/Dj7z3xH5znYM5znIM5TmIOdT8YGeL85GOP45neP/xj+P/zz+P/zx+H/nx+H/n4///H4/h/P8QAGP+AAAf/D/g////////////////A=')
};
const tool12 = {
  width: 30,
  height: 30,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////////////////////////////z////5////5///94///48/g/8c8AH8M4AGcEwAOEEgAyAgAAwAgAB4YwAH8YwAH+c4AH/c4AAf84gAB/4gAB/5wAB/54AD//8AH///gf/////////////////A=')
};

const tool13 = {
  width: 30,
  height: 30,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////////////////////////+A///8AP//weH//x/jg/j/yAPnPwOHnM4/jnM9/5n8//5k/+fkk/vHEmPPgMjAbgcxxjmc4fD/48AB/4+AQ/x//4fj//+AH///AP/////////////////////////A=')
};

const shower = {
  width: 8,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('5cuXy+XLl8vly5fL5cuXyw==')
};

/*
const tools = [
  tool00, tool01, tool02, tool03,
  tool10, tool11, tool12, tool13
];
*/

const tamabg = {
  width: 176,
  height: 176,
  bpp: 8,
  buffer: require('heatshrink').decompress(atob('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'))
};

const tama06happy = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////4Afvm+Hd+B74duDq7v7g/vv++/79/f4D/////8=')
};

const battery = {
  width: 32,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/////x/t//9vxP//bG2arx9taa9obQuPa2177xy2i58=')
};
const snack = {
  width: 24,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('z//7t//7vDGbzb1q9aF5ta1qzbKa////')
};
const meal = {
  width: 24,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('////k//fqzjfqt7fqhDfqvbfuxlf////')
};

const face = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/8OlgZmBw/8=')
};

const year = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/6qpq8vrn/8=')
};

const weight = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/34A54G9pQA=')
};

const weight_g = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('49vj+cO7x/8=')
};

const heart0 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('yba+vt3r9/8=')
};

const heart1 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('yaCgoMHj9/8=')
};

g.clear();
g.setColor(1, 1, 1);
g.fillRect(0, 0, 200, 200);

g.setColor(0);

g.drawString('Loading...', 10, 10);
egg = egg00;
n = tama00;

function drawHearts (n) {
  for (i = 0; i < 4; i++) {
    const himg = (i < n) ? heart1 : heart0;
    g.drawImage(himg, 1 + (scale * (8 * i)) - scale - scale, 40 + (scale * 8), { scale: (scale) });
  }
}

function drawLinebar (n, arrow) { // 0-100
  g.drawImage(linebar, 0, yy + (scale * 8), { scale: scale });

  let wop = scale * 2; // (frame++%2)? scale*3:scale*2;
  if (frame % 2) {
    wop += scale;
  }
  let twelve = 12;
  if (arrow) {
    twelve = 11;
  }
  const val = (n * twelve) / 100;
  const max = val || twelve;

  for (let i = 0; i < max; i++) {
    g.setColor(0, 0, 0);

    if (arrow) {
      const x = wop + (i * scale * 2) + ((i % 2) * scale);
      const y = yy + (scale * 11);
      g.fillRect(x + (scale * 2), y, x + (scale * 3), y + scale);
      g.fillRect(x + scale, y + scale, x + (scale * 2), y + (scale * 2));
      g.fillRect(x, y + (scale * 2), x + scale, y + (scale * 3));
    } else {
      const x = (i * scale * 2) + (scale * 2);
      const y = yy + (scale * 11);
      g.fillRect(x, y, x + scale, y + scale * 3);
    }
  }
}

function drawStatus () {
  switch (statusMode) {
    case 0:
      g.drawImage(face, scale, yy, { scale: scale });
      g.drawImage(weight, scale, yy + (scale * 8), { scale: scale });
      g.drawImage(numbers[0], w - (scale * 14), yy, { scale: scale });
      g.drawImage(year, w - (scale * 8), yy, { scale: scale });
      g.drawImage(numbers[1], w - (scale * 14), yy + (scale * 9), { scale: scale });
      g.drawImage(weight_g, w - (scale * 8), yy + (scale * 9), { scale: scale });
      break;
    case 1: // discipline
      g.drawImage(discipline, 0, yy, { scale: scale });
      drawLinebar(tama.discipline, false);
      break;
    case 2: // hungry
      g.drawImage(hungry, scale, yy, { scale: scale });
      drawHearts(tama.hungry);
      break;
    case 3: // happy
      g.drawImage(happy, scale, yy, { scale: scale });
      drawHearts(tama.happy);
      break;
    case 5: // battery
      g.drawImage(battery, scale, yy, { scale: scale });
      drawLinebar(E.getBattery(), true);
      break;
    default:
      statusMode = 0;
      drawStatus();
      break;
  }
}

function drawScene () {
  if (Bangle.isLocked()) {
    tool = -1;
  }
  g.setColor(0, 0, 0);
  g.fillRect(0, 0, 200, 200);
  g.drawImage(tamabg, 0, 0, { scale: 1 });
  g.setColor(1, 1, 1);

  if (evolution == 0) {
    g.drawImage(egg, w / 4, 32, { scale: scale });
    return;
  }
  if (callForAttention) {
    g.drawImage(tool13, 10 + 30 + 10 + 30 + 10 + 30 + 10, 135);
  }
  if (mode == 'game') {
    drawGame();
    if (!transition) {
      if (gameChoice == 2) {
        g.drawImage(right, w - (scale * 7), 40 + (scale * 4), { scale: scale });
      } else if (gameChoice == 1) {
        g.drawImage(left, 0, 40 + (scale * 4), { scale: scale });
      }
      return;
    }
  }
  if (gameTries > 4) {
    mode = '';
    oldMode = '';
    const s0 = numbers[gameWins];
    const s1 = numbers[(5 - gameWins)];
    g.drawImage(s0, (scale * 5), 60, { scale: scale });
    g.drawImage(vs, (scale * 12), 60, { scale: scale });
    g.drawImage(s1, (scale * 22), 60, { scale: scale });

    gameTries++;
    if (gameTries > 10) {
      const winrar = (gameWins > 2);
      gameTries = 0;
      gameWins = 0;
      oldMode = '';
      mode = '';
      if (winrar) {
        tama.happy++;
        animateHappy();
      }
    }
    return;
  }

  if (mode == 'clock') {
    drawClock();
    if (!transition) {
      return;
    }
  }

  drawTools();
  if (mode == 'status') {
    drawStatus();
    return;
  }
  if (mode == 'food') {
    drawFoodMenu();
    return;
  }
  if (mode == 'light') {
    drawLight();
    return;
  }
  if (mode == 'happy') {
    drawHappy();
    return;
  }
  if (mode == 'angry') {
    drawAngry();
    return;
  }
  if (mode == 'medicine') {
    if (tama.sick > 0) {
      drawMedicine();
    } else {
      animateAngry();
    }
    return;
  }
  if (mode == 'eating') {
    if (lightSelect == 0 && tama.hungry > 4) {
      drawEatingNo();
    } else {
      drawEating();
    }
    return;
  }
  if (lightMode) {
    // just dark screen and maybe zZz if its sleeping
    g.setColor(0, 0, 0);
    g.fillRect(0, 38, w + sx, h - 50);
    if (tama.sleep) {
      drawCaca();
    }
  } else {
    // draw tamagotchi
    g.drawImage(n, x + sx, y, { scale: scale });
    // draw caca
    drawCaca();
  }
}

function drawAngry () {
  const one = angryState % 2;
  g.drawImage(one ? tama06no0 : tama06no1, (scale * 5), 40, { scale: scale });
  g.drawImage(one ? angry0 : angry1, (scale * 20), 40, { scale: scale });
}

function drawHappy () {
  const one = angryState % 2;
  g.drawImage(one ? tama06happy : tama06no1, (scale * 5), 40, { scale: scale });
  if (one) {
    g.drawImage(sun, (scale * 20), 46, { scale: scale });
  }
}

function drawEatingNo () { // food eating animation
  const one = angryState % 2;

  g.drawImage(lightSelect ? snack0 : meal0, scale, 40 + (scale * 7), { scale: scale });

  g.drawImage(one ? tama06no0 : tama06no1, (scale * 10), 40, { scale: scale });
}

const med0 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('///4P/1//X/9f+AP+7/4P/o/+j/4P/g//H/+//7///8=')
};
const med1 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('//////g//X/9f+AP+z/7P/o/+D/7P/g//H/+//7///8=')
};

const med2 = {
  width: 16,
  height: 16,
  bpp: 1,
  transparent: 1,
  buffer: atob('////////+D/9f+AP+j/7P/s/+z/7v/g//H/+//7///8=')
};

function drawMedicine () { // food eating animation
  const med = [med0, med1, med2];
  const img = med[0 | ((frame / 2) % 3)];
  if (img) {
    g.drawImage(img, 0, 34, { scale: scale });
  }
  g.drawImage(tama06no0, (scale * 10), 40, { scale: scale });
}

function drawEating () { // food eating animation
  const one = angryState % 2;
  const snack = [snack0, snack1, snack2];
  const meal = [meal0, meal1, meal2];
  const img = lightSelect ? snack[0 | (frame / 2)] : meal[0 | (frame / 2)];
  if (img) {
    g.drawImage(img, scale, 40 + (scale * 7), { scale: scale });
  }
  g.drawImage(one ? tama06no1 : tama06eat0, (scale * 10), 40, { scale: scale });
}

function drawFoodMenu () { // food menu
  if (lightSelect == 0) {
    g.drawImage(right, -scale, 40, { scale: scale });
  } else {
    g.drawImage(right, -scale, 40 + (7 * scale), { scale: scale });
  }
  g.drawImage(meal, scale * 5, 34, { scale: scale });
  g.drawImage(snack, scale * 5, 40 + (7 * scale), { scale: scale });
}

function drawLight () {
  if (lightSelect == 0) {
    g.drawImage(right, 2, 40, { scale: scale });
  } else {
    g.drawImage(right, 2, 40 + (7 * scale), { scale: scale });
  }
  g.drawImage(img_on, scale * 8, 34, { scale: scale });
  g.drawImage(img_off, scale * 8, 40 + (7 * scale), { scale: scale });
}

function drawTools () {
  if (tool >= 0) {
  // top actions
    if (tool == 0) { g.drawImage(tool00, 10, 2); }
    if (tool == 1) { g.drawImage(tool01, 10 + 30 + 10, 2); }
    if (tool == 2) { g.drawImage(tool02, 10 + 30 + 10 + 30 + 10, 2); }
    if (tool == 3) { g.drawImage(tool03, 10 + 30 + 10 + 30 + 10 + 30 + 10, 2); }
    // bottom actions
    if (tool == 4) { g.drawImage(tool10, 10, 135); }
    if (tool == 5) { g.drawImage(tool11, 10 + 30 + 10, 135); }
    if (tool == 6) { g.drawImage(tool12, 10 + 30 + 10 + 30 + 10, 135); }
  }
}

// this function is executed once per second. so the animations look stable and consistent
function updateAnimation () {
  frame++;
  if (evolution == 0) {
    // animate the egg
    egg = (egg == egg00) ? egg01 : egg00;
    return;
  }
  if (mode == 'game') {
    // console.log("update Animation");
    if (transition) {
      const beep = frame % 4;
      if (beep == 0) {
        Bangle.beep(150, 4000);
      } else if (beep == 2) {
        Bangle.beep(150, 3200);
      }
    } else {
      Bangle.beep(100);
    }
    if (gameChoice != 0) {
      // do things
      gameChoice = 0;
      if ((0 | (Math.random() * 3)) > 0) {
        animateHappy();
        gameWins++;
      } else {
        animateAngry();
      }
    }
    return;
  }
  if (mode == 'medicine') {
    if (frame > 3) {
      mode = '';
      tama.sick = 0;
    }
  }
  x += (scale) * hd;
  if (x + (tama00.width * scale) >= w) {
    hd = -hd;
  }
  if (x < 0) {
    hd = -hd;
  }
  caca = (caca == caca00) ? caca01 : caca00;
  // y += vd * scale;
  vd = -vd;
  const width = (w / scale);
  if (tama.sleep) {
    n = tama00;
    x = (width / 2);
  } else {
    n = n == tama00 ? tama01 : tama00;
    if (tama.cacas > 0 || tama.sick > 0) {
      if (x > (width / 2)) {
        hd = -1;
        x = (width / 2);
      }
    }
  }
}

function nextItem () {
  tool++;
  if (tool > 6) tool = 0;
}

/*
function prevItem () {
  tool--;
  if (tool < 0) tool = 7;
}
*/

function activateItem () {
  if (mode != '') {
    return;
  }
  switch (tool) {
    case -1:
      animateToClock();
      break;
    case 0: // food
      if (!tama.sleep) {
      // evolution = 0;
        mode = 'food';
        lightSelect = 0;
      }
      break;
    case 1: // onoff
      mode = 'light';
      break;
    case 2: // game
      if (!tama.sleep) {
        animateToGame();
      }
      break;
    case 3: // vax
      if (tama.sleep) {
        // cant medicate if sleeping
      } else {
        mode = 'medicine';
        frame = 0;
        angryState = 0;
      }
      break;
    case 4: // shower
      if (tama.sleep) {
        tama.happy = 0;
      }
      tama.awake = 10; // time to go to sleep again if in time
      tama.sleep = false;
      animateShower();
      break;
    case 5: // status
      mode = 'status';
      statusMode = 0;
      break;
    case 6: // blame
      if (tama.sleep) {
        tama.happy = 0;
        tama.sleep = false;
      } else if (callForAttention) {
        if (tama.happy > 0 && tama.hungry > 0 && tama.sick < 1) {
          tama.discipline += 2;
          callForAttention = false;
        } else if (tama.sick > 0) {
          tama.discipline--;
        }
      }
      animateAngry();
      break;
  }
}

const skull = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('gwFtARGDq/8=')
};

const zz0 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('//H9+/fRf/8=')
};

const zz1 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 1,
  buffer: atob('/8P79+/fw/8=')
};

const zz2 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 0,
  buffer: atob('AA4CBAgugAA=')
};
const zz3 = {
  width: 8,
  height: 8,
  bpp: 1,
  transparent: 0,
  buffer: atob('ADwECBAgPAA=')
};

function drawCaca () {
  if (mode == 'game') {
    return;
  }
  if (!caca) {
    caca = caca00;
  }
  let zz = [zz0, zz1];

  if (lightMode) {
    zz = [zz2, zz3];
    g.setColor(1, 1, 1);
    var fi = ((frame) / 2) % 2;
    g.drawImage(zz[fi ? 1 : 0], sx + w - (scale * 9), 40, { scale: scale });
    return;
  }
  g.setColor(0, 0, 0);
  if (tama.sleep) {
    var fi = ((frame) / 2) % 2;
    g.drawImage(zz[fi ? 1 : 0], sx + w - (scale * 9), 34, { scale: scale });
    if (tama.sick > 0) {
      g.drawImage(skull, sx + w - (scale * 9), 34 + (scale * 6), { scale: scale });
    } else if (tama.cacas > 0) {
      g.drawImage(caca, sx + w - (scale * 11), 32 + (scale * 6), { scale: scale });
    }
  } else if (tama.sick > 0) {
    g.drawImage(skull, sx + w - (scale * 9), 34 + scale, { scale: scale });
    if (tama.cacas > 0) {
      g.drawImage(caca, sx + w - (scale * 11), 32 + (scale * 6), { scale: scale });
    }
  } else {
    if (tama.cacas > 0) {
      g.drawImage(caca, sx + w - (scale * 11), 34 + (scale * 6), { scale: scale });
    }
    if (tama.cacas > 1) {
      g.drawImage(caca, sx + w - (scale * 11), 24, { scale: scale });
    }
  }
}

function animateHappy () {
  if (transition || mode == 'happy') {
    return;
  }
  angryState = 0;
  mode = 'happy';
  transition = true;
  //const width = w / scale;
  //const cx = w;
  var iv = setInterval(function () {
    angryState++;
    if (angryState > 3) {
      clearInterval(iv);
      transition = false;
      angryState = 0;
      mode = oldMode;
      if (mode == 'game') {
        gameTries++;
      }
    }
    drawScene();
  }, 1000);
}

function animateAngry () {
  if (transition || mode == 'angry') {
    return;
  }
  angryState = 0;
  mode = 'angry';
  transition = true;
  //const width = w / scale;
  //const cx = w;
  var iv = setInterval(function () {
    angryState++;
    if (angryState > 3) {
      clearInterval(iv);
      transition = false;
      angryState = 0;
      mode = oldMode;
      if (mode == 'game') {
        gameTries++;
      }
    }
    drawScene();
  }, 1000);
}

function animateFood () {
  if (transition || mode == 'eating') {
    return;
  }
  // XXX TODO this is printing the angry state not the eating one
  angryState = 0;
  mode = 'eating';
  tama.hungry++;
  if (lightSelect == 1) { // snack
    tama.happy++;
    tama.hungry++;
    tama.sickness += 2;
  }
  frame = 0;
  transition = true;
  //const width = w / scale;
  //const cx = w;
  var iv = setInterval(function () {
    angryState++;
    if (angryState > 3) {
      clearInterval(iv);
      transition = false;
      angryState = 0;
      mode = 'food';
    }
    drawScene();
  }, 1000);
}

function animateShower () {
  if (transition) {
    return;
  }
  transition = true;
  const width = w / scale;
  let cx = w;
  var iv = setInterval(function () {
    sx -= scale * 4;
    drawScene();
    cx -= scale * 4;
    g.setColor(1, 1, 1);
    g.drawImage(shower, cx, 40 - scale, { scale: scale });
    if (cx < 0) {
      clearInterval(iv);
      mode = '';
      transition = false;
      //animated = true;
      sx += width;
      if (sx < 0) sx = 0;
      if (tama.cacas > 0) {
        // if it was dirty, play the happy animation
      }
      tama.cacas = 0;
      drawScene();
    }
  }, 100);
}

function animateToGame () {
  if (transition || mode === 'game') {
    return;
  }
  mode = 'game';
  gameChoice = 0;
  transition = true;
  let cx = 0;
  sx = -w;
  //animated = false;
  var iv = setInterval(function () {
    sx += scale * 2;
    updateAnimation();
    drawScene();
    cx += scale * 2;
    if (cx > w) {
      clearInterval(iv);
      sx = 0;
      //animated = true;
      transition = false;
      drawScene();
    }
  }, 100);
}

function animateToClock () {
  if (transition) {
    return;
  }
  if (mode == 'clock') {
    return;
  }
  mode = 'clock';
  transition = true;
  //const width = w / scale;
  let cx = w;
  sx = 0;
  //animated = false;
  var iv = setInterval(function () {
    sx -= scale * 4;
    drawScene();
    cx -= scale * 4;
    g.setColor(0, 0, 0);
    if (cx < 0) {
      clearInterval(iv);
      mode = 'clock';
      transition = false;
      //animated = true;
      drawScene();
    }
  }, 100);
}

function animateFromClock () {
  if (transition) {
    return;
  }
  if (mode != 'clock') {
    return;
  }
  transition = true;
  let cx = 0;
  //const width = w / scale;
  //animated = false;
  var iv = setInterval(function () {
    sx += scale * 4;
    drawScene();
    cx += scale * 4;
    if (cx > w) {
      clearInterval(iv);
      mode = '';
      sx = 0;
      //animated = true;
      transition = false;
      drawScene();
    }
  }, 100);
}

function button (n) {
  if (evolution == 0) {
    if (n == 3) {
      evolution = 1;
      return;
    }
  }
  if (mode == 'happy' || mode == 'angry') {
    return;
  }

  if (mode == 'game') {
    switch (n) {
      case 1:
        // pick left
        gameChoice = 1;
        drawScene();
        oldMode = 'game';
        break;
      case 2:
        // pick right
        gameChoice = 2;
        drawScene();
        oldMode = 'game';
        break;
      case 3:
        mode = '';
        // exit game
        break;
    }
    return;
  }
  if (mode == 'eating') {
    Bangle.buzz();
    return;
  }
  Bangle.beep(150);

  switch (n) {
    case 1:
      switch (mode) {
        case 'clock':
          useAmPm = !useAmPm;
          drawScene();
          break;
        case 'food':
        case 'light':
          lightSelect = lightSelect ? 0 : 1;
          drawScene();
          break;
        case 'status':
          if (oldMode != 'clock') {
            statusMode++;
            drawScene();
          }
          break;
        default:
          nextItem();
          drawScene();
          break;
      }
      break;
    case 2:
      switch (mode) {
        case 'clock':
          animateFromClock();
          break;
        case 'status':
          if (oldMode != 'clock') {
            statusMode++;
            drawScene();
          }
          break;
        case 'food':
          animateFood();
          break;
        case 'light':
          mode = '';
          lightMode = lightSelect;
          drawScene();
          break;
        default:
          activateItem();
          tool = -1;
          drawScene();
      }
      break;
    case 3:
      switch (mode) {
        case 'clock':
          animateFromClock();
          break;
        case 'light':
        case 'food':
          mode = '';
          lightState = 0;
          drawScene();
          break;
        case 'status':
          if (oldMode == 'clock') {
            mode = 'clock';
            oldMode = '';
          } else {
            mode = '';
            statusMode = 0;
            drawScene();
          }
          break;
        default:
          mode = '';
          tool = -1;
          drawScene();
          break;
      }
      break;
  }
}

function drawGame () {
  g.setColor(0, 0, 0);

  let one = frame % 2;
  if (transition) {
    one = 0;
    g.drawImage(heart1, sx + w + (scale * 6), 40, { scale: scale });
    g.drawImage(heart1, sx + w + (scale * 16), 40, { scale: scale });
    g.drawImage(heart0, sx + w, 40 + (scale * 8), { scale: scale });
    g.drawImage(heart0, sx + w + (scale * 12), 40 + (scale * 8), { scale: scale });
  } else {
    if (gameTries > 4) {
      if (oldMode != '') {
        if (gameWins > 2) {
          animateHappy();
        }
      }
      mode = oldMode;
      oldMode = '';
    } else {
      g.drawImage(one ? tama06no1 : tama06no0, (scale * 7) + sx, 40, { scale: scale });
    }
  }
}

function drawClock () {
  const d = new Date();
  let hh = '';
  if (useAmPm) {
    const h = (d.getHours() > 12) ? d.getHours() - 12 : d.getHours();
    hh = (h < 10) ? ' ' + h : '' + h;
  } else {
    hh = (d.getHours() < 10) ? ' ' + d.getHours() : '' + d.getHours();
  }
  const mm = (d.getMinutes() < 10) ? '0' + d.getMinutes() : '' + d.getMinutes();
  const ss = (d.getSeconds() < 10) ? '0' + d.getSeconds() : '' + d.getSeconds();
  const ts = hh + ':' + mm;
  const useVector = false;
  const wsx = w + sx + ((2.4) * scale);

  if (useVector) {
    g.setFont('Vector', 60);
    g.setColor(0, 0, 0);
    g.drawString(ts, w + sx + 30, 54);
    g.setFont('Vector', 24);
    g.setColor(0, 0, 0);
    g.drawString(ss, w + sx + (w - 20), 104);
  } else {
    const s0 = numbers[ts[0] - '0'];
    const s1 = numbers[ts[1] - '0'];
    const s2 = numbers[ts[3] - '0'];
    const s3 = numbers[ts[4] - '0'];
    // hours
    if (s0) {
      g.drawImage(s0, wsx, yy, { scale: scale });
    }
    g.drawImage(s1, wsx + (5 * scale), yy, { scale: scale });
    g.drawImage(colon, wsx + (scale + scale + scale + (5 * scale)), yy, { scale: scale });
    // minutes
    g.drawImage(s2, wsx + (2 * scale) + (5 * 2 * scale), yy, { scale: scale });
    g.drawImage(s3, wsx + (2 * scale) + (5 * 3 * scale), yy, { scale: scale });
    // seconds
    const s4 = snumbers[ss[0] - '0'];
    const s5 = snumbers[ss[1] - '0'];
    g.drawImage(s4, wsx + (3 * scale) + (3 * 6 * scale), yy, { scale: scale });
    g.drawImage(s5, wsx + scale + (4 * 6 * scale), yy, { scale: scale });
    const arrows = [
      '00000',
      '10000',
      '11000',
      '11100',
      '11110',
      '11111',
      '01111',
      '00111',
      '00011',
      '00001'
    ];
    // arrow
    for (let i = 0; i < 5; i++) {
      const n = d.getSeconds() % 10;
      const arrow = arrows[n];
      const img = (arrow[i] == '1') ? right1 : right0;
      g.drawImage(img, wsx + (3 * i * scale) + (scale * 14), yy + (10 * scale), { scale: scale });
    }
  }
  if (useAmPm) {
    if (d.getHours() < 13) {
      g.drawImage(am, wsx, yy + (8 * scale), { scale: scale });
    } else {
      g.drawImage(pm, wsx, yy + (8 * scale), { scale: scale });
    }
  } else {
    g.drawImage(h24, wsx, yy + (8 * scale), { scale: scale });
    // show something from tamagotchi stats
  }
}

setInterval(function () {
  updateAnimation();
  drawScene();
}, 1000);

function pooMaker() {
  if (tama.hungry > 0 && !tama.sleep) {
    const a = 0 | (cacaLevel / tama.tummy);
    const b = 0 | ((cacaLevel + tama.hungry) / tama.tummy);
    cacaLevel += tama.hungry;
    if (a != b) {
      /*if (tama.cacas == 0) {
        cacaBirth = new Date();
      }*/
      tama.hungry--;
      tama.cacas++;
    }
  }
  const d = new Date();
  const h = d.getHours();
  tama.sleep = (h > 22 || h < 8);
  if (tama.awake > 0) {
    tama.awake--;
    tama.sleep = false;
  }
}
function sickMaker() {
  if (tama.sleep) {
    return;
  }
  callForAttention = false;

  // health check
  tama.sickness += tama.cacas;
  if (tama.hungry == 0) {
      callForAttention = true;
  //  tama.sickness++;
  }
  if (tama.hungry == 4) {
    // tama.sickness++;
  }
  if (tama.sickness > tama.defenses) {
    tama.sickness = 0;
    tama.sick++;
  }
  if (tama.sick > 0) {
    callForAttention = true;
  }
}

setInterval(pooMaker, 5e3);
setInterval(sickMaker, 2e3);
updateAnimation();

Bangle.on('touch', function (r, s) {
  const w4 = w / 3;
  if (s.x > w - w4) {
    if (s.y < 50) {
      Bangle.beep(150);
      if (oldMode == 'clock') {
        oldMode = '';
        mode = 'clock';
      } else
      if (mode == 'clock') {
        mode = 'status';
        oldMode = 'clock';
        statusMode = 5; // battery
      } else {
        evolution = !evolution;
        tool = -1;
      }
      drawScene();
    } else {
      button(3);
    }
  } else if (s.x < w4) {
    button(1);
  } else {
    button(2);
  }
});
