const chords = {
  // name: [name, ...finger_placement, fret],
  c: ["C", "0X", "33", "22", "x", "11", "x", 0],
  d: ["D", "0X", "0X", "x", "21", "33", "22", 0],
  dm: ["Dm", "0x", "0x", "x", "22", "33", "11", 0],
  e: ["E", "x", "22", "23", "11", "x", "x", 0],
  em: ["Em", "x", "22", "23", "x", "x", "x", 0],
  em7: ["Em7", "x", "11", "x", "x", "x", "x", 0],
  f: ["F", "0x", "0x", "33", "22", "11", "11", 0],
  g: ["G", "32", "21", "x", "x", "x", "33", 0],
  am: ["Am", "0X", "x", "21", "22", "23", "x", 0],
  a: ["A", "0x", "x", "23", "22", "11", "x", 0],
  b7: ["B7", "0x", "22", "11", "23", "x", "24", 0],
  cadd9: ["Cadd9", "0x", "32", "21", "x", "33", "34", 0],
  dadd11: ["Dadd11", "0x", "33", "22", "x", "11", "x", 3],
  csus2: ["Csus2", "0x", "33", "x", "x", "11", "0x", 0],
  gadd9: ["Gadd9", "32", "0x", "x", "21", "x", "33", 0],
  aadd9: ["Aadd9", "11", "33", "34", "22", "x", "x", 5],
  fsharp7add11: ["F#7add11", "21", "43", "44", "32", "x", "x", 0],
  d9: ["D9", "0x", "22", "11", "23", "23", "0x", 4],
  g7: ["G7", "33", "22", "x", "x", "34", "11", 0],
  bflatd: ["Bb/D", "0x", "33", "11", "11", "11", "0x", 3],
  e7sharp9: ["E7#9", "0x", "22", "11", "23", "34", "0x", 6],
  a11: ["A11", "33", "0x", "34", "22", "11", "0x", 0],
  a9: ["A9", "32", "0x", "33", "21", "34", "0x", 3],
}

const chordCache = {};
function drawChordCached(chord, x, y, options) {
  let image;
  if (chordCache[chord[0]]) {
    image = chordCache[chord[0]]
  } else {
    arrbuff = Graphics.createArrayBuffer(60,65,1,{msb:true});
    drawChord(arrbuff, chord, 0, 0, options);
    image = {width: arrbuff.getWidth(), height: arrbuff.getHeight(), bpp:arrbuff.getBPP(), buffer: arrbuff.buffer, transparent:0}
    chordCache[chord[0]] = image;
  }
  g.drawImage(image, x, y);
}


function drawChord(buffer, chord, x, y, options) {
  const stringWidths = options.stringWidths;
  const fretHeight = options.fretHeight;
  const circleSize = options.circleSize;
  const drawFinger = options.drawFinger;
  const drawCircleRim = options.drawCircleRim;

  const name = chord[0];
  chord = chord.slice(1);
  x += 2;
  buffer.setColor(0x1).setFontAlign(-1, -1).drawString(name, x, y);
  y += 15;
  for (let i = 0; i < 6; i++) {
    buffer.drawLine(x + i * stringWidths, y, x + i * stringWidths, y + fretHeight*4);
  }
  for (let i = 0; i < 5; i++) {
    buffer.fillRect(x - 1, y + i * fretHeight - 1, x + stringWidths * 5 + 1, y + i * fretHeight + 1);
  }

  for (let i = 0; i < 6; i++) {
      const xPos = x + i * stringWidths;
      let yPos = y + fretHeight * parseInt(chord[i][0]) - fretHeight/2

      if (chord[i] === "x") {
        buffer.setColor(0x1).drawCircle(xPos, y - 5, 2);
        continue;
      }
      if (chord[i] === "0x") {
        buffer.setFontAlign(0, 0);
        buffer.setColor(0x1).drawString('x', xPos, y - 5);
        continue;
      }
      buffer.setFontAlign(0, 0);
      if (drawFinger) {
        buffer.setColor(0x0).fillCircle(xPos, yPos, circleSize);
        if (drawCircleRim) {
          buffer.setColor(0x1).drawCircle(xPos, yPos, circleSize);
        }
        buffer.setColor(0x1).drawString(chord[i][1], xPos, yPos);
      } else {
        buffer.setColor(0x1).fillCircle(xPos, yPos, circleSize);
        buffer.setFontAlign(0, -1)
        buffer.setColor(0x1).drawString(chord[i][1], xPos, y + fretHeight*4 + 2);
      }
  }
  if (chord[6] !== 0) {
    buffer.setFontAlign(-1, -1);
    buffer.drawString(chord[6] + 'fr', x + 5 * stringWidths + 2, y);
  }
}

const chordOptions = {
  stringWidths: 8,
  fretHeight: 10,
  circleSize: 2,
  drawFinger: false,
  drawCircleRim: false,
}

function drawApp(lyricsLines, chordsDraw, scrollY, chordScrollX) {
  const R = Bangle.appRect;

  g.setFont('6x8');
  if (scrollY < 60) {
    for (let i=0; i<chordsDraw.length; i++) {
      drawChordCached(chordsDraw[i], 3 + i*60 + chordScrollX, R.y + scrollY, chordOptions);
    }
  }
  const lineHeight = g.stringMetrics(' ').height;
  for (let i=0; i<lyricsLines.length; i++){
    const y = R.y + lineHeight * i + 60 + scrollY;
    if (y < -lineHeight) continue;
    if (y > R.y2) break;
    g.setFontAlign(-1, -1).drawString(lyricsLines[i], R.x, y);
  }
}

let currentScrollY = 0;
let chordScrollX = 0;
let currentChordScroll = 0;
let lyricsHeight = 0;

function main(song) {
  const lyrics = song.lyrics;
  const foundChords = song.chords;
  const lyricsLines = lyrics.split('\n');
  const chordsDraw = Object.values(chords).filter(c=>foundChords.includes(c[0]));

  g.clear();
  drawApp(lyricsLines, chordsDraw, currentScrollY, chordScrollX);
  lyricsHeight = g.stringMetrics(lyrics).height;
  Bangle.on('drag', (event) => {
    currentScrollY = Math.min(0, currentScrollY + event.dy);
    chordScrollX = Math.max(Math.min(0, chordScrollX + event.dx), -(chordsDraw.length - 3)*60);
    g.clear();
    drawApp(lyricsLines, chordsDraw, currentScrollY, chordScrollX);
  })
}

function mainMenu () {
  const songs = (
      require("Storage").readJSON("guitar_songs.json", true) ||
      [{'name': 'No songs', 'lyrics': 'Em\nPlease upload a song\nAm\nusing the Bangle App Loader', 'chords': ['Am', 'Em']}]
  );
  const menu = {
    "": {"title": "Guitar Songs"},
  };
  for (let i=0; i<songs.length; i++) {
    const song = songs[i];
    menu[song.name] = function() { main(song) };
  }
  E.showMenu(menu);
}

mainMenu();
