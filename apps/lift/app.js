
function roundRect (x1, y1, x2, y2, halfrad) {
  const bgColor = g.getBgColor();
  const fgColor = g.getColor();
  g.fillRect(x1, y1, x2, y2);
  g.setColor(bgColor);
  g.fillRect(x1, y1, x1 + halfrad, y2 + halfrad);
  g.setColor(fgColor);
  g.fillEllipse(x1, y1, x1 + halfrad, y2 + halfrad);
}

function drawApp() {
  const R = Bangle.appRect;

  g.setFont('6x8').setColor(0x1).setFontAlign(-1, -1).drawString('lol', 1, 2);
  g.drawLine(R.x, R.y2 / 2, R.x2, R.y2 / 2);
  roundRect(R.x, R.y, R.x2/2, R.y2 / 2);
}

function main() {
  const R = Bangle.appRect;
  g.clear();

  Bangle.on('drag', (event) => {
    g.clear();
    drawApp();
  })
}

// function mainMenu () {
//   const songs = (
//       require("Storage").readJSON("guitar_songs.json", true) ||
//       [{'name': 'No songs', 'lyrics': 'Em\nPlease upload a song\nAm        A7\nusing the Bangle App Loader', 'chords': ['Am', 'Em', 'A7']}]
//   );
//   const menu = {
//     "": {"title": "Guitar Songs"},
//   };
//   for (let i=0; i<songs.length; i++) {
//     const song = songs[i];
//     menu[song.name] = function() { main(song) };
//   }
//   E.showMenu(menu);
// }

main();
