const sprites = [
  atob("EBWDASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSQACSSSSSP5ASSSSR/JICSSSJJJJASSSJIBJASSSBB+IASSSOB+BwSSSR+B+CSSSSP/wSSSSSQACSSQ=="),
                 atob("EBWDASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSASSSSSSSIASSSSSRJIASSQCRJJIASICNJJAABIBthAABJARgAAJIACSBJAJJACSSJJBIACSSQJIAASSSSQAASSSSSSQSSSQ=="),
                 atob("EBWDASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSAACSSSSRthgSSSSNsNgSSSRttsMCSSRtttsCSSNtddsCSRtsNdsCSRLJbJASSSLJJACSSSSALZASSSSAKJASSSRIBIACSSQIKBRQSSSARaACSSSSSACSQ=="),
                 atob("EBWDASSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSACSSSSSBhgCSSSRthtgSSSNthtgSSSNtttsCSBNtttsCRJNv9tsCRJJh9tgCRJJNtgMCSJJAANhgSQAMNthgSSSNhsNgCSSRsBsMCSSSAAAASSSSSASSQ=="),
                 atob("EBWDAkkAAAAAkkh////+Ekh////+Ekh////+Ekg22222EkgwAAAGEgAxyAAGABwwAAAGOBwwAAAGGBwwAAAGGBw22222GBwSSQACGBw22222GBwSSSSSGB+AAAAA+B//////+ASAAAAASABzzzz+AEgySSSeEkhzz/+eEkg22222Eg=="),
                 atob("EBWDASSSQACSSSSQLRQCSSALaLbQARbRbRaLaBbRbbaLaBaBbbaBaCBRbbaKASOL7/fRwSQP///wCSR/x+P+CSSPx+PwSSSQP/wCSSSBAAIASSR+J/B+CSR+JJB+CSSJJJJASSSQJJACSSSR+B+CSSSSASASSSSSSSSSSSSSSSSSSQ==")
];

const tiles = [
  atob("EBCDAVlllllllssMMssMMkFlkEFlkMsssssssllllllllssssssssllllllllssssssssllllllllssMMssMMkFlkEFlkMsssssssllllllllssssssssllllllllssssssssg=="),
  atob("EBCDAVlllllllssMMssMMkFlkEFlkMsssssssllllllllssssssssllllllllssssssssllllrrpLssMMtdLZUFlkLpZLMssstJZLFlllpZLZsssspZJNVlllrLZrsssstZNdQ=="),
  atob("EBCDAFkkllkklkkskkkskkkkkkkkkskkkskkkkkklkkklkkkkkkkklkkklkkkkkkkkkkklkkllkklkkskkkskkkkkkkkkskkkskkkkkklkkklkkkkkkkklkkklkkkkkkkkkkkg=="),
  atob("EBCDAdtttttttsNsNsNsNhhhhhhhhgkEhgkEhsEghsEghkEggkEggkggEkggEskAlskAlttttttttsNsNsNsNhhhhhhhhgkEhgkEhsEghsEghkEggkEggkggEkggEskAlskAlg==")
];

const walk = [
atob("EBWDASSSSSSSSSSAAAASSSRJJJICSSRJJJJASSJJJJJwCSJJJJJxASJJJJJxASBJJJAJASABJIJICSAAAAAASSQMNsNgSSSMNtsCSSRBttgSSSNmAACSSSGAG2ASSSA2GxsCSSGAAxsCSSQw2AASSSQAwACSSSRsCSSSSSSASSSSSQ=="),
                 atob("EBWDASSAAAASSSRJJJICSSRJJJJASSJJJJJwCSJJJJJxASJJJJJxASBJJJAJASABJIJICSAAAAAASSQMNsNgSSSMNtsCSSRBttgSSSJIAACSSSMAGwwSSSA2GwwSSSGAGwwSSSQwNgCSSSSAwGCSSSSSG2CSSSSSBsCSSSSSQASSSQ=="),
                 atob("EBWDASSSSSSSSSSAAAASSSRJJJICSSRJJJJASSJJJJJwCSJJJJJxASJJJJJxASBJJJAJASABJIJICSAAAAAASSQMNsNgSSSMNtsCSSRBttgSSSNmAACSSSGwGGwSSSANg2wSSSGNgGASSSQwAwGCSSSAAG2CSSSSSNgCSSSSSQASSQ=="),
  0
];
walk[3] = walk[1];

const scale = 2;
const mapWidth = Math.ceil(176 / (16 * scale));
const mapHeight = 4;
const map = new Uint8Array(mapWidth * mapHeight);
const Y = 176 - mapHeight/2*16*scale - 16*scale/2;
let frame = 0;

function init() {
  g.clear();
  g.setFont('6x8', 4);
  g.setFontAlign(0, 0.5);
  for (let i = 0; i < mapWidth; ++i)
    shiftMap();
}

function tick(full){
  frame++;

  var d = new Date();
  var h = d.getHours(), m = d.getMinutes();
  var time = (" "+h).substr(-2) + ":" + m.toString().padStart(2,0);

  g.setColor(g.theme.fg);
  g.drawString(time, 176/2, (176 - mapHeight * 16 * scale) / 2, true);

  if (full) {
    let py = (176 - mapHeight * 16 * scale);
    g.setColor(g.theme.bg);
    g.fillRect(0, py - 5 * scale, 176, py);
    if (!(frame & 3))
      shiftMap();
    drawMap();
    g.drawImage(walk[frame & 3], 16 * scale, Y, {scale:2});
  }
}

function shiftMap() {
  for (let y = 0; y < mapHeight; ++y) {
    const i = y * mapWidth;
    for (let x = 0; x < mapWidth - 1; ++x) {
      map[i + x] = map[i + x + 1];
    }
    const t = Math.random() * tiles.length | 0;
    const s = Math.random() < 0.95 ? 0 : 1 + Math.random() * sprites.length | 0;
    map[i + mapWidth - 1] = t | (s << 4);
  }
}

function drawMap(){
  let py = (176 - mapHeight * 16 * scale);
  for (let y = 0; y < mapHeight; ++y, py += 16 * scale) {
    const i = y * mapWidth;
    for (let x = 0; x < mapWidth; ++x) {
      let M = map[i + x];
      let t = M & 0xF;
      g.drawImage(tiles[t], x * 16 * scale, py, {scale:2});
    }
  }
  py = (176 - mapHeight * 16 * scale) - 5 * scale;
  for (let y = 0; y < mapHeight; ++y, py += 16 * scale) {
    const i = y * mapWidth;
    for (let x = 0; x < mapWidth; ++x) {
      let M = map[i + x];
      let s = M >> 4;
      if (s)
        g.drawImage(sprites[s - 1], x * 16 * scale, py, {scale:2});
    }
  }
}


init();
tick(true);

var interval = setInterval(tick, 700);
Bangle.on("lock", (locked) => {
  clearInterval(interval);
  tick();
  interval = setInterval(tick.bind(null, !locked), locked ? 60 * 1000 : 700);
});
