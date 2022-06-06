const digit = [];

const dash = {
  width: 75,
  height: 128,
  bpp: 1,
  buffer: require('heatshrink').decompress(atob('AH4A/AH4A/AH4A/AH4A/AB0D/4AB+AJEBAX/BAk/CQ8PCQ4kDCQoIDCQgkDCQgkECQgIE4ASHFxH8JRgSEEgYSEPJAkEAH4A/AH4A/AH4A/AH4A/ACg='))
};
function loadDigits () {
  digit[0] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AH4AGn//AAngBIMfBIvABIMPBIuABIMHBIoIBg0DBAn+gYSBgIJE/kHBIOABIn4h4JB4F/BIfwj4JB8BQEAoIJBBoJOEv4JBEIJOEIwMHGoIJDIIIJBJIJOEBIQOCJwYJDOIR9DBISFCSIYJCTISlDBIXwBIZoBBP4J/BP4J/BNX+gED//gBIc/BIMB//ABIcf/gDB/+ABIcP/AhCBAYuBFoU+BIkDFoUcBIkBFoUIBIkAFogA/AAZPJMZJ3JRZKfIWZLHJbZL5bBP4J/BP4J/BKPgBIc/BIfABIcfBIeA/4AB/EPBIcBBIX8AwIJB/0DBIQECBIIOCAAQYBBIIiCAAQsBBIPwGwIAC4F/BIPgJQIACAoIJBBoIJDDIIJBJwZQDBIJODKAcAgxODKAZxBJwgABPYROEKASFDAAiRCJwhQCTYYAkA'))
  };

  digit[1] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AH4A2wAIHgIJIgYJIg4JIh4JIj4JIn4JIv4JI/4JHgIJIgYJIg4JIh4JIj4JIn4J/BP4J/BP4Jqj//BA0Ah/+BI8H/gJHgf4BI8B+AJHgHgBJFABJAA/J55jIO5KLJT5KzJY5L5nBP4J/BP4J/AAcfBJEPBJEHBJEDBJEBBJEABJN/BJE/BJEfBJEPBJEHBJEDBJEBBJEABJIA/AAwA='))
  };

  digit[2] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AH4AGj//AAnwBIMPBIvgBIMHBIvABIMDBIuABIMBBIsBGQQIE/0DBIV/BIf8g4JCn4JD/EPKA/wj4JCKAngn4JCKAnAv4JCKAmA/4JCKAgEBQYZOEBIgADFgIJHIAKlJBI5oBBP4J/BP4J/BOcfBJEP/wJHg/8Aof/AAP+gf4BAUBBIX/gPwBIUDBIeA8AiDBIfAoA2DBIYSDJQQACEwZeCAAQ6DgF/BJATJE5I7IghPFBIUOMYomDO4g6EwCLDJwgiDAAhyFTohKEToheEBP4J/BP4J/BOHwBJHgBJHAv////8BImABAP//wJEAIIACBIf+BImABIX8g4JD4AJC/EPBIZACgfwj4JDKgUD8E/BIZoCgZODKAkDJwZQEgcBBIhQCgROEKAhOEKAhOEKAhOEKAgAm'))
  };

  digit[3] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AH4AGj//AAnwBIMPBIvgBIMHBIvABIMDBIuABIMBBIsBGQQIE/0DBIV/BIf8g4JCn4JD/EPKA/wj4JCKAngn4JCKAnAv4JCKAmA/4JCKAgEBQYZOEBIgADFgIJHIAKlJBI5oBBI58BBP4J/BP4J/BL8/BJEf/wJHh/8BI8H/AFD/4AB/0D+AICgIJDgPgBIUDBIQ5B4AiDBIeAwA2DBIYSDJQIJDEwZeCAAQ6DOQQACJwgTJE5I7JJ5JjEgIUDO4kDFAgJC/kDIwipNj4JIn7HIbZL5TBP4J/BP4J/BJs/BJEfBJEPBIgjB//8g4JDgIIB//+gYJDAgIACBwIJCDAIACwAJDFgIAC4F/IAgAC8E/KggAC+EfIgoAB/EPBIQIDKAROFKAZOGKAROGKAQJI4BOGKAQJI+CfHAEAA=='))
  };
  digit[4] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AH4AswEBBJOABAoHBgPABIsDBIPgBIsHBIPwBIsPBIP4BIsfBIP8BIs/BIP+BIt/BIP/BIv/BIRQEAwQCBKAkDBIZQEg4JDKAkPBIZQEj4JIn4J/BP4J/BP4JjgAJFj//AYN/8AJDh/+C4QJEg/8C4XAv////+gYjCh+ABAIABgPwC4Q9BAAWAEYUCgYJD4FAFgYJDIAoJDEwRUDAARoGAAROCCZYnJHZJPJMZAABO46hCRYwAFT4YAFWYYAFY4YAFbYYJ/BP4J/BP4Jnj4JIh4JIg4JIgYJIgIJIgAJJv4JIn4JIj4JIh4JIg4JIgYJIgIJIgAJJAH4AGA='))
  };

  digit[5] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AGUP/4AE/gJBg4JF/AJBgYJF+AJBgIJF8AJBwAJF4AJB4F/BImABIPgn4JEIoXwj4ID/wJC/BQEJwUA/hQEJwUA/xQEJwUA/5QEJwQJBKAhOCBIJQEJwQJBKAiVDFggAEIAgJFKgYJFNAYJ/BP4J/BP4Jmv/8BI8//AJHj/wBI8P8E//4ABBIcH4F/BIWABIUDwAIC//ABIUBgIJD8AeDgYJDGwkHBIZKEh4JDLwkfBIZyECZInJHZJPFkChEMYdwUIh3DFAiLDgKvIgbDIJQKvIUIgJFUIZ8FBP4J/BP4J/BL8PBJEHBJEDBJEBBIl//4ABwAJEBAQHBv4JCDAIAC8E/BIQsBAAXwj4JCIAIAC/EPBIRUBAAX8g4JCNAIAC/0DBI//gIJCJwZQCBIQIEKANAJwpQCJwxQCJwxQCJwxQCBJYAwA='))
  };

  digit[6] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AGU//4AE8AJBj4JF4AJBh4JFwAJBg4JFBAMGgYIE/wSCgIJE/gJCwAJE/AJC4F/BIfwBIXgKAhOCg/wKAhOCg/4KAhOD/hQEOwUH/xQDJwRiCKAZOCBIRQDJwQJCGwQAEBIJKCBIxeCBP4J/BP4J/BOED//gBI0B//ABI0A/+ABI9/CoIAB/gJDnwpBAAP+BIccHoIACBIcIh4JDFgkfBIZAEBIhUEv4JDNAgJE/ATNn4nIHZBPGKARjFgIUCO4sDFASLFg48COQsPKARyGUILHGn6hBBIJyGco4J/BP4J/BP4Jm8AJDn4JD4AJDj4JDwAJDh4JDgP/AAP8AwIJB/0DBIQECBIIOCAAQYBBIP4EQIACwAJC+A2BAAXAv4JB8BKBAAQFBBIINBBIYZBBIIhBAAYtBBIJODKAcAgxODKAZnBJwhQCOIYAEPoROEKASZDAAilCJwhQCTYYAuA=='))
  };

  digit[7] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AGUH/4AE/wJBgYJF/gJBgIJF+AeCBJN/BIngsAJBn4JE4HgBIMfBImBBIUPBIkDBIRQE/0HBIRQE/kPBIRQE/EfBIRQE+E/BIZQD8AJEKAfABYIJCKAYsBBIYADIAIJHKgIJHNAIJ/BP4J/BP4Jzg//4AJGgf/wAJGgP/BAwAB/wJIvgJInAJIiAJIAH5PPMZJ3JRZCfJWZLHJfM4J/BP4J/BP4JNg4JIgYJIgIJIgAJJv4JIn4JIj4JIh4JIeg4JIgYJIgIJIgAJJsAJIkAJIAH4AQA='))
  };

  digit[8] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AGUf/4AE+AJBh4JF8AJBg4JF4AJBgYJFwAIBgIJFgOAgeABAn+A4MD4F/BIf8g4JB8E/BIf4h4JB+BQEAoIJBBoJOEn4JBEIJOEv4JBGoJOEAIIHBKAgEBBIRQDDAQJCKAYsCBISFCSIYJCTISlDBIX4BIZoBBP4J/BP4J/BNkB//wBIcf/4DB//gBIcP/wDBv/ABIcH/ghCwH/AAP+gYtCj4pBAAUBFoUOHoIACwAtCgkHBIfAoA2DBIZAEJQIACKgheBAARoGBKInJHZBPJMZJ3JRZKfJWZDHJfM4J/BP4J/BP4JP+AJDj4JD8AJDh4JD4AJDg4JDwH/AAP+AwQCBgIJCAgQJBBwQACDAIJB/giBAAXAv4JB/A2BAAXgn4JB+BKBAAQFBBIINBBIYZBBIIhBBIYtBBIJODKAYJBJwhQCwECJwhQCwBxCAAh9CJwhQCTIYAEUoROEKASbDAFwA='))
  };

  digit[9] = {
    width: 80,
    height: 128,
    bpp: 1,
    buffer: require('heatshrink').decompress(atob('AGUP/4AE/gJBg4JF/AJBgYJF+AJBgIJF8AJBwAJF4FAgHAv4JEwHAgHgn4JEgIJB+EfBAf+gYJB/BQE/kHBIIDBJwkPBIIXBJwkfBIIrBJwk/BIRQEJYIJCKAgOBBIXgIwYiBBIR7CQ4YJCR4SbDBISjCV4YJC/wJDFYIJ/BP4J/BP4Jjv/8BIcP/+AgE//AJDg//C4XwBIcDEYUP8E//4ABgIjCg/Av4JCwAjCgeABAQ5BuAJBgMBBIfgkAsDBIY2EIAIACJQhUBAAReENAIACOQgTJE5I7JJ5KhBMYwABO44ABRY4AFT4YAFWYYAFY4YAFbYYJ/BP4J/BP4Jnh4JIg4JIgYJIgIJEv//AAOABIgICA4N/BIQYBAAXgn4JCFgIAC+EfBIRABAAX4h4JCKgIAC/kHBIRoBAAX+gYJCn4JD/8BBIRODKAQJCBAhQBoBOFKAROGKAROGKAROGKAQJLAGA='))
  };
}

