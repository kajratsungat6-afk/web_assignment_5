// ===== All game numbers are constants =====
const MAX_LIVES = 3;
const WIN_STREAK = 10;
const POINTS_PER_RIGHT = 1;

const MOVIES = [
  { title: "The Shawshank Redemption", rating: 9.3 },
  { title: "The Godfather", rating: 9.2 },
  { title: "The Dark Knight", rating: 9.0 },
  { title: "Pulp Fiction", rating: 8.9 },
  { title: "Forrest Gump", rating: 8.8 },
  { title: "Inception", rating: 8.8 },
  { title: "The Matrix", rating: 8.7 },
  { title: "Interstellar", rating: 8.7 },
  { title: "Gladiator", rating: 8.5 },
  { title: "Avengers: Endgame", rating: 8.4 },
  { title: "Joker", rating: 8.4 },
  { title: "Shrek", rating: 7.9 },
  { title: "Titanic", rating: 7.9 },
  { title: "Jurassic Park", rating: 8.2 },
  { title: "Black Panther", rating: 7.3 },
  { title: "Cats (2019)", rating: 2.8 }
];

const gameEl = document.getElementById("game");
const livesEl = document.getElementById("lives");
const streakEl = document.getElementById("streak");
const bestEl = document.getElementById("best");
const goalEl = document.getElementById("goal");
const cardCurrent = document.getElementById("cardCurrent");
const cardNext = document.getElementById("cardNext");
const btnHigher = document.getElementById("btnHigher");
const btnLower = document.getElementById("btnLower");
const btnRestart = document.getElementById("btnRestart");
const messageEl = document.getElementById("message");

let lives = MAX_LIVES;
let streak = 0;
let best = 0;
let currentIndex = 0;
let nextIndex = 1;
let gameOver = false;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function pickIndex(excludeIndex) {
  let index = randInt(0, MOVIES.length - 1);
  if (index === excludeIndex) {
    index = (index + randInt(1, MOVIES.length - 1)) % MOVIES.length;
  }
  return index;
}

function say(text, type) {
  messageEl.textContent = text;
  messageEl.className = "msg " + type;
}

function fillCard(card, movie, showRating) {
  card.textContent = "";
  const title = document.createElement("h2");
  title.textContent = movie.title;
  const rating = document.createElement("div");
  rating.className = "rating";
  rating.textContent = showRating ? movie.rating.toFixed(1) : "?";
  card.appendChild(title);
  card.appendChild(rating);
}

function render() {
  let hearts = "";
  for (let i = 0; i < MAX_LIVES; i++) {
    hearts += i < lives ? "♥" : "♡";
  }
  livesEl.textContent = hearts;
  streakEl.textContent = streak;
  bestEl.textContent = best;
  goalEl.textContent = WIN_STREAK;

  fillCard(cardCurrent, MOVIES[currentIndex], true);
  fillCard(cardNext, MOVIES[nextIndex], gameOver);

  btnHigher.disabled = gameOver;
  btnLower.disabled = gameOver;

  gameEl.className = "game panel";
  if (gameOver && streak === WIN_STREAK) {
    gameEl.className = "game panel win";
  }
  if (gameOver && lives === 0) {
    gameEl.className = "game panel lose";
  }
}

function startGame() {
  lives = MAX_LIVES;
  streak = 0;
  gameOver = false;
  currentIndex = pickIndex(-1);
  nextIndex = pickIndex(currentIndex);
  render();
  say('Is "' + MOVIES[nextIndex].title + '" rated higher or lower than "' + MOVIES[currentIndex].title + '"?', "");
}

function makeGuess(choice) {
  if (gameOver) {
    say("The game is over. Press Restart to play again.", "error");
    return;
  }

  const current = MOVIES[currentIndex];
  const next = MOVIES[nextIndex];

  const right = (choice === "higher" && next.rating >= current.rating) ||
                (choice === "lower" && next.rating <= current.rating);

  const info = '"' + next.title + '" has ' + next.rating.toFixed(1) + ". ";

  if (right) {
    streak += POINTS_PER_RIGHT;
    if (streak > best) {
      best = streak;
    }
  } else {
    lives -= 1;
    streak = 0;
  }

  if (streak === WIN_STREAK || lives === 0) {
    gameOver = true;
    render();
    if (right) {
      say(info + "You reached the streak of " + WIN_STREAK + "!", "success");
    } else {
      say(info + "No lives left.", "error");
    }
    return;
  }

  currentIndex = nextIndex;
  nextIndex = pickIndex(currentIndex);
  render();
  if (right) {
    say(info + "Right!", "success");
  } else {
    say(info + "Wrong, you lose a life.", "error");
  }
}

btnHigher.addEventListener("click", function () {
  makeGuess("higher");
});
btnLower.addEventListener("click", function () {
  makeGuess("lower");
});
btnRestart.addEventListener("click", startGame);

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    makeGuess("higher");
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    makeGuess("lower");
  }
});

startGame();
