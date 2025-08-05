const BASE_URL = "http://localhost:3000/api";

// Variablen
let currentPlayer = null;
let autoTickInterval = null;
let tickProgress = 0;
const TICK_INTERVAL = 2000; // 2 secondes

// DOM
const userName = document.getElementById("userName");
const playerMoney = document.getElementById("playerMoney");
const playerResources = document.getElementById("playerResources");
const playerWorkers = document.getElementById("playerWorkers");
const playerSellers = document.getElementById("playerSellers");
const statusMessage = document.getElementById("statusMessage");
const autoStatus = document.getElementById("autoStatus");
const progressFill = document.getElementById("progressFill");
const collectAmount = document.getElementById("collectAmount");
const sellAmount = document.getElementById("sellAmount");

// Boutons
const logoutBtn = document.getElementById("logoutBtn");
const collectBtn = document.getElementById("collectBtn");
const sellBtn = document.getElementById("sellBtn");
const hireWorkerBtn = document.getElementById("hireWorkerBtn");
const hireSellerBtn = document.getElementById("hireSellerBtn");

// handige functions
function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

function showStatusMessage(message, type = "success") {
  statusMessage.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
  setTimeout(() => {
    statusMessage.innerHTML = "";
  }, 3000);
}

function animateValueChange(element) {
  element.classList.add("stat-change");
  setTimeout(() => {
    element.classList.remove("stat-change");
  }, 600);
}

// API functies
async function getPlayerById(playerId) {
  const response = await fetch(`${BASE_URL}/players`);
  const players = await response.json();
  return players.find((player) => player._id === playerId);
}

async function collectResources(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/collect`, {
    method: "PATCH",
  });
  return await response.json();
}

async function sellResources(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/sell`, {
    method: "PATCH",
  });
  return await response.json();
}

async function hireWorker(playerId, type) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/hire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors du recrutement");
  }

  return response.json();
}

