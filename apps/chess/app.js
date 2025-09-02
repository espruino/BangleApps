// Using p4wn chess engine: https://p4wn.sourceforge.net/ | https://github.com/douglasbagnall/p4wn
const engine = require("chessengine");

Bangle.loadWidgets(); // load before first appRect call

const FIELD_WIDTH = Bangle.appRect.w/8;
const FIELD_HEIGHT = Bangle.appRect.h/8;
const SETTINGS_FILE = "chess.json";
const ICON_SIZE=45;
const get_icon_bishop = () => require("heatshrink").decompress(atob("lstwMB/4Ac/wFE4IED/kPAofgn4FDGon8j4QEBQgQE4EHBQcACwfAgF/BQYWD8EAHAX+NgI4C+AQEwAQDDYIhDDYMDCAQKBGQQsHHogKDCAJODCAI3CHoQKCHoIQDHoIQCFgoQBFgfgIQYmBEIQECKgIrCBYQKDC4OBg/8iCvEAC+AA="));
const get_icon_pawn = () => require("heatshrink").decompress(atob("lstwMB/4At/AFEGon4h4FDwE/AgX8CAngCAkAv4bDgYbECAf4gAhD4AhD/kAg4mDCAkACAYbBEIYQBG4gbDEII9DFhXAgEfBQYWDEwJUC/wKBGQXwCAgEBE4RCBCAYmBCAQmCCAQmBCAbdCCAIbCQ4gAYwA="));
const get_icon_king = () => require("heatshrink").decompress(atob("lstwMB/4Ac/wFE+4KEh4FD+F/AofvCwgKE+IKEg4bEj4FDwADC/k8g+HAoJhCC4PwAoQXBNod//AECgYfBAoUP/gQE8AQEBQcfCAaLBCAZmBEIZuBBQgyDJAIWCPgXAEAQWDBQRUCPgQnBHgJqBLwYhDOwRvDGQc/EIaSDCwLedwAA=="));
const get_icon_queen = () => require("heatshrink").decompress(atob("lstwMB/4Ac/l/AgXn4PzAgP+j0Ph4FB8FwuE///PgeDwPn/k8n0+j0f4Hz+Px8F+g/Px+fgf4vgACn/jAAf/x8Pj0en/8vAsB+P/+PBwcHj//w0MjEwJgMwsHBw5CBwMEhBDBPoR6B/gFCDYPgAoRZBAgUH//4AoQbB4AbDCAYbBCAZ1CAgJ7CwAKDGQQmBCAYmBEIQmC+AQEDYQQBDYQQCFgo3CXQIsFBYIEDACmAA="));
const get_icon_rook = () => require("heatshrink").decompress(atob("lstwMB/4Ax/0HgPAAoPwnEOg4FBwBFBn///gEBI4XgAoMPAoJWCv4QDDYXwBQf/4AKD/wmDCARuDGQImCEIQbCGQMDCAQKBj4EB/AFBBQQsgDYQQCNQQhCOog3CCAQ3BEIRvCAoSRCE4IxCKgQmCKgYAZwA="));
const get_icon_knight = () => require("heatshrink").decompress(atob("lstwMB/4Ann1/AgX48IKD4UPAgX+gEHAoXwgALDJQMfDYQFBEQWAgBSCBQQcC4AFBn///hnCBQPgAgMDGIQnDGIIQDAgQQBEwQQCGIIQCEwMECAQxBsAQBEwMPCAQmBAIJDB4EPDoM/CAIoBKgP4BQQQB/AzCKgJlIPgQ+COwJlCHoJlDJwJlDS4aBDDYQsCADOA"));

const settings = Object.assign({
  state: engine.P4_INITIAL_BOARD,
  computer_level: 0, // default to "stupid" which is the fastest
  buzz: false, // Buzz when computer move is done
}, require("Storage").readJSON(SETTINGS_FILE,1) || {});

const ovr = Graphics.createArrayBuffer(Bangle.appRect.w,Bangle.appRect.h,2,{msb:true});
const curfield = [4*FIELD_WIDTH, 6*FIELD_HEIGHT]; // e2
const startfield = Array(2);
let piece_sel = 0;
let showmenu = false;
let finished = false;

const writeSettings = () => {
  settings.state = engine.p4_state2fen(state);
  require('Storage').writeJSON(SETTINGS_FILE, settings);
};

