// ================= CANVAS SETUP =================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const isMobile = window.innerWidth < 768;

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

// ================= ASSETS =================
const face = new Image();
face.src = "face.png";

const clickSound = new Audio("click.mp3");
clickSound.preload = "auto";

// ================= GAME CONSTANTS =================
const GRAVITY = isMobile ? 0.35 : 0.25;
const JUMP = isMobile ? -9 : -7;
const PIPE_SPEED = isMobile ? 5 : 6;
const PIPE_WIDTH = 50;
const GAP = isMobile ? 420 : 340;
const SPAWN_RATE = isMobile ? 55 : 45;

// ================= GAME STATE =================
let frame = 0;
let score = 0;
let playing = true;
let lastGapY = window.innerHeight / 2;

// ================= PLAYER =================
const bird = {
  x: () => window.innerWidth * 0.25,
  y: window.innerHeight / 2,
  size: 60,
  velocity: 0
};

// ================= PIPES =================
const pipes = [];

// ================= INPUT =================
function flap() {
  if (!playing) {
    reset();
    return;
  }
  bird.velocity = JUMP;

  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
}

document.addEventListener("mousedown", flap);
document.addEventListener(
  "touchstart",
  e => {
    e.preventDefault();
    flap();
  },
  { passive: false }
);

// ================= RESET =================
function reset() {
  bird.y = window.innerHeight / 2;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  frame = 0;
  lastGapY = window.innerHeight / 2;
  playing = true;
}

// ================= PIPE SPAWN =================
function spawnPipe() {
  const shift = 50;

  let gapCenter =
    lastGapY + (Math.random() * shift * 2 - shift);

  const min = GAP / 2 + 140; // pushes top pipe DOWN
  const max = window.innerHeight - GAP / 2 - 60;

  gapCenter = Math.max(min, Math.min(max, gapCenter));
  lastGapY = gapCenter;

  pipes.push({
    x: window.innerWidth,
    top: gapCenter - GAP / 2,
    passed: false
  });
}

// ================= GAME LOOP =================
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (playing) {
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    if (frame % SPAWN_RATE === 0) spawnPipe();
    frame++;

    const bx = bird.x();

    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= PIPE_SPEED;

      // Collision
      const hit =
        bx + bird.size / 2 > p.x &&
        bx - bird.size / 2 < p.x + PIPE_WIDTH &&
        (bird.y - bird.size / 2 < p.top ||
         bird.y + bird.size / 2 > p.top + GAP);

      if (hit) playing = false;

      // Score
      if (!p.passed && p.x + PIPE_WIDTH < bx) {
        p.passed = true;
        score++;
      }

      if (p.x + PIPE_WIDTH < 0) pipes.splice(i, 1);
    }

    if (bird.y < 0 || bird.y > window.innerHeight) {
      playing = false;
    }
  }

  // ================= DRAW PIPES =================
  ctx.fillStyle = "green";
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.fillRect(
      p.x,
      p.top + GAP,
      PIPE_WIDTH,
      window.innerHeight
    );
  });

  // ================= DRAW BIRD =================
  ctx.save();
  ctx.translate(bird.x(), bird.y);
  ctx.rotate(bird.velocity * 0.03);
  ctx.drawImage(
    face,
    -bird.size / 2,
    -bird.size / 2,
    bird.size,
    bird.size
  );
  ctx.restore();

  // ================= UI =================
  ctx.fillStyle = "#000";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.fillText(score, window.innerWidth / 2, 50);

  if (!playing) {
    ctx.font = "36px Arial";
    ctx.fillText(
      "GAME OVER",
      window.innerWidth / 2,
      window.innerHeight / 2
    );
    ctx.font = "18px Arial";
    ctx.fillText(
      "Click / Tap to restart",
      window.innerWidth / 2,
      window.innerHeight / 2 + 40
    );
  }

  requestAnimationFrame(update);
}

update();