async function autoTick(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/auto-tick`, {
    method: "POST",
  });
  return response.json();
}

// Update van de speler
function updatePlayerDisplay(player, animate = false) {
  // check voor veranderingen
  if (currentPlayer && animate) {
    if (currentPlayer.money !== player.money) {
      animateValueChange(playerMoney);
    }
    if (currentPlayer.resources !== player.resources) {
      animateValueChange(playerResources);
    }
  }

  // update van de waardes
  playerMoney.textContent = formatNumber(player.money);
  playerResources.textContent = formatNumber(player.resources);
  playerWorkers.textContent = player.workers;
  playerSellers.textContent = player.sellers;

  // update van de verzamel- en verkoopbedragen
  const collectValue = player.workers > 0 ? player.workers : 1;
  collectAmount.textContent = collectValue;
  sellAmount.textContent = formatNumber(player.resources * 10);

  // update buttons
  updateButtonStates(player);

  // update auto status
  updateAutoStatus(player);

  currentPlayer = player;
}

function updateButtonStates(player) {
  // verkoopknop - uitgeschakeld als er geen resources zijn
  sellBtn.disabled = player.resources === 0;

  // aanwervingsknop - uitgeschakeld als er niet genoeg geld is
  const canAffordWorker = player.money >= 200;
  hireWorkerBtn.disabled = !canAffordWorker;
  hireSellerBtn.disabled = !canAffordWorker;

  // verander de opaciteit van de knoppen
  if (!canAffordWorker) {
    hireWorkerBtn.style.opacity = "0.6";
    hireSellerBtn.style.opacity = "0.6";
  } else {
    hireWorkerBtn.style.opacity = "1";
    hireSellerBtn.style.opacity = "1";
  }
}

function updateAutoStatus(player) {
  const hasEmployees = player.workers > 0 || player.sellers > 0;

  if (hasEmployees) {
    autoStatus.className = "auto-status";
    autoStatus.innerHTML = `
            ✅ Automatisatie Actief - Werkers: ${player.workers}, Verkopers: ${player.sellers}
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
        `;

    if (!autoTickInterval) {
      startAutoTick();
    }
  } else {
    autoStatus.className = "auto-status inactive";
    autoStatus.innerHTML = `
            ⏸️ Automatisatie inactief 
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
        `;

    if (autoTickInterval) {
      stopAutoTick();
    }
  }
}

// autoTick functies
function startAutoTick() {
  if (autoTickInterval) return;

  let progress = 0;
  const progressElement = document.getElementById("progressFill");

  autoTickInterval = setInterval(async () => {
    try {
      await autoTick(currentPlayer._id);
      const updatedPlayer = await getPlayerById(currentPlayer._id);
      updatePlayerDisplay(updatedPlayer, true);

      // Reset van de voortgang
      progress = 0;
      if (progressElement) {
        progressElement.style.width = "0%";
      }
    } catch (error) {
      console.error("Error auto-tick:", error);
    }
  }, TICK_INTERVAL);

  // animatie van de voortgangsbalk
  const progressInterval = setInterval(() => {
    progress += 100 / (TICK_INTERVAL / 50); // 50ms intervals
    if (progressElement) {
      progressElement.style.width = Math.min(progress, 100) + "%";
    }

    if (progress >= 100) {
      progress = 0;
    }

    if (!autoTickInterval) {
      clearInterval(progressInterval);
    }
  }, 50);
}

function stopAutoTick() {
  if (autoTickInterval) {
    clearInterval(autoTickInterval);
    autoTickInterval = null;
  }

  const progressElement = document.getElementById("progressFill");
  if (progressElement) {
    progressElement.style.width = "0%";
  }
}

// Laad de spelergegevens bij het laden van de pagina
async function loadPlayerData() {
  try {
    const updatedPlayer = await getPlayerById(currentPlayer._id);
    updatePlayerDisplay(updatedPlayer);
  } catch (error) {
    console.error("Error tijdens het laden:", error);
    showStatusMessage("Error tijdens het laden van de gegevens", "error");
  }
}

// Event Listeners
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("currentPlayer");
  stopAutoTick();
  window.location.href = "../index.html";
});

collectBtn.addEventListener("click", async () => {
  try {
    collectBtn.disabled = true;
    await collectResources(currentPlayer._id);
    await loadPlayerData();
    showStatusMessage("Grondstoffen verzameld !");
  } catch (error) {
    console.error("Erreur:", error);
    showStatusMessage("Error tijdens het verzamellen", "error");
  } finally {
    collectBtn.disabled = false;
  }
});

sellBtn.addEventListener("click", async () => {
  if (currentPlayer.resources === 0) {
    showStatusMessage("Geen greondstoffen te verkopen!", "error");
    return;
  }

  try {
    sellBtn.disabled = true;
    const soldAmount = currentPlayer.resources * 10;
    await sellResources(currentPlayer._id);
    await loadPlayerData();
    showStatusMessage(
      `Grondstoffen verkocht voor ${formatNumber(soldAmount)}€ !`
    );
  } catch (error) {
    console.error("Erreur:", error);
    showStatusMessage("Error tijdens het  verkopen", "error");
  } finally {
    sellBtn.disabled = false;
  }
});

hireWorkerBtn.addEventListener("click", async () => {
  if (currentPlayer.money < 200) {
    showStatusMessage(
      "Geen geld genoeg om een een werknemer aan te nemen!",
      "error"
    );
    return;
  }

  try {
    hireWorkerBtn.disabled = true;
    await hireWorker(currentPlayer._id, "collector");
    await loadPlayerData();
    showStatusMessage("Werker aangenomen!");
  } catch (error) {
    console.error("Erreur:", error);
    showStatusMessage(error.message, "error");
  } finally {
    hireWorkerBtn.disabled = false;
  }
});

hireSellerBtn.addEventListener("click", async () => {
  if (currentPlayer.money < 200) {
    showStatusMessage(
      "Geen geld genoeg om een een werknemer aan te nemen!",
      "error"
    );
    return;
  }

  try {
    hireSellerBtn.disabled = true;
    await hireWorker(currentPlayer._id, "seller");
    await loadPlayerData();
    showStatusMessage("Verkoper aangenomen!");
  } catch (error) {
    console.error("Erreur:", error);
    showStatusMessage(error.message, "error");
  } finally {
    hireSellerBtn.disabled = false;
  }
});

// toetsenbord sneltoetsen
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) return; // vermijd conflicten avec Ctrl ou Cmd

  switch (e.key.toLowerCase()) {
    case "c":
      if (!collectBtn.disabled) collectBtn.click();
      break;
    case "v":
      if (!sellBtn.disabled) sellBtn.click();
      break;
    case "w":
      if (!hireWorkerBtn.disabled) hireWorkerBtn.click();
      break;
    case "s":
      if (!hireSellerBtn.disabled) hireSellerBtn.click();
      break;
  }
});

// Initialisation
window.addEventListener("load", async () => {
  // check of de spelergegevens zijn opgeslagen in sessionStorage
  const playerData = sessionStorage.getItem("currentPlayer");
  if (!playerData) {
    window.location.href = "../index.html";
    return;
  }

  try {
    currentPlayer = JSON.parse(playerData);
    userName.textContent = currentPlayer.username;

    // laad de spelergegevens
    await loadPlayerData();

    // Start de autoTick als er werkers of verkopers zijn
    if (currentPlayer.workers > 0 || currentPlayer.sellers > 0) {
      startAutoTick();
    }
  } catch (error) {
    console.error("Innitialisatie Error:", error);
    sessionStorage.removeItem("currentPlayer");
    window.location.href = "../index.html";
  }
});

// kuis de autoTick bij het verlaten van de pagina
window.addEventListener("beforeunload", () => {
  stopAutoTick();
});

// Laad de spelergegevens elke 30 seconden
setInterval(async () => {
  if (currentPlayer && !autoTickInterval) {
    await loadPlayerData();
  }
}, 30000);