// sprites

const left0 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('ADAwEDgUcCgEAA==')
};

const left1 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('ADAwEDh0ECAoAA==')
};

const left2 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('ADAwEBg4EBg0AA==')
};

const left4 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('ABgYVDgQEChEAA==')
};

const right0 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('AAwMCBwoDhQgAA==')
};

const right1 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('AAwMCBwuCAQUAA==')
};

const right2 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('AAwMCBgcCBgsAA==')
};

const right4 = left4;

const ball0 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('AAAAAAAwMAAAAA==')
};

const ball1 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('AAAAAAAAGBgAAA==')
};
const gol01 = {
  width: 8,
  height: 10,
  bpp: 1,
  transparent: 0,
  buffer: atob('ABhkhIS0sIAAAA==')
};

const gol11 = {
  width: 8,
  height: 10,
  bpp: 1,
  buffer: require('heatshrink').decompress(atob('gEYk0hkMthsBBAI='))

};

loadDigits();

let goalFrame = 0;
let score0 = 0;
let score1 = 0;

function printNumber (n, x, y, options) {
  if (n > 9 || n < -1) {
    console.log(n);
    return; // error
  }
  if (digit.length === 0) {
    g.setColor(1, 1, 1);
    if (options.scale == 0.2) {
      g.setFont12x20(1);
    } else {
      g.setFont12x20(2.5);
    }
    g.drawString('' + n, x, y);
    return;
  }
  const img = (n == -1) ? dash : digit[n];
  if (img) {
    //   g.setColor(0,0,0);
    //   g.fillRect(x,y,x+32*options.scale,64*options.scale);
    g.setColor(1, 1, 1);
    g.drawImage(img, x, y, options);
  }
}
let inc = 0;
let msinc = 0;
let seq0 = 0;
let seq1 = 0;
let goaler = -1;
const w = g.getWidth();
let owner = -1;
g.setBgColor(0, 0, 0);
g.clear();
g.setColor(1, 1, 1);
function onStop () {
  if (goalFrame > 0) {
    return;
  }
  stopped = !stopped;
  if (stopped) {
    // Bangle.beep();
    if (msinc == 0) {
      // GOOL
      if (owner == 0) {
        score0++;
        goaler = 0;
      } else if (owner == 1) {
        score1++;
        goaler = 1;
      }
      goalFrame = 5;
    }
    let newOwner = 0;
    if (msinc % 2) {
      newOwner = 1;
    } else {
      newOwner = 0;
    }
    if (newOwner) {
      seq0--;
      seq1++;
    } else {
      seq0++;
      seq1--;
    }
    if (seq0 < 0) seq0 = 0;
    if (seq0 > 3) seq0 = 3;
    if (seq1 < 0) seq1 = 0;
    if (seq1 > 3) seq1 = 3;
    owner = newOwner;
  }
  refresh();
  refresh_ms();
}
var stopped = true;
Bangle.on('tap', function (pos) {
  console.log('touch', pos);
  if (endGame) {
    Bangle.beep();
    score0 = 0;
    score1 = 0;
    seq0 = 0;
    seq1 = 0;
    inc = 0;
    msinc = 0;
    stopped = true;
    endGame = false;
  } else {
    if (inc == 0) {
      autogame();
    } else {
      onStop();
    }
  }
});
g.setFont12x20(3);
let part = 0;
let endInc = 0;
var endGame = false;
function refresh () {
  g.clear();
  if (inc > 59) {
    inc = 0;
    part++;
  }
  if (inc > 44) {
    if (part < 2) {
      part++;
    }
    if (part >= 2) {
      if (score0 != score1) {
        endGame = true;
        endInc = inc;
        inc = 0;
      }
    }
    // end of 1st or 2nd part of the game?
  }
  let two = (inc < 10) ? '0' + inc : '' + inc;
  if (endGame) {
    g.setColor(0, 0, 0);
    g.fillRect(0, 64, w, h);
    if (inc % 2) {
      two = (endInc < 10) ? '0' + endInc : '' + endInc;
      printNumber(-1, 2, 64 + 16, { scale: 0.4 });
      printNumber(part, 34, 64 + 16, { scale: 0.4 });
      printNumber(two[0], 74, 64 + 16, { scale: 0.4 });
      printNumber(two[1], 74 + 32, 64 + 16, { scale: 0.4 });
    }
  } else {
  // seconds
    printNumber(0, 2, 64 + 16, { scale: 0.4 });
    printNumber(part, 34, 64 + 16, { scale: 0.4 });
    printNumber(two[0], 74, 64 + 16, { scale: 0.4 });
    printNumber(two[1], 74 + 32, 64 + 16, { scale: 0.4 });
  }
  refresh_ms();
  refresh_score();
  refresh_pixels();
}

