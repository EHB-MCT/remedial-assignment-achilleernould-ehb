const BASE_URL = "http://localhost:3000/api";

// Variables globales
let currentPlayer = null;
let autoTickInterval = null;
let tickProgress = 0;
const TICK_INTERVAL = 2000; // 2 secondes

// Éléments DOM
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

// Fonctions utilitaires
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

// Fonctions API
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

// Mise à jour de l'affichage du joueur
function updatePlayerDisplay(player, animate = false) {
  // Vérifier les changements pour les animations
  if (currentPlayer && animate) {
    if (currentPlayer.money !== player.money) {
      animateValueChange(playerMoney);
    }
    if (currentPlayer.resources !== player.resources) {
      animateValueChange(playerResources);
    }
  }

  // Mettre à jour les valeurs
  playerMoney.textContent = formatNumber(player.money);
  playerResources.textContent = formatNumber(player.resources);
  playerWorkers.textContent = player.workers;
  playerSellers.textContent = player.sellers;

  // Mettre à jour les montants de collecte et vente
  const collectValue = player.workers > 0 ? player.workers : 1;
  collectAmount.textContent = collectValue;
  sellAmount.textContent = formatNumber(player.resources * 10);

  // Mettre à jour les boutons
  updateButtonStates(player);

  // Mettre à jour le statut d'automatisation
  updateAutoStatus(player);

  currentPlayer = player;
}

function updateButtonStates(player) {
  // Bouton de vente - désactivé si pas de ressources
  sellBtn.disabled = player.resources === 0;

  // Boutons de recrutement - désactivés si pas assez d'argent
  const canAffordWorker = player.money >= 200;
  hireWorkerBtn.disabled = !canAffordWorker;
  hireSellerBtn.disabled = !canAffordWorker;

  // Changer le style des boutons désactivés
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
            ✅ Automatisation active - Workers: ${player.workers}, Sellers: ${player.sellers}
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
            ⏸️ Automatisation inactive - Recrutez des employés pour commencer !
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
        `;

    if (autoTickInterval) {
      stopAutoTick();
    }
  }
}

// Système d'auto-tick
function startAutoTick() {
  if (autoTickInterval) return;

  let progress = 0;
  const progressElement = document.getElementById("progressFill");

  autoTickInterval = setInterval(async () => {
    try {
      await autoTick(currentPlayer._id);
      const updatedPlayer = await getPlayerById(currentPlayer._id);
      updatePlayerDisplay(updatedPlayer, true);

      // Reset de la barre de progression
      progress = 0;
      if (progressElement) {
        progressElement.style.width = "0%";
      }
    } catch (error) {
      console.error("Erreur auto-tick:", error);
    }
  }, TICK_INTERVAL);

  // Animation de la barre de progression
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

// Charger les données du joueur
async function loadPlayerData() {
  try {
    const updatedPlayer = await getPlayerById(currentPlayer._id);
    updatePlayerDisplay(updatedPlayer);
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    showStatusMessage("Erreur lors du chargement des données", "error");
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
    showStatusMessage("Ressources collectées !");
  } catch (error) {
    console.error("Erreur:", error);
    showStatusMessage("Erreur lors de la collecte", "error");
  } finally {
    collectBtn.disabled = false;
  }
});

sellBtn.addEventListener("click", async () => {
  if (currentPlayer.resources === 0) {
    showStatusMessage("Aucune ressource à vendre !", "error");
    return;
  }

  try {
    sellBtn.disabled = true;
    const soldAmount = currentPlayer.resources * 10;
    await sellResources(currentPlayer._id);
    await loadPlayerData();
    showStatusMessage(`Ressources vendues pour ${formatNumber(soldAmount)}€ !`);
  } catch (error) {
    console.error("Erreur:", error);
    showStatusMessage("Erreur lors de la vente", "error");
  } finally {
    sellBtn.disabled = false;
  }
});

hireWorkerBtn.addEventListener("click", async () => {
  if (currentPlayer.money < 200) {
    showStatusMessage("Pas assez d'argent pour recruter un worker !", "error");
    return;
  }

  try {
    hireWorkerBtn.disabled = true;
    await hireWorker(currentPlayer._id, "collector");
    await loadPlayerData();
    showStatusMessage("Worker recruté avec succès !");
  } catch (error) {
    console.error("Erreur:", error);
    showStatusMessage(error.message, "error");
  } finally {
    hireWorkerBtn.disabled = false;
  }
});

hireSellerBtn.addEventListener("click", async () => {
  if (currentPlayer.money < 200) {
    showStatusMessage("Pas assez d'argent pour recruter un seller !", "error");
    return;
  }

  try {
    hireSellerBtn.disabled = true;
    await hireWorker(currentPlayer._id, "seller");
    await loadPlayerData();
    showStatusMessage("Seller recruté avec succès !");
  } catch (error) {
    console.error("Erreur:", error);
    showStatusMessage(error.message, "error");
  } finally {
    hireSellerBtn.disabled = false;
  }
});

// Raccourcis clavier
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) return; // Éviter les conflits avec les raccourcis système

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
  // Vérifier si un joueur est connecté
  const playerData = sessionStorage.getItem("currentPlayer");
  if (!playerData) {
    window.location.href = "../index.html";
    return;
  }

  try {
    currentPlayer = JSON.parse(playerData);
    userName.textContent = currentPlayer.username;

    // Charger les données actuelles du joueur
    await loadPlayerData();

    // Démarrer l'auto-tick si le joueur a des employés
    if (currentPlayer.workers > 0 || currentPlayer.sellers > 0) {
      startAutoTick();
    }
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    sessionStorage.removeItem("currentPlayer");
    window.location.href = "../index.html";
  }
});

// Nettoyage avant fermeture
window.addEventListener("beforeunload", () => {
  stopAutoTick();
});

// Actualisation automatique périodique (toutes les 30 secondes)
setInterval(async () => {
  if (currentPlayer && !autoTickInterval) {
    await loadPlayerData();
  }
}, 30000);
