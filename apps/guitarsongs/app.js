const chords = [
  // name: [name, placement, fingers, fret],
  // sourced from https://github.com/spilth/chord_diagrams/blob/main/lib/chord_diagrams/fingerings.csv
  ['A', 'x02220', '', 0],
  ['B', 'x24442', '', 0],
  ['Bb', 'x13331', '', 0],
  ['C', 'x32010', '', 0],
  ['C#', 'x46664', '', 0],
  ['D', 'xx0232', '', 0],
  ['D#', 'x68886', '', 0],
  ['E', '022100', '', 0],
  ['Eb', 'x68886', '', 0],
  ['F', '133211', '', 0],
  ['F#', '244322', '', 0],
  ['G', '320003', '', 0],
  ['G#', '466544', '', 0],
  ['C5', 'x355xx', '', 0],
  ['D5', 'x577xx', '', 0],
  ['D#5', 'x688xx', '', 0],
  ['C6', 'x32210', '', 0],
  ['D6', 'xx0202', '', 0],
  ['E6', '022120', '', 0],
  ['G6', '320000', '', 0],
  ['A7', '002020', '', 0],
  ['B7', 'x21202', '', 0],
  ['C7', 'x32310', '', 0],
  ['C#7', 'x46464', '', 0],
  ['D7', 'x00212', '', 0],
  ['E7', '020100', '', 0],
  ['E7sus4', '020200', '', 0],
  ['F7', '131211', '', 0],
  ['F#7', '242322', '', 0],
  ['G7', '320001', '', 0],
  ['G#7', '464544', '', 0],
  ['AM7', 'x02120', '', 0],
  ['CM7', 'x32000', '', 0],
  ['DM7', 'xx0222', '', 0],
  ['EM7', 'xx2444', '', 0],
  ['FM7', '132211', '', 0],
  ['Cadd9', 'x32033', '', 0],
  ['Fadd9', 'xx3213', '', 0],
  ['Dsus2', 'xx0230', '', 0],
  ['Asus2', 'x02200', '', 0],
  ['Asus4', 'x02230', '', 0],
  ['Dsus4', 'xx0233', '', 0],
  ['Esus4', '022200', '', 0],
  ['A7sus4', '002030', '', 0],
  ['G7sus4', '353533', '', 0],
  ['G+', 'x21003', '', 0],
  ['Am', '002210', '', 0],
  ['Bm', 'x24432', '', 0],
  ['Cm', 'x35543', '', 0],
  ['C#m', 'x46654', '', 0],
  ['Dm', 'x00231', '', 0],
  ['Em', '022000', '', 0],
  ['Fm', '133111', '', 0],
  ['F#m', '244222', '', 0],
  ['Gm', '355333', '', 0],
  ['G#m', '466444', '', 0],
  ['Am7', '002010', '', 0],
  ['A#m7', 'x13121', '', 0],
  ['Bm7', 'x24232', '', 0],
  ['Cm7', 'x35343', '', 0],
  ['C#m7', 'x46454', '', 0],
  ['Dm7', 'x00211', '', 0],
  ['Em7', '020030', '', 0],
  ['Fm7', '131111', '', 0],
  ['F#m7', '242222', '', 0],
  ['Gm7', '353333', '', 0],
  ['Am9', 'x05557', '', 0],
  ['Bm11', 'x20220', '', 0],
  ['F#m11', '202200', '', 0],
  ['A/C#', '042220', '', 0],
  ['A/E', '00222x', '', 0],
  ['A/F#', '202220', '', 0],
  ['Bb/A', 'x00331', '', 0],
  ['C/B', 'x22010', '', 0],
  ['C/E', '032010', '', 0],
  ['D/A', 'x04232', '', 0],
  ['D/F#', '200232', '', 0],
  ['F/A', 'x03211', '', 0],
  ['G/B', 'x20003', '', 0],
  ['C7/G', '3323xx', '', 0],
  ['D7/F#', '200212', '', 0],
  ['G7/F', '123003', '', 0],
  ['D9/F#', '2x0210', '', 0],
  ['Am/D', 'xx0210', '', 0],
  ['Am/G', '302210', '', 0],
  ['A#m/D#', 'xx1321', '', 0],
  ['Dm/F', '10323x', '', 0],
  ['Gm/Bb', 'x10333', '', 0],
  ['A7/G', '302020', '', 0],
  ['G#dim', '4564xx', '', 0],
  ['Adim', 'x01212', '', 0],
  ['D#dim7', 'xx1212', '', 0],
  ['G#dim7', '456464', '', 0],
  ['Daug', 'xx0332', '', 0],
  ['Aaug', 'x03221', '', 0],
  ['Dadd11', 'xx0032', '', 0],
]