function refresh_pixels () {
  let frame4 = inc % 2;
  if (goalFrame > 0) {
    frame4 = goalFrame % 2;
    if (goaler == 0) {
      g.drawImage(frame4 ? right4 : right0, 20, 10, { scale: 5 });
      g.setColor(1, 1, 1);
      g.drawImage(gol11, w - 50, 10, { scale: 5 });
    } else if (goaler == 1) {
      g.drawImage(frame4 ? left0 : left4, w - 50, 10, { scale: 5 });
      g.setColor(1, 1, 1);
      g.drawImage(gol01, 30, 10, { scale: 5 });
    }
    return;
  }
  if (endGame) {
    if (score0 > score1) {
      g.drawImage(frame4 ? right1 : right0, 5 + (seq0 * 10), 10, { scale: 5 });
    } else if (score0 < score1) {
      g.drawImage(frame4 ? left0 : left1, w - 30 - (seq1 * 10), 10, { scale: 5 });
    }
    return;
  }
  g.drawImage(frame4 ? right1 : right0, 5 + (seq0 * 10), 10, { scale: 5 });
  g.drawImage(frame4 ? left0 : left1, w - 30 - (seq1 * 10), 10, { scale: 5 });
  let bx = (owner == 0) ? w / 3 : w / 2;
  bx += 2;
  g.drawImage(frame4 ? ball0 : ball1, bx, 10, { scale: 5 });
}
let dots = 0;
function refresh_dots () {
  if (endGame) {
    dots = 0;
  } else {
    dots++;
  }
  if (dots % 2) {
    g.setColor(1, 1, 1);
  } else {
    g.setColor(0, 0, 0);
  }
  const x = 67;
  let y = 100;
  g.fillRect(x, y, x + 4, y + 4);
  y += 16;
  g.fillRect(x, y, x + 4, y + 4);
}

