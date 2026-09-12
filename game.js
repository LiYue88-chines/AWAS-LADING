// ===============================
// URL GOOGLE APPS SCRIPT
// ===============================

const URL_GOOGLE_SHEETS =
  "URL_GOOGLE_SHEETS";

// ===============================
// VARIABEL GAME
// ===============================

let username = "";
let nomor = "";

let score = 0;
let speed = 3;

let playerX = 50;

let gameRunning = false;

let moveLeft = false;
let moveRight = false;

let knives = [];

let gameLoop;
let spawnLoop;


// ===============================
// MULAI GAME
// ===============================

function mulaiGame() {

  username = document.getElementById("username").value.trim();
  nomor = document.getElementById("nomor").value.trim();

  if (username === "" || nomor === "") {
    alert("Username dan nomor wajib diisi!");
    return;
  }

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameOver").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  score = 0;
  speed = 3;
  playerX = 50;

  document.getElementById("score").textContent = score;
  document.getElementById("speedText").textContent = "1";

  const player = document.getElementById("player");

  player.style.left = "50%";

  // hapus pisau lama
  document.querySelectorAll(".knife").forEach(k => k.remove());

  knives = [];

  gameRunning = true;

  gameLoop = requestAnimationFrame(updateGame);

  spawnLoop = setInterval(spawnKnife, 900);
}


// ===============================
// GERAK PEMAIN
// ===============================

function gerakPemain() {

  if (!gameRunning) return;

  if (moveLeft) {
    playerX -= 1.5;
  }

  if (moveRight) {
    playerX += 1.5;
  }

  if (playerX < 5) playerX = 5;
  if (playerX > 95) playerX = 95;

  document.getElementById("player").style.left = playerX + "%";
}


// ===============================
// SPAWN PISAU
// ===============================

function spawnKnife() {

  if (!gameRunning) return;

  const arena = document.getElementById("arena");

  const knife = document.createElement("div");

  knife.className = "knife";
  knife.textContent = "🔪";

  const randomX = Math.random() * 90 + 2;

  knife.style.left = randomX + "%";

  arena.appendChild(knife);

  knives.push({
    element: knife,
    y: -60,
    speed: speed
  });
}


// ===============================
// UPDATE GAME
// ===============================

function updateGame() {

  if (!gameRunning) return;

  gerakPemain();

  const player = document.getElementById("player");

  const playerRect = player.getBoundingClientRect();

  for (let i = knives.length - 1; i >= 0; i--) {

    const knife = knives[i];

    knife.y += knife.speed;

    knife.element.style.top = knife.y + "px";

    const knifeRect =
      knife.element.getBoundingClientRect();

    // Cek tabrakan
    if (cekTabrakan(playerRect, knifeRect)) {
      gameOver();
      return;
    }

    // Kalau pisau sudah lewat
    if (knife.y > 560) {

      knife.element.remove();

      knives.splice(i, 1);

      score++;

      document.getElementById("score").textContent = score;

      // semakin lama semakin cepat
      if (score % 5 === 0) {
        speed += 0.5;

        document.getElementById("speedText").textContent =
          Math.floor(speed / 3);
      }
    }
  }

  gameLoop = requestAnimationFrame(updateGame);
}


// ===============================
// CEK TABRAKAN
// ===============================

function cekTabrakan(a, b) {

  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  );
}


// ===============================
// GAME OVER
// ===============================

function gameOver() {

  gameRunning = false;

  cancelAnimationFrame(gameLoop);
  clearInterval(spawnLoop);

  document.getElementById("game").classList.add("hidden");

  document.getElementById("gameOver").classList.remove("hidden");

  document.getElementById("finalScore").textContent = score;

  // kirim skor
  kirimSkor();
}


// ===============================
// KIRIM DATA KE GOOGLE SHEETS
// ===============================

function kirimSkor() {

  if (
    URL_GOOGLE_SHEETS === "" ||
    URL_GOOGLE_SHEETS === "URL_GOOGLE_SHEETS"
  ) {
    console.log("URL Google Sheets belum dipasang.");
    return;
  }

  fetch(URL_GOOGLE_SHEETS, {

    method: "POST",

    body: JSON.stringify({
      name: username,
      nomor: nomor,
      score: score
    })

  })
  .then(response => response.text())
  .then(data => {
    console.log("Skor berhasil dikirim:", data);
  })
  .catch(error => {
    console.log("Gagal mengirim skor:", error);
  });
}


// ===============================
// MAIN LAGI
// ===============================

function mainLagi() {

  document.getElementById("gameOver").classList.add("hidden");

  mulaiGame();
}


// ===============================
// KEMBALI KE MENU
// ===============================

function keMenu() {

  gameRunning = false;

  cancelAnimationFrame(gameLoop);
  clearInterval(spawnLoop);

  document.querySelectorAll(".knife").forEach(k => k.remove());

  knives = [];

  document.getElementById("gameOver").classList.add("hidden");
  document.getElementById("game").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");

  loadLeaderboard();
}


// ===============================
// KONTROL KIRI / KANAN
// ===============================

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");

leftButton.addEventListener("touchstart", () => {
  moveLeft = true;
});

leftButton.addEventListener("touchend", () => {
  moveLeft = false;
});

rightButton.addEventListener("touchstart", () => {
  moveRight = true;
});

rightButton.addEventListener("touchend", () => {
  moveRight = false;
});


// Untuk komputer

document.addEventListener("keydown", function(e) {

  if (e.key === "ArrowLeft") {
    moveLeft = true;
  }

  if (e.key === "ArrowRight") {
    moveRight = true;
  }

});

document.addEventListener("keyup", function(e) {

  if (e.key === "ArrowLeft") {
    moveLeft = false;
  }

  if (e.key === "ArrowRight") {
    moveRight = false;
  }

});


// ===============================
// LEADERBOARD
// ===============================

function loadLeaderboard() {

  const leaderboard =
    document.getElementById("leaderboard");

  if (
    URL_GOOGLE_SHEETS === "" ||
    URL_GOOGLE_SHEETS === "URL_GOOGLE_SHEETS"
  ) {
    leaderboard.innerHTML =
      "Leaderboard belum terhubung.";
    return;
  }

  fetch(URL_GOOGLE_SHEETS)

    .then(response => response.json())

    .then(data => {

      leaderboard.innerHTML = "";

      data.slice(0, 10).forEach((player, index) => {

        const row =
          document.createElement("div");

        row.className = "score-row";

        row.innerHTML =
          `${index + 1}. <b>${player.name}</b> — ${player.score}`;

        leaderboard.appendChild(row);

      });

    })

    .catch(error => {

      leaderboard.innerHTML =
        "Gagal memuat leaderboard.";

    });
}


// Jalankan leaderboard saat halaman dibuka
loadLeaderboard();
