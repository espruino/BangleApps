class Ring {
  constructor() {
    this.alive = true;
    this.radius = 0;
    this.color = [
      Math.random() > 0.5 ? 1 : 0, Math.random() > 0.5 ? 1 : 0, Math.random() > 0.5 ? 1 : 0
    ];
  }
}

const LIMIT = 10;
const RADIUS_LIMIT = 240;
const pool = [];
let RANDOM = 0;
let BUFFER = 0;
let BUFFER_SPREAD = 20;

const animate = () => {
  if (pool.length < LIMIT && BUFFER === 0) {
    const available = pool.filter(ring => !ring.alive);
    const newRing = available.length ? available[0] : new Ring();
    pool.push(newRing);
    BUFFER = BUFFER_SPREAD;
  }
  g.clear();
  if (BUFFER > 0) BUFFER--;
  for (const ring of pool) {
    if (ring.radius > RADIUS_LIMIT) {
      ring.radius = 0;
      ring.alive = false;
    } else {
      if (RANDOM) g.setColor(ring.color[0], ring.color[1], ring.color[2]);
      else g.setColor(1, 1, 1);
      g.drawCircle(120, 120, ring.radius++);
    }
  }
  setTimeout(animate, 1000/60);
};

setWatch(() => (BUFFER_SPREAD += 5), BTN1, {repeat: true});
setWatch(() => (RANDOM = !RANDOM), BTN2, {repeat: true});
setWatch(() => (BUFFER_SPREAD -= 5), BTN3, {repeat: true});

animate();