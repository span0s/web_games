const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

let counter = 0;
let lastTime = 0;

function draw(currentTime) {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  counter += deltaTime;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f9fafb";
  ctx.font = "bold 48px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`Counter: ${counter.toFixed(2)}`, canvas.width / 2, canvas.height / 2);

  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