const h = g.getHeight();

function refresh_ms () {
  if (endGame) {
    if (inc % 2) {
      printNumber(-1, 80 + 64 - 4, 64 + 16 + 8 + 16, { scale: 0.2 });
      printNumber(-1, 80 + 64 + 16 - 4, 64 + 32 + 8, { scale: 0.2 });
    }
    return;
  }
  // nanoseconds
  if (msinc > 59) {
    msinc = 0;
  }
  g.setColor(0, 0, 0);
  g.fillRect(80 + 64, h / 2, 80 + 64 + 32, g.getHeight());
  const two = (msinc < 10) ? '0' + msinc : '' + msinc;
  printNumber(two[0], 80 + 64 - 4, 64 + 16 + 8 + 16, { scale: 0.2 });
  printNumber(two[1], 80 + 64 + 16 - 4, 64 + 32 + 8, { scale: 0.2 });
}

function refresh_score () {
  g.setColor(0, 0, 0);
  g.fillRect(0, h - 32, w, h);
  let two = (score0 < 10) ? '0' + score0 : '' + score0;
  printNumber(two[0], 64 - 16, 32 + 64 + 16 + 8 + 16, { scale: 0.2 });
  printNumber(two[1], 64, 32 + 64 + 32 + 8, { scale: 0.2 });
  two = (score1 < 10) ? '0' + score1 : '' + score1;
  printNumber(two[0], 32 + 64, 32 + 64 + 16 + 8 + 16, { scale: 0.2 });
  printNumber(two[1], 32 + 64 + 16, 32 + 64 + 32 + 8, { scale: 0.2 });
}
refresh();

setInterval(function () {
  if (!stopped || endGame) {
    inc++;
  }
  if (goalFrame > 0) {
    goalFrame--;
  }
  refresh();
}, 1000);

setInterval(function () {
  refresh_dots();
}, 500);

setInterval(function () {
  if (!stopped) {
    msinc++;
    if (msinc > 59) {
      msinc = 0;
    }
  }
}, 10);

setInterval(function () {
  if (!stopped) {
    refresh_ms();
  }
}, 250);

function autogame () {
  if (endGame) {
    return;
  }
  onStop();
  if (stopped) {
    setTimeout(autogame, 500);
  } else {
    setTimeout(autogame, 315 + 10 * (Math.random() * 5));
  }
}

Bangle.setOptions({ lockTimeout: 0, backlightTimeout: 0 });
autogame();
