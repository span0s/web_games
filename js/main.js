const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const restartButton = document.getElementById("restart-button");

let lastTime = 0;
let score = 0;
let lives = 3;
let isGameOver = false;
let isCountdownActive = false;
let countdownValue = 0;
let countdownElapsed = 0;
const pressedKeys = {
  ArrowLeft: false,
  ArrowRight: false,
};

const player = {
  width: 140,
  height: 20,
  x: canvas.width / 2 - 70,
  y: canvas.height - 50,
  speed: 420,
};

const ball = {
  radius: 10,
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 0,
  vy: 0,
};

const BRICK_ROWS = 5;
const BRICK_GAP = 10;
const BRICK_TOP_OFFSET = 40;
const BRICK_SIDE_PADDING = 20;
let bricks = [];

function createBricks() {
  bricks = [];
  const brickWidth = player.width;
  const brickHeight = player.height;
  const columns = Math.max(
    1,
    Math.floor((canvas.width - BRICK_SIDE_PADDING * 2 + BRICK_GAP) / (brickWidth + BRICK_GAP)),
  );
  const totalBrickWidth = columns * brickWidth + (columns - 1) * BRICK_GAP;
  const startX = (canvas.width - totalBrickWidth) / 2;

  for (let row = 0; row < BRICK_ROWS; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      bricks.push({
        x: startX + col * (brickWidth + BRICK_GAP),
        y: BRICK_TOP_OFFSET + row * (brickHeight + BRICK_GAP),
        width: brickWidth,
        height: brickHeight,
        active: true,
      });
    }
  }
}

function updateStatus() {
  if (isGameOver) {
    statusText.textContent = `Game Over | Score: ${score} | Lives: ${lives}`;
    restartButton.hidden = false;
    return;
  }
  restartButton.hidden = true;
  statusText.textContent = `Score: ${score} | Lives: ${lives}`;
}

function centerBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
}

function launchBall() {
  ball.vx = 280 * (Math.random() < 0.5 ? -1 : 1);
  ball.vy = -280;
}

function startLifeLossCountdown() {
  isCountdownActive = true;
  countdownValue = 3;
  countdownElapsed = 0;
  centerBall();
  ball.vx = 0;
  ball.vy = 0;
}

function resetGame() {
  score = 0;
  lives = 3;
  isGameOver = false;
  isCountdownActive = false;
  countdownValue = 0;
  countdownElapsed = 0;
  player.x = canvas.width / 2 - player.width / 2;
  centerBall();
  launchBall();
  createBricks();
  updateStatus();
}

restartButton.addEventListener("click", () => {
  resetGame();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    pressedKeys[event.key] = true;
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    pressedKeys[event.key] = false;
    event.preventDefault();
  }
});

function draw(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (pressedKeys.ArrowLeft) {
    player.x -= player.speed * deltaTime;
  }
  if (pressedKeys.ArrowRight) {
    player.x += player.speed * deltaTime;
  }

  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  if (!isGameOver) {
    if (isCountdownActive) {
      countdownElapsed += deltaTime;
      if (countdownElapsed >= 1) {
        const secondsPassed = Math.floor(countdownElapsed);
        countdownValue = Math.max(0, countdownValue - secondsPassed);
        countdownElapsed -= secondsPassed;
      }

      if (countdownValue === 0) {
        isCountdownActive = false;
        launchBall();
      }
    } else {
      ball.x += ball.vx * deltaTime;
      ball.y += ball.vy * deltaTime;

      if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius;
        ball.vx *= -1;
      } else if (ball.x + ball.radius >= canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -1;
      }

      if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
      } else if (ball.y + ball.radius >= canvas.height) {
        lives = Math.max(0, lives - 1);
        if (lives === 0) {
          isGameOver = true;
        } else {
          startLifeLossCountdown();
        }
        updateStatus();
      }

      const ballIntersectsPaddle =
        ball.x + ball.radius >= player.x &&
        ball.x - ball.radius <= player.x + player.width &&
        ball.y + ball.radius >= player.y &&
        ball.y - ball.radius <= player.y + player.height;

      for (const brick of bricks) {
        if (!brick.active) {
          continue;
        }

        const ballIntersectsBrick =
          ball.x + ball.radius >= brick.x &&
          ball.x - ball.radius <= brick.x + brick.width &&
          ball.y + ball.radius >= brick.y &&
          ball.y - ball.radius <= brick.y + brick.height;

        if (ballIntersectsBrick) {
          brick.active = false;
          score += 1;
          updateStatus();

          if (ball.vy > 0) {
            ball.y = brick.y - ball.radius;
          } else {
            ball.y = brick.y + brick.height + ball.radius;
          }
          ball.vy *= -1;
          break;
        }
      }

      if (ballIntersectsPaddle && ball.vy > 0) {
        ball.y = player.y - ball.radius;
        ball.vy *= -1;
      }
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#60a5fa";
  for (const brick of bricks) {
    if (brick.active) {
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
  }

  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  if (!isCountdownActive) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isGameOver) {
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 64px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
  } else if (isCountdownActive) {
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 72px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(countdownValue), canvas.width / 2, canvas.height / 2);
  }

  requestAnimationFrame(draw);
}

launchBall();
createBricks();
requestAnimationFrame(draw);
