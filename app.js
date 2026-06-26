const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const messageEl = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');

const grid = 20;
const tile = canvas.width / grid;
let snake, apple, direction, nextDirection, score, timer, running, paused;
let highscore = Number(localStorage.getItem('snake-highscore') || 0);
highscoreEl.textContent = highscore;

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  apple = randomApple();
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  running = false;
  paused = false;
  scoreEl.textContent = score;
  messageEl.textContent = 'Drücke Start oder eine Pfeiltaste.';
  draw();
}

function startGame() {
  if (running && !paused) return;
  running = true;
  paused = false;
  messageEl.textContent = 'Los gehts!';
  clearInterval(timer);
  timer = setInterval(gameLoop, 120);
}

function pauseGame() {
  if (!running) return;
  paused = !paused;
  messageEl.textContent = paused ? 'Pausiert' : 'Weiter gehts!';
}

function gameLoop() {
  if (!running || paused) return;
  direction = nextDirection;

  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (
    head.x < 0 || head.x >= grid ||
    head.y < 0 || head.y >= grid ||
    snake.some(part => part.x === head.x && part.y === head.y)
  ) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score += 10;
    scoreEl.textContent = score;
    apple = randomApple();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = '#052e16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#dc2626';
  roundedRect(apple.x * tile + 3, apple.y * tile + 3, tile - 6, tile - 6, 7);

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? '#86efac' : '#22c55e';
    roundedRect(part.x * tile + 2, part.y * tile + 2, tile - 4, tile - 4, 6);
  });
}

function roundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

function randomApple() {
  let newApple;
  do {
    newApple = {
      x: Math.floor(Math.random() * grid),
      y: Math.floor(Math.random() * grid)
    };
  } while (snake && snake.some(part => part.x === newApple.x && part.y === newApple.y));
  return newApple;
}

function gameOver() {
  running = false;
  clearInterval(timer);
  if (score > highscore) {
    highscore = score;
    localStorage.setItem('snake-highscore', highscore);
    highscoreEl.textContent = highscore;
    messageEl.textContent = 'Game Over! Neuer Highscore!';
  } else {
    messageEl.textContent = 'Game Over! Versuche es nochmal.';
  }
}

function setDirection(dir) {
  const directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };
  const chosen = directions[dir];
  if (!chosen) return;

  const opposite = chosen.x + direction.x === 0 && chosen.y + direction.y === 0;
  if (!opposite) nextDirection = chosen;
  startGame();
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowUp') setDirection('up');
  if (event.key === 'ArrowDown') setDirection('down');
  if (event.key === 'ArrowLeft') setDirection('left');
  if (event.key === 'ArrowRight') setDirection('right');
  if (event.key === ' ') pauseGame();
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', () => {
  clearInterval(timer);
  resetGame();
  startGame();
});

document.querySelectorAll('[data-dir]').forEach(button => {
  button.addEventListener('click', () => setDirection(button.dataset.dir));
});

let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', event => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
});
canvas.addEventListener('touchend', event => {
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? 'right' : 'left');
  else setDirection(dy > 0 ? 'down' : 'up');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}

resetGame();
