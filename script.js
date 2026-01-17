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
face.src = "face.png"; // replace with CodePen asset URL if needed

const clickSound = new Audio("click.mp3"); // replace with CodePen asset URL
clickSound.preload = "auto";

// Game state
let playing = true;
let frame = 0;
let score = 0;
let lastGapY = canvas.height / 2;


const gravity = isMobile ? 0.35 : 0.25;
const jumpForce = isMobile ? -9 : -7;


const bird = {
  x: canvas.width * 0.25,
  y: canvas.height / 2,
  size: 60,
  velocity: 0
};

const pipes = [];
const pipeWidth = 50;
const gap = 380;

function flap() {
  if (!playing) {
    reset();
    return;
  }
  bird.velocity = jumpForce;
  clickSound.currentTime = 0;
  clickSound.play();
}

document.addEventListener("touchstart", e => {
  e.preventDefault();
  flap();
}, { passive: false });


function reset() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes.length = 0;
  score = 0;
  frame = 0;
  lastGapY = canvas.height / 2;
  playing = true;
}

function spawnPipe() {
  const maxShift = 80; // how much the gap can move up/down (lower = easier)

  let gapCenter =
    lastGapY + (Math.random() * maxShift * 2 - maxShift);

  // Clamp so it stays on screen
  const minGapCenter = gap / 2 + 50;
  const maxGapCenter = canvas.height - gap / 2 - 50;

  gapCenter = Math.max(minGapCenter, Math.min(maxGapCenter, gapCenter));

  lastGapY = gapCenter;

  pipes.push({
    x: canvas.width,
    top: gapCenter - gap / 2,
    passed: false
  });
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (playing) {
    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (frame % 90 === 0) spawnPipe();
    frame++;

    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= 3;

      // Collision
      if (
        bird.x + bird.size / 2 > p.x &&
        bird.x - bird.size / 2 < p.x + pipeWidth &&
        (bird.y - bird.size / 2 < p.top ||
         bird.y + bird.size / 2 > p.top + gap)
      ) {
        playing = false;
      }

      if (!p.passed && p.x + pipeWidth < bird.x) {
        p.passed = true;
        score++;
      }

      if (p.x + pipeWidth < 0) pipes.splice(i, 1);
    }

    if (bird.y < 0 || bird.y > canvas.height) {
      playing = false;
    }
  }

  // Draw pipes
  ctx.fillStyle = "green";
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, pipeWidth, p.top);
    ctx.fillRect(p.x, p.top + gap, pipeWidth, canvas.height);
  });

  // Draw face
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.velocity * 0.03);
  ctx.drawImage(
    face,
    -bird.size / 2,
    -bird.size / 2,
    bird.size,
    bird.size
  );
  ctx.restore();

  // Score
  ctx.fillStyle = "#000";
  ctx.font = "28px Arial";
  ctx.fillText(score, canvas.width / 2 - 10, 50);

  if (!playing) {
    ctx.font = "36px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 110, canvas.height / 2);
    ctx.font = "18px Arial";
    ctx.fillText("Tap to restart", canvas.width / 2 - 60, canvas.height / 2 + 40);
  }

  requestAnimationFrame(update);
}

update();
