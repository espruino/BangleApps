const LENGTH = 240;
Bangle.setLCDMode();
g.clearRect(0, 0, LENGTH, LENGTH);

let cells = Graphics.createArrayBuffer(LENGTH, LENGTH, 1, { msb: true });

for (let y = 0; y < LENGTH; y++) {
  for (let x = 0; x < LENGTH; x++) {
    const val = Math.random() > 0.9 ? 1 : 0;
    cells.setPixel(x, y, val);
  }
}

g.drawImage({
  width: LENGTH,
  height: LENGTH,
  bpp: 1,
  buffer: cells.buffer
});

function getLiveNeighbours(cells, x, y) {
  const prev = x > 0 ? cells.getPixel(x - 1, y) : 0;
  const next = x < LENGTH - 2 ? cells.getPixel(x + 1, y) : 0;
  const upper = y > 0 ? cells.getPixel(x, y - 1) : 0;
  const lower = y < LENGTH - 2 ? cells.getPixel(x, y + 1) : 0;
  console.log(prev, next, upper, lower);

  return prev + next + upper + lower;
}

function playTurn(cells) {
  console.log("turn");
  g.clearRect(0, 0, LENGTH, LENGTH);
  // let updatedcells = Graphics.createArrayBuffer(LENGTH, LENGTH, 1, { msb: true });
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const liveNeighbours = getLiveNeighbours(cells, x, y);
      const cell = cells.getPixel(x, y);
      const val =
        liveNeighbours + cell > 2 && liveNeighbours + cell < 4 ? 1 : 0;
      cells.setPixel(x, y, val);
    }
  }
  g.drawImage({
    width: LENGTH,
    height: LENGTH,
    bpp: 1,
    buffer: cells.buffer
  });
  playTurn(cells);
}

playTurn(cells);
