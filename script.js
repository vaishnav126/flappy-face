// ===== Canvas setup =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const isMobile = window.innerWidth < 768;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ===== Assets =====
const face = new Image();
face.src = "face.png";

const clickSound = new Audio("click.mp3");
clickSound.preload = "auto";

// ===== Game constants (balanced) =====
const GRAVITY = isMobile ? 0.35 : 0.25;
const JUMP = isMobile ? -9 : -7;
const PIPE_SPEED = isMobile ? 5 : 6;
const PIPE_WIDTH = 50;
const GAP = isMobile ? 420 : 340;
const SPAWN_RATE = isMobile ? 55 : 45;

// ===== Game state =====
let frame = 0;
let score = 0;
let playing = true;
let lastGapY = canvas.height / 2;

// ===== Bird =====
const bird = {
  x: () => canvas.width * 0.25,
  y: canvas.height / 2,
  size: 60,
  velocity: 0
};

// ===== Pipes =====
const pipes = [];

// ===== Input =====
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

document.addEventListener("mousedown", flap);

// ===== Reset =====
function reset() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  frame = 0;
  lastGapY = canvas.height / 2;
  playing = true;
}

// ===== Pipe spawn =====
function spawnPipe() {
  const shift = 50; // smaller = easier

  let gapCenter =
    lastGapY + (Math.random() * shift * 2 - shift);

  const min = GAP / 2 + 140; // pushes top beam DOWN
  const max = canvas.height - GAP / 2 - 60;

  gapCenter = Math.max(min, Math.min(max, gapCenter));
  lastGapY = gapCenter;

  pipes.push({
    x: canvas.width,
    top: gapCenter - GAP / 2,
    passed: false
  });
}

// ===== Game loop =====
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
        bx - b