const generateBgImage = () => {
  let buf = Graphics.createArrayBuffer(Bangle.appRect.w,Bangle.appRect.h,1,{msb:true});
  for(let idxrow=0; idxrow<8; idxrow++) {
    for(let idxcol=0; idxcol<8; idxcol++) {
      const bgCol = idxrow % 2 != idxcol % 2 ? 0 : 1;
      const x = idxcol*FIELD_WIDTH;
      const y = idxrow*FIELD_HEIGHT;
      buf.setColor(bgCol).fillRect({x:x, y:y, w:FIELD_WIDTH, h:FIELD_HEIGHT});
    }
  }
  return {width:buf.getWidth(), height:buf.getHeight(),
          buffer:buf.buffer
        };
};

const idx2Pos = (idxcol, idxrow) => {
  "ram"
  return 2*(1+8+1) + (7-idxrow)*(1+8+1) + idxcol + 1;
};

const drawPiece = (buf, x, y, piece) => {
  let icon;

  switch(piece & ~0x1) {
    case engine.P4_PAWN:
      icon = get_icon_pawn();
      break;
    case engine.P4_BISHOP:
      icon = get_icon_bishop();
      break;
    case engine.P4_KING:
      icon = get_icon_king();
      break;
    case engine.P4_QUEEN:
      icon = get_icon_queen();
      break;
    case engine.P4_ROOK:
      icon = get_icon_rook();
      break;
    case engine.P4_KNIGHT:
      icon = get_icon_knight();
      break;
  }

  if (icon) {
    const scale = FIELD_HEIGHT/ICON_SIZE;
    buf.drawImage(icon, x+(FIELD_WIDTH-(ICON_SIZE*scale))/2, y, {scale: scale});
  }
  return buf;
};

const drawBoard = () => {
  //console.log("Free: " + process.memory().free);

  g.setBgColor("#555").setColor("#aaa").drawImage(bgImage, Bangle.appRect.x, Bangle.appRect.y);
  for(let idxrow=0; idxrow<8; idxrow++) {
    for(let idxcol=0; idxcol<8; idxcol++) {
      const x = idxcol*FIELD_WIDTH+Bangle.appRect.x;
      const y = idxrow*FIELD_HEIGHT+Bangle.appRect.y;

      const pos = idx2Pos(idxcol, idxrow);
      const field = state.board[pos];

      if (field) {
        const fgCol = field & 0x1 ? "#000" : "#fff";
        drawPiece(g.setBgColor(fgCol), x, y, field);
      }
    }
  }
};

const roundX = (x) => {
  return Math.round(x/FIELD_WIDTH)*FIELD_WIDTH;
};

const roundY = (y) => {
  return Math.round(y/FIELD_HEIGHT)*FIELD_HEIGHT;
};

const drawSelectedField = () => {
  ovr.clear();
  if (!showmenu && !finished) {
    if (startfield[0] !== undefined && startfield[1] !== undefined) {
      // remove piece from startfield
      const x = startfield[0];
      const y = startfield[1];
      ovr.setColor(2).fillRect({x:x, y:y, w:FIELD_WIDTH, h:FIELD_HEIGHT});
    }

    const x = roundX(curfield[0]);
    const y = roundY(curfield[1]);
    ovr.setColor(piece_sel ? 1 : 2)
      .drawRect({x:x+1, y:y, w:FIELD_WIDTH-2, h:FIELD_HEIGHT})
      .drawRect({x:x+2, y:y+1, w:FIELD_WIDTH-4, h:FIELD_HEIGHT-2})
      .drawRect({x:x+3, y:y+2, w:FIELD_WIDTH-6, h:FIELD_HEIGHT-4});
    if (piece_sel) {
      drawPiece(ovr.setBgColor(1), x, y, piece_sel);
      ovr.setBgColor(0); // back to transparent
    }
  }
  Bangle.setLCDOverlay({width:ovr.getWidth(), height:ovr.getHeight(),
          bpp:2, transparent:0,
          palette:new Uint16Array([0, g.toColor("#F00"), g.toColor("#0F0"), 0]),
          buffer:ovr.buffer
        },Bangle.appRect.x,Bangle.appRect.y);
};

const isInside = (rect, e) => {
  return e.x>=rect.x && e.x<rect.x+rect.w
    && e.y>=rect.y && e.y<=rect.y+rect.h;
};

const showAlert = (msg, cb) => {
  showmenu = true;
  drawSelectedField();
  E.showAlert(msg).then(function() {
    showmenu = false;
    drawBoard();
    drawSelectedField();
    if (cb) {
      cb();
    }
  });
};

