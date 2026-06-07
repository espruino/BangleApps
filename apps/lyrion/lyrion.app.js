//Bangle.js 2 - Tasker Music Controller
// Uses Gadgetbridge JSON intents

const CENTER = {
  x: g.getWidth()/2,
  y: g.getHeight()/2,
  r: 55
};


const MENU_BTN = {
  cx: g.getWidth() - 24,
  cy: g.getHeight() - 24,
  r: 20
};


let nowPlaying = {
  artist: "",
  title: ""
};

let inMenu = false;


//Recieve now playing information
Bluetooth.on('data', data => {
  try {
    const msg = JSON.parse(data);
    if (msg.t === "musicinfo") {
      nowPlaying.artist = msg.artist || "";
      nowPlaying.title = msg.title || "";
      drawUI();
    }
  } catch (e) {
    // Ignore non-JSON packets
  }
});

// -------- Intent Sender --------
function sendIntent(action) {
  Bluetooth.println(JSON.stringify({
    t: "intent",
    action: action
  }));
  Bangle.buzz(40);
}

// -------- UI Drawing --------
function drawUI() {
  g.clear();

  if (inMenu) return;

  
  // Title
  g.setFont("6x8", 2);
  g.setFontAlign(0, -1);
  g.drawString("LYRION PLAYER", g.getWidth()/2, 8);


// Hamburger menu (bottom-right)
g.setFontAlign(0, 0);
g.drawString("\u2630", MENU_BTN.cx, MENU_BTN.cy);


// Theme-safe color
g.setColor(g.theme.fg);

// Play button outer ring
for (let i = 0; i < 4; i++) {
  g.drawCircle(CENTER.x, CENTER.y, CENTER.r - i);
}

// Play triangle
g.fillPoly([
  CENTER.x - 12, CENTER.y - 18,
  CENTER.x - 12, CENTER.y + 18,
  CENTER.x + 20, CENTER.y
]);


// Now playing text (bottom)
g.setFont("6x8", 1);
g.setFontAlign(0, -1);

const text = nowPlaying.artist
  ? nowPlaying.artist + " - " + nowPlaying.title
  : "";

if (text) {
  g.drawString(text, g.getWidth()/2, g.getHeight() - 20);
}


  g.flip();
}

drawUI();

// -------- Touch Handling --------
Bangle.on("touch", (btn, xy) => {

  if (inMenu) return;

  // ---- Menu button (circular hitbox) ----
  const mdx = xy.x - MENU_BTN.cx;
  const mdy = xy.y - MENU_BTN.cy;
  if ((mdx*mdx + mdy*mdy) <= MENU_BTN.r*MENU_BTN.r) {
    openMenu();
    return;
  }

  // ---- Play / Pause button ----
  const pdx = xy.x - CENTER.x;
  const pdy = xy.y - CENTER.y;
  if ((pdx*pdx + pdy*pdy) <= CENTER.r*CENTER.r) {
    sendIntent("com.lyrion.TASKER_PLAY_PAUSE");
  }
});


// -------- Swipe Controls --------
Bangle.on("swipe", dir => {
  if (dir === 1)
    sendIntent("com.lyrion.TASKER_NEXT");        // right
  else if (dir === -1)
    sendIntent("com.lyrion.TASKER_VOLUME_DOWN"); // left unused, optional
});

let dragStartY = null;

Bangle.on("drag", e => {

  // Finger down
  if (e.b && dragStartY === null) {
    dragStartY = e.y;
    return;
  }

  // Finger released
  if (!e.b && dragStartY !== null) {
    const dy = e.y - dragStartY;

    if (dy < -40) {
      sendIntent("com.lyrion.TASKER_VOLUME_UP");
    } else if (dy > 40) {
      sendIntent("com.lyrion.TASKER_VOLUME_DOWN");
    }

    dragStartY = null;
  }
});


// -------- Hardware Power Button --------
setWatch(() => {
  sendIntent("com.lyrion.TASKER_POWER");
}, BTN1, { repeat:true, edge:"falling" });


function restoreUI() {
  Bangle.setUI({
    mode : "custom",
    back : drawUI
  });
  drawUI();
}


function openMenu() {
  inMenu = true;

  Bangle.setUI(); // release custom UI

  function select(action) {
    sendIntent(action);
    inMenu = false;
    setTimeout(restoreUI, 150);
  }

  const menu = {
    "" : { title : "Favorites" },
    "KXT" : () => select("com.lyrion.TASKER_PLAY_KXT"),
    "Pandora" : () => select("com.lyrion.TASKER_PLAY_PANDORA"),
    "Squeezebox" : () => select("com.lyrion.TASKER_PLAY_SQUEEZE"),
    "WRCJ" : () => select("com.lyrion.TASKER_PLAY_WRCJ"),
    "< Back" : () => {
      inMenu = false;
      setTimeout(restoreUI, 50);
    }
  };

  E.showMenu(menu);
}


// -------- Power Management --------


Bangle.setUI({
  mode : "custom",
  back : drawUI
});


restoreUI();


// ---------- Init ----------

// ---------- To handle gadgetbridge not ready ----------
  setTimeout(() => {
    Bluetooth.println("");
  }, 500);