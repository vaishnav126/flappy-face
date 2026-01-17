// Canvas setup
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const isMobile = window.innerWidth < 768;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Assets
const face = new Image();
face.src = "face.png";

const clickSound = new Audio("click.mp3");
clickSound.preload = "auto";

// Game constants (easy to tweak)
const GRAVITY = isMobile ? 0.35 : 0.25;
const JUMP = isMobile ? -9 : -7;
const PIPE_SPEED = isMobile ? 8: 10;
const PIPE_WIDTH = 50;
const GAP = isMobile ? 450 : 380;
const SPAWN_RATE = isMobile ? 110 : 75;

// Game state
let frame = 0;
let score = 0;
let playing = true;
let lastGapY = canvas.height / 2;

// Player
const bird = {
  x: () => canvas.width * 0.25,
  y: canvas.height / 2,
  size: 60,
  velocity: 0
};

// Pipes
const pipes = [];

// Input
function flap() {
  if (!playing) {
    reset();
    return;
  }
  bird.velocity = JUMP;
  clickSound.currentTime = 0;
  clickSound.play();
}

document.addEventListener(
  "touchstart",
  e => {
    e.preventDefault();
    flap();
  },
  { passive: false }
);

// Reset game
function reset() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  frame = 0;
  lastGapY = canvas.height / 2;
  playing = true;
}

// Create pipes
function spawnPipe() {
  const shift = 80;
  let gapCenter =
    lastGapY + (Math.random() * shift * 2 - shift);

  const min = GAP / 2 + 120;
  const max = canvas.height - GAP / 2 - 50;

  gapCenter = Math.max(min, Math.min(max, gapCenter));
  lastGapY = gapCenter;

  pipes.push({
    x: canvas.width,
    top: gapCenter - GAP / 2,
    passed: false
  });
}

// Game loop
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (playing) {
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    if (frame % SPAWN_RATE === 0) spawnPipe();
    frame++;

    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= PIPE_SPEED;

      // Collision
      const hitPipe =
        bird.x + bird.size / 2 > p.x &&
        bird.x - bird.size / 2 < p.x + PIPE_WIDTH &&
        (bird.y - bird.size / 2 < p.top ||
         bird.y + bird.size / 2 > p.top + GAP);

      if (hitPipe) playing = false;

      // Score
      if (!p.passed && p.x + PIPE_WIDTH < bird.x) {
        p.passed = true;
        score++;
      }

      if (p.x + PIPE_WIDTH < 0) pipes.splice(i, 1);
    }

    if (bird.y < 0 || bird.y > canvas.height) playing = false;
  }

  // Draw pipes
  ctx.fillStyle = "green";
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, PIPE_WIDTH, p.top);
    ctx.fillRect(p.x, p.top + GAP, PIPE_WIDTH, canvas.height);
  });

  // Draw bird
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

  // UI
  ctx.fillStyle = "#000";
  ctx.font = "28px Arial";
  ctx.fillText(score, canvas.width / 2, 50);

  if (!playing) {
    ctx.font = "36px Arial";
    ctx.fillText(
      "GAME OVER",
      canvas.width / 2 - 110,
      canvas.height / 2
    );
    ctx.font = "18px Arial";
    ctx.fillText(
      "Tap to restart",
      canvas.width / 2 - 60,
      canvas.height / 2 + 40
    );
  }

  requestAnimationFrame(update);
}

update();