const move = (from,to,cbok) => {
  const res = state.move(from, to);
  //console.log(res);
  if (!res.ok) {
    showAlert("Illegal move");
  } else {
    if (res.flags & engine.P4_MOVE_FLAG_MATE) {
      finished = true;
      showAlert("Checkmate or stalemate", cbok);
    } else if (res.flags & engine.P4_MOVE_FLAG_CHECK) {
      showAlert("A king is in check", cbok);
    } else if (res.flags & engine.P4_MOVE_FLAG_DRAW) {
      showAlert("A draw is available", cbok);
    } else if (cbok) {
      cbok();
    }
  }
  return res;
};

const showMessage = (msg) => {
  g.setColor("#f00").setFont("4x6:2").setFontAlign(-1,1).drawString(msg, 10, Bangle.appRect.y2-10).flip();
};

// Run

g.reset();
const bgImage = generateBgImage();
let state = engine.p4_fen2state(settings.state);
drawBoard();
drawSelectedField();
Bangle.drawWidgets();

// drag selected field
Bangle.on('drag', (ev) => {
  if (showmenu) return;
  const newx = curfield[0]+ev.dx;
  const newy = curfield[1]+ev.dy;
  if (newx >= 0 && newx <= 7*FIELD_WIDTH) {
    curfield[0] = newx;
  }
  if (newy >= 0 && newy <= 7*FIELD_HEIGHT) {
    curfield[1] = newy;
  }
  drawSelectedField();
});

// touch to start/stop moving a piece
Bangle.on('touch', (button, xy) => {
  if (isInside(Bangle.appRect, xy) && !showmenu) {
    if (piece_sel === 0) {
      startfield[0] = roundX(curfield[0]);
      startfield[1] = roundY(curfield[1]);
      const startpos = idx2Pos(startfield[0]/FIELD_WIDTH, startfield[1]/FIELD_HEIGHT);
      piece_sel = state.board[startpos];
      if (piece_sel === 0) {
        startfield[0] = startfield[1] = undefined;
        // nothing here, do nothing
        return;
      }
    } else { // piece_sel === 0
      const colTo = roundX(curfield[0]);
      const rowTo = roundY(curfield[1]);
      if (startfield[0] !== colTo || startfield[1] !== rowTo) {
        showMessage(/*LANG*/"Moving..");
        const posFrom = idx2Pos(startfield[0]/FIELD_WIDTH, startfield[1]/FIELD_HEIGHT);
        const posTo = idx2Pos(colTo/FIELD_WIDTH, rowTo/FIELD_HEIGHT);
        const cb = () => {
          // human move ok, update
          drawBoard();
          drawSelectedField();
          if (!finished) {
            // do computer move
            Bangle.setBacklight(false); // this can take some time, turn off to save power
            showMessage(/*LANG*/"Calculating..");
            const compMove = state.findmove(settings.computer_level+1);
            const result = move(compMove[0], compMove[1]);
            if (result.ok) {
              writeSettings();
            }
            Bangle.setLCDPower(true);
            Bangle.setLocked(false);
            Bangle.setBacklight(true);
            if (settings.buzz) {
              Bangle.buzz(500);
            }
            if (!showmenu) {
              showAlert(result.string);
            }
          }
        };
        move(posFrom, posTo,cb);
      } // piece_sel === 0
      startfield[0] = startfield[1] = undefined;
      piece_sel = 0;
    }
    drawSelectedField();
  }
});

// show menu on button
setWatch(() => {
  if (showmenu) {
    return;
  }
  showmenu = true;
  piece_sel = 0;
  startfield[0] = startfield[1] = undefined;
  drawSelectedField();

  const closeMenu = () => {
      showmenu = false;
      E.showMenu();
      drawBoard();
      drawSelectedField();
  };

  E.showMenu({
    "" : { title : /*LANG*/"Chess settings" },
    "< Back" : () => closeMenu(),
    /*LANG*/"Exit" : () => load(),
    /*LANG*/"New Game" : () => {
      finished = false;
      state = engine.p4_fen2state(engine.P4_INITIAL_BOARD);
      writeSettings();
      closeMenu();
    },
    /*LANG*/"Undo Move" : () => {
      state.jump_to_moveno(-2);
      writeSettings();
      closeMenu();
    },
    /*LANG*/'Level': {
      value: settings.computer_level,
      min: 0, max: 4,
      format: v => [/*LANG*/'stupid', /*LANG*/'middling', /*LANG*/'default', /*LANG*/'slow', /*LANG*/'slowest'][v],
      onchange: v => {
        settings.computer_level = v;
        writeSettings();
      }
    },
    /*LANG*/'Buzz on next turn': {
      value: !!settings.buzz,
      onchange: v => {
        settings.buzz = v;
        writeSettings();
      }
    },
  });
}, BTN, { repeat: true, edge: "rising" });