const chordHeight = 85;
const chordWidth = 80;

const chordOptions = {
  stringWidths: 12,
  fretHeight: 14,
  circleSize: 4,
  drawFinger: false,
  drawCircleRim: false,
}

const chordCache = {};
function drawChordCached(chord, x, y, options) {
  let image;
  if (chordCache[chord[0]]) {
    image = chordCache[chord[0]]
  } else {
    let arrbuff = Graphics.createArrayBuffer(chordWidth,chordHeight,1,{msb:true});
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
  x += 3;
  buffer.setFont('6x8').setColor(0x1).setFontAlign(-1, -1).drawString(name, x, y);
  y += 15;
  for (let i = 0; i < 6; i++) {
    buffer.drawLine(x + i * stringWidths, y, x + i * stringWidths, y + fretHeight*4);
  }
  for (let i = 0; i < 5; i++) {
    buffer.fillRect(x - 1, y + i * fretHeight - 1, x + stringWidths * 5 + 1, y + i * fretHeight + 1);
  }

  for (let i = 0; i < 6; i++) {
      const placement = chord[0];
      const fingers = chord[1];
      const xPos = x + i * stringWidths;
      let yPos = y + fretHeight * parseInt(placement[i]) - fretHeight/2

      if (placement[i] === "0") {
        buffer.setColor(0x1).drawCircle(xPos, y - 5, 2);
        continue;
      } else if (placement[i] === "x") {
        buffer.setFontAlign(0, 0);
        buffer.setColor(0x1).drawString('x', xPos, y - 5);
        continue;
      }
      buffer.setFontAlign(0, 0);
      if (drawFinger && chord[i].length>1) {
        buffer.setColor(0x0).fillCircle(xPos, yPos, circleSize);
        if (drawCircleRim) {
          buffer.setColor(0x1).drawCircle(xPos, yPos, circleSize);
        }
        if (parseInt(fingers[i])) {
          buffer.setColor(0x1).drawString(fingers[i], xPos, yPos);
        }
      } else {
        buffer.setColor(0x1).fillCircle(xPos, yPos, circleSize);
        buffer.setFontAlign(0, -1)
        if (parseInt(fingers[i])) {
          buffer.setColor(0x1).drawString(fingers[i], xPos, y + fretHeight*4 + 2);
        }
      }
  }
  if (chord[2] !== 0) {
    buffer.setFontAlign(-1, -1);
    buffer.drawString(chord[2] + 'fr', x + 5 * stringWidths + 2, y);
  }
}



function drawApp(lyricsLines, chordsDraw, scrollY, chordScrollX) {
  const R = Bangle.appRect;

  g.setFont('6x8');
  if (scrollY < chordHeight) {
    for (let i=0; i<chordsDraw.length; i++) {
      drawChordCached(chordsDraw[i], 3 + i*chordWidth + chordScrollX, R.y + scrollY, chordOptions);
    }
  }
  const lineHeight = g.stringMetrics(' ').height;
  for (let i=0; i<lyricsLines.length; i++){
    const y = R.y + lineHeight * i + chordHeight + scrollY;
    if (y < -lineHeight) continue;
    if (y > R.y2) break;
    g.setFontAlign(-1, -1).drawString(lyricsLines[i], R.x, y);
  }
}

let currentScrollY = 0;
let chordScrollX = 0;
//let currentChordScroll = 0;
//let lyricsHeight = 0;

function main(song) {
  const lyrics = song.lyrics;
  const foundChords = song.chords;
  const lyricsLines = lyrics.split('\n');
  const chordsDraw = chords.filter(c=>foundChords.includes(c[0]));
  const R = Bangle.appRect;
  g.clear();
  drawApp(lyricsLines, chordsDraw, currentScrollY, chordScrollX);
  /*lyricsHeight =*/ g.stringMetrics(lyrics).height;
  Bangle.on('drag', (event) => {
    currentScrollY = Math.min(0, currentScrollY + event.dy);
    chordScrollX = Math.max(Math.min(0, chordScrollX + event.dx), -(song.chords.length*chordWidth - R.x2));
    g.clear();
    drawApp(lyricsLines, chordsDraw, currentScrollY, chordScrollX);
  })
}

function mainMenu () {
  const songs = (
      require("Storage").readJSON("guitar_songs.json", true) ||
      [{'name': 'No songs', 'lyrics': 'Em\nPlease upload a song\nAm        A7\nusing the Bangle App Loader', 'chords': ['Am', 'Em', 'A7']}]
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
