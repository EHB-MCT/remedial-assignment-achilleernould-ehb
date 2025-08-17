const BASE_URL = "http://localhost:3000/api";

// Globale variabelen voor spelstatus
let currentPlayer = null;
let autoTickInterval = null;
let tickProgress = 0;
const TICK_INTERVAL = 2000; // 2 seconden tussen automatische acties

// DOM elementen - Hoofddashboard elementen
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

// DOM elementen - Resource upgrade systeem
const resourceIcon = document.getElementById("resourceIcon");
const resourceLabel = document.getElementById("resourceLabel");
const currentResourceEmoji = document.getElementById("currentResourceEmoji");
const currentResourceName = document.getElementById("currentResourceName");
const currentResourceValue = document.getElementById("currentResourceValue");
const nextResourceEmoji = document.getElementById("nextResourceEmoji");
const nextResourceName = document.getElementById("nextResourceName");
const nextResourceValue = document.getElementById("nextResourceValue");
const upgradeCost = document.getElementById("upgradeCost");
const nextResourceDiv = document.getElementById("nextResourceDiv");

// DOM elementen - Tooltips voor statistiek weergave
const workerTooltip = document.getElementById("workerTooltip");
const sellerTooltip = document.getElementById("sellerTooltip");
const workerProductionRate = document.getElementById("workerProductionRate");
const totalCollected = document.getElementById("totalCollected");
const workerTooltipStatus = document.getElementById("workerTooltipStatus");
const sellerSaleRate = document.getElementById("sellerSaleRate");
const totalEarned = document.getElementById("totalEarned");
const sellerTooltipStatus = document.getElementById("sellerTooltipStatus");

// DOM elementen - Status indicatoren voor werknemers
const workerStatus = document.getElementById("workerStatus");
const sellerStatus = document.getElementById("sellerStatus");

// DOM elementen - Interactieve knoppen
const logoutBtn = document.getElementById("logoutBtn");
const collectBtn = document.getElementById("collectBtn");
const sellBtn = document.getElementById("sellBtn");
const hireWorkerBtn = document.getElementById("hireWorkerBtn");
const hireSellerBtn = document.getElementById("hireSellerBtn");
const pauseWorkersBtn = document.getElementById("pauseWorkersBtn");
const pauseSellersBtn = document.getElementById("pauseSellersBtn");
const upgradeBtn = document.getElementById("upgradeBtn");
const pauseWorkersIcon = document.getElementById("pauseWorkersIcon");
const pauseWorkersText = document.getElementById("pauseWorkersText");
const pauseSellersIcon = document.getElementById("pauseSellersIcon");
const pauseSellersText = document.getElementById("pauseSellersText");

// Hulpfuncties voor gebruikersinterface
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

// API functies - Basis speler operaties
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
    throw new Error(error.error || "Fout bij het aannemen");
  }

  return response.json();
}

async function autoTick(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/auto-tick`, {
    method: "POST",
  });
  return response.json();
}

// API functies - Nieuwe functionaliteiten voor pause en upgrade
async function toggleWorkersPause(playerId) {
  const response = await fetch(
    `${BASE_URL}/player/${playerId}/toggle-workers`,
    {
      method: "PATCH",
    }
  );
  return response.json();
}

async function toggleSellersPause(playerId) {
  const response = await fetch(
    `${BASE_URL}/player/${playerId}/toggle-sellers`,
    {
      method: "PATCH",
    }
  );
  return response.json();
}

async function upgradeResource(playerId) {
  const response = await fetch(
    `${BASE_URL}/player/${playerId}/upgrade-resource`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Fout bij het upgraden");
  }

  return response.json();
}

async function getResourceInfo(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/resource-info`);
  return response.json();
}

// Hoofdfunctie voor het bijwerken van spelerweergave
function updatePlayerDisplay(player, animate = false) {
  // Controleer wijzigingen voor visuele animaties
  if (currentPlayer && animate) {
    if (currentPlayer.money !== player.money) {
      animateValueChange(playerMoney);
    }
    if (currentPlayer.resources !== player.resources) {
      animateValueChange(playerResources);
    }
  }

  // FORCE UPDATE - werk altijd alle waarden bij
  playerMoney.textContent = formatNumber(player.money);
  playerResources.textContent = formatNumber(player.resources);
  playerWorkers.textContent = player.workers || 0; // Force 0 als undefined
  playerSellers.textContent = player.sellers || 0; // Force 0 als undefined

  // Werk resource icoon en label bij
  updateResourceDisplay(player);

  // Werk collectie en verkoop bedragen bij
  const collectValue =
    player.workers && player.workers > 0 ? player.workers : 1;
  collectAmount.textContent = collectValue;
  sellAmount.textContent = formatNumber(
    player.resources * (player.resourceValue || 1)
  );

  // Werk werknemerstatus bij
  updateEmployeeStatus(player);

  // Werk tooltips bij met statistieken
  updateTooltips(player);

  // Werk knopstatus bij
  updateButtonStates(player);

  // Werk automatisatiestatus bij
  updateAutoStatus(player);

  currentPlayer = player;
}

// Resource weergave bijwerken met juiste emoji en naam + achtergrond
function updateResourceDisplay(player) {
  const resourceTypes = {
    1: {
      name: "Steen",
      emoji: "🪨",
      className: "resource-level-1",
      particleType: "stone",
    }, // 1€ per stuk
    2: {
      name: "IJzer",
      emoji: "⛏️",
      className: "resource-level-2",
      particleType: "iron",
    }, // 10€ per stuk
    3: {
      name: "Goud",
      emoji: "🏆",
      className: "resource-level-3",
      particleType: "gold",
    }, // 100€ per stuk
    4: {
      name: "Diamant",
      emoji: "💎",
      className: "resource-level-4",
      particleType: "diamond",
    }, // 1000€ per stuk
    5: {
      name: "Platina",
      emoji: "⭐",
      className: "resource-level-5",
      particleType: "platinum",
    }, // 10000€ per stuk
  };

  const currentResource = resourceTypes[player.resourceLevel || 1];
  resourceIcon.textContent = currentResource.emoji;
  resourceLabel.textContent = currentResource.name;

  // Werk upgrade informatiesectie bij
  if (currentResourceEmoji) {
    currentResourceEmoji.textContent = currentResource.emoji;
    currentResourceName.textContent = currentResource.name;
    currentResourceValue.textContent = player.resourceValue || 1;
  }

  // Verander achtergrond gebaseerd op resource niveau
  updateBackgroundLevel(currentResource);
}

// Functie om achtergrond en effecten te wijzigen
function updateBackgroundLevel(resourceData) {
  const body = document.body;

  // Verwijder alle resource level classes
  body.classList.remove(
    "resource-level-1",
    "resource-level-2",
    "resource-level-3",
    "resource-level-4",
    "resource-level-5"
  );

  // Voeg de juiste class toe
  body.classList.add(resourceData.className);

  // Update zwevende deeltjes
  updateFloatingParticles(resourceData.particleType);
}

// Functie voor zwevende deeltjes effecten
function updateFloatingParticles(particleType) {
  // Verwijder bestaande deeltjes
  const existingParticles = document.querySelector(".floating-particles");
  if (existingParticles) {
    existingParticles.remove();
  }

  // Maak nieuwe deeltjes container
  const particlesContainer = document.createElement("div");
  particlesContainer.className = "floating-particles";
  document.body.appendChild(particlesContainer);

  // Genereer zwevende deeltjes
  for (let i = 0; i < 15; i++) {
    createFloatingParticle(particlesContainer, particleType, i);
  }
}

// Functie om individuele zwevende deeltjes te maken
function createFloatingParticle(container, type, index) {
  const particle = document.createElement("div");
  particle.className = `particle ${type}`;

  // Willekeurige positie en timing
  const leftPosition = Math.random() * 100;
  const animationDelay = Math.random() * 6;
  const animationDuration = 6 + Math.random() * 4;

  particle.style.left = leftPosition + "%";
  particle.style.animationDelay = animationDelay + "s";
  particle.style.animationDuration = animationDuration + "s";

  container.appendChild(particle);

  // Verwijder deeltje na animatie en maak nieuwe
  setTimeout(() => {
    if (particle.parentNode) {
      particle.remove();
      createFloatingParticle(container, type, index);
    }
  }, (animationDuration + animationDelay) * 1000);
}

// Functie om upgrade visueel te vieren
function celebrateUpgrade(newResourceData) {
  // Maak upgrade celebratie effecten
  const celebration = document.createElement("div");
  celebration.className = "upgrade-celebration";
  celebration.innerHTML = `
        <div class="upgrade-text">
            🎉 UPGRADE! 🎉<br>
            Nieuwe resource: ${newResourceData.name} ${newResourceData.emoji}<br>
            <small style="color: #e74c3c; margin-top: 10px; display: block;">
                ⚠️ Alle werknemers zijn ontslagen!<br>
                Je moet opnieuw beginnen met aannemen.
            </small>
        </div>
    `;

  // Voeg CSS voor celebratie toe
  const style = document.createElement("style");
  style.textContent = `
        .upgrade-celebration {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 9999;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
            animation: upgradePopIn 4s ease-out forwards;
            max-width: 400px;
            line-height: 1.4;
        }
        
        @keyframes upgradePopIn {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
            }
            15% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.1);
            }
            85% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
    `;

  document.head.appendChild(style);
  document.body.appendChild(celebration);

  // Verwijder celebratie na animatie
  setTimeout(() => {
    celebration.remove();
    style.remove();
  }, 4000);
}

// Werknemerstatus bijwerken met visuele indicatoren
function updateEmployeeStatus(player) {
  // Status van workers (verzamelaars)
  if (player.workers > 0) {
    if (player.workersPaused) {
      workerStatus.innerHTML =
        '<span class="status-indicator status-paused">⏸️</span>';
      pauseWorkersIcon.textContent = "▶️";
      pauseWorkersText.textContent = "Hervat Workers";
      pauseWorkersBtn.classList.add("paused");
    } else {
      workerStatus.innerHTML =
        '<span class="status-indicator status-active">✅</span>';
      pauseWorkersIcon.textContent = "⏸️";
      pauseWorkersText.textContent = "Pauzeer Workers";
      pauseWorkersBtn.classList.remove("paused");
    }
  } else {
    workerStatus.innerHTML = "";
    pauseWorkersIcon.textContent = "⏸️";
    pauseWorkersText.textContent = "Pauzeer Workers";
    pauseWorkersBtn.classList.remove("paused");
  }

  // Status van sellers (verkopers)
  if (player.sellers > 0) {
    if (player.sellersPaused) {
      sellerStatus.innerHTML =
        '<span class="status-indicator status-paused">⏸️</span>';
      pauseSellersIcon.textContent = "▶️";
      pauseSellersText.textContent = "Hervat Sellers";
      pauseSellersBtn.classList.add("paused");
    } else {
      sellerStatus.innerHTML =
        '<span class="status-indicator status-active">✅</span>';
      pauseSellersIcon.textContent = "⏸️";
      pauseSellersText.textContent = "Pauzeer Sellers";
      pauseSellersBtn.classList.remove("paused");
    }
  } else {
    sellerStatus.innerHTML = "";
    pauseSellersIcon.textContent = "⏸️";
    pauseSellersText.textContent = "Pauzeer Sellers";
    pauseSellersBtn.classList.remove("paused");
  }
}

// Tooltips bijwerken met actuele spelstatistieken
function updateTooltips(player) {
  // Worker tooltip informatie
  if (workerProductionRate) {
    workerProductionRate.textContent = player.workersPaused
      ? "0"
      : player.workers;
    totalCollected.textContent = formatNumber(
      player.totalResourcesCollected || 0
    );
    workerTooltipStatus.textContent = player.workersPaused
      ? "Gepauzeerd"
      : "Actief";
  }

  // Seller tooltip informatie
  if (sellerSaleRate) {
    const maxSales = Math.min(player.sellers, player.resources);
    sellerSaleRate.textContent = player.sellersPaused ? "0" : maxSales;
    totalEarned.textContent = formatNumber(player.totalMoneySaved || 0);
    sellerTooltipStatus.textContent = player.sellersPaused
      ? "Gepauzeerd"
      : "Actief";
  }
}

// Knopstatus bijwerken gebaseerd op spelerstatus
function updateButtonStates(player) {
  // Verkoop knop - uitgeschakeld als geen resources beschikbaar
  sellBtn.disabled = player.resources === 0;

  // Bereken basis werknemerskosten lokaal (simpele versie)
  const calculateWorkerCost = (currentCount) => {
    const baseCost = 200;
    return Math.floor(baseCost * Math.pow(1.5, currentCount));
  };

  const nextWorkerCost = calculateWorkerCost(player.workers || 0);
  const nextSellerCost = calculateWorkerCost(player.sellers || 0);

  // Aanname knoppen - uitgeschakeld als onvoldoende geld voor actuele kosten
  const canAffordWorker = player.money >= nextWorkerCost;
  const canAffordSeller = player.money >= nextSellerCost;

  hireWorkerBtn.disabled = !canAffordWorker;
  hireSellerBtn.disabled = !canAffordSeller;

  // Update knop teksten met actuele kosten
  hireWorkerBtn.innerHTML = `
        <span>🧑‍🌾</span>
        Huur Worker (€${formatNumber(nextWorkerCost)})
    `;

  hireSellerBtn.innerHTML = `
        <span>🧑‍💼</span>
        Huur Seller (€${formatNumber(nextSellerCost)})
    `;

  // Pauzeer knoppen - uitgeschakeld als geen werknemers
  pauseWorkersBtn.disabled = (player.workers || 0) === 0;
  pauseSellersBtn.disabled = (player.sellers || 0) === 0;

  // Visuele feedback voor uitgeschakelde knoppen
  hireWorkerBtn.style.opacity = canAffordWorker ? "1" : "0.6";
  hireSellerBtn.style.opacity = canAffordSeller ? "1" : "0.6";
}

// Automatisatiestatus bijwerken
function updateAutoStatus(player) {
  const hasActiveEmployees =
    (player.workers > 0 && !player.workersPaused) ||
    (player.sellers > 0 && !player.sellersPaused);

  if (hasActiveEmployees) {
    autoStatus.className = "auto-status";
    let statusText = "✅ Automatisering actief - ";
    if (player.workers > 0 && !player.workersPaused) {
      statusText += `Workers: ${player.workers}`;
    }
    if (player.sellers > 0 && !player.sellersPaused) {
      statusText += `${
        player.workers > 0 && !player.workersPaused ? ", " : ""
      }Sellers: ${player.sellers}`;
    }

    autoStatus.innerHTML = `
            ${statusText}
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
            ⏸️ Automatisering inactief - Huur werknemers om te beginnen!
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
        `;

    if (autoTickInterval) {
      stopAutoTick();
    }
  }
}

// Auto-tick systeem starten voor idle game functionaliteit
function startAutoTick() {
  if (autoTickInterval) return;

  let progress = 0;
  const progressElement = document.getElementById("progressFill");

  autoTickInterval = setInterval(async () => {
    try {
      await autoTick(currentPlayer._id);
      const updatedPlayer = await getPlayerById(currentPlayer._id);
      updatePlayerDisplay(updatedPlayer, true);

      // Reset voortgangsbalk na elke tick
      progress = 0;
      if (progressElement) {
        progressElement.style.width = "0%";
      }
    } catch (error) {
      console.error("Auto-tick fout:", error);
    }
  }, TICK_INTERVAL);

  // Visuele voortgangsbalk animatie
  const progressInterval = setInterval(() => {
    progress += 100 / (TICK_INTERVAL / 50); // 50ms intervallen voor vloeiende animatie
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

// Auto-tick systeem stoppen
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

// Werknemerskosten informatie laden en knoppen bijwerken
async function loadWorkerCosts() {
  try {
    const workerCosts = await getWorkerCosts(currentPlayer._id);

    // Werk knop teksten bij met actuele kosten
    const hireWorkerBtn = document.getElementById("hireWorkerBtn");
    const hireSellerBtn = document.getElementById("hireSellerBtn");

    if (hireWorkerBtn) {
      hireWorkerBtn.innerHTML = `
                <span>🧑‍🌾</span>
                Huur Worker (€${formatNumber(workerCosts.nextWorkerCost)})
            `;
    }

    if (hireSellerBtn) {
      hireSellerBtn.innerHTML = `
                <span>🧑‍💼</span>
                Huur Seller (€${formatNumber(workerCosts.nextSellerCost)})
            `;
    }

    return workerCosts;
  } catch (error) {
    console.error("Fout bij laden werknemerskosten:", error);
    return { nextWorkerCost: 200, nextSellerCost: 200 };
  }
}

// Resource upgrade informatie laden en weergeven
async function loadResourceUpgradeInfo() {
  try {
    const resourceInfo = await getResourceInfo(currentPlayer._id);

    if (currentResourceEmoji && resourceInfo.current) {
      currentResourceEmoji.textContent = resourceInfo.current.emoji;
      currentResourceName.textContent = resourceInfo.current.name;
      currentResourceValue.textContent = resourceInfo.current.value;
    }

    if (resourceInfo.next && nextResourceDiv) {
      nextResourceEmoji.textContent = resourceInfo.next.emoji;
      nextResourceName.textContent = resourceInfo.next.name;
      nextResourceValue.textContent = resourceInfo.next.value;
      upgradeCost.textContent = formatNumber(resourceInfo.current.upgradeCost);

      // Upgrade knop beschikbaarheid
      const canAfford = resourceInfo.canUpgrade;
      upgradeBtn.disabled = !canAfford;
      upgradeBtn.style.opacity = canAfford ? "1" : "0.6";

      nextResourceDiv.style.display = "block";
    } else if (nextResourceDiv) {
      nextResourceDiv.style.display = "none"; // Verberg als maximum niveau bereikt
    }
  } catch (error) {
    console.error("Fout bij laden resource info:", error);
  }
}

// Spelergegevens laden en alle UI bijwerken
async function loadPlayerData() {
  try {
    const updatedPlayer = await getPlayerById(currentPlayer._id);
    updatePlayerDisplay(updatedPlayer);
    await loadResourceUpgradeInfo();
    // Werknemerskosten worden nu lokaal berekend in updateButtonStates
  } catch (error) {
    console.error("Fout bij laden spelergegevens:", error);
    showStatusMessage("Fout bij laden gegevens", "error");
  }
}

// Event Listeners - Basis navigatie en uitloggen
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("currentPlayer");
  stopAutoTick();
  window.location.href = "../index.html";
});

// Event Listeners - Handmatige spelacties
collectBtn.addEventListener("click", async () => {
  try {
    collectBtn.disabled = true;
    await collectResources(currentPlayer._id);
    await loadPlayerData();
    showStatusMessage("Resources verzameld!");
  } catch (error) {
    console.error("Fout:", error);
    showStatusMessage("Fout bij het verzamelen", "error");
  } finally {
    collectBtn.disabled = false;
  }
});

sellBtn.addEventListener("click", async () => {
  if (currentPlayer.resources === 0) {
    showStatusMessage("Geen resources om te verkopen!", "error");
    return;
  }

  try {
    sellBtn.disabled = true;
    const soldAmount =
      currentPlayer.resources * (currentPlayer.resourceValue || 1);
    await sellResources(currentPlayer._id);
    await loadPlayerData();
    showStatusMessage(`Resources verkocht voor €${formatNumber(soldAmount)}!`);
  } catch (error) {
    console.error("Fout:", error);
    showStatusMessage("Fout bij het verkopen", "error");
  } finally {
    sellBtn.disabled = false;
  }
});

// Event Listeners - Werknemer aanname avec vérification des coûts
hireWorkerBtn.addEventListener("click", async () => {
  try {
    hireWorkerBtn.disabled = true;

    // Calcul local du coût avant embauche
    const calculateWorkerCost = (currentCount) => {
      const baseCost = 200;
      return Math.floor(baseCost * Math.pow(1.5, currentCount));
    };

    const workerCost = calculateWorkerCost(currentPlayer.workers || 0);

    if (currentPlayer.money < workerCost) {
      showStatusMessage(
        `Niet genoeg geld! Kosten: €${formatNumber(workerCost)}`,
        "error"
      );
      return;
    }

    await hireWorker(currentPlayer._id, "collector");
    await loadPlayerData();
    showStatusMessage(`Worker aangenomen voor €${formatNumber(workerCost)}!`);
  } catch (error) {
    console.error("Fout:", error);
    showStatusMessage(error.message, "error");
  } finally {
    hireWorkerBtn.disabled = false;
  }
});

hireSellerBtn.addEventListener("click", async () => {
  try {
    hireSellerBtn.disabled = true;

    // Calcul local du coût avant embauche
    const calculateWorkerCost = (currentCount) => {
      const baseCost = 200;
      return Math.floor(baseCost * Math.pow(1.5, currentCount));
    };

    const sellerCost = calculateWorkerCost(currentPlayer.sellers || 0);

    if (currentPlayer.money < sellerCost) {
      showStatusMessage(
        `Niet genoeg geld! Kosten: €${formatNumber(sellerCost)}`,
        "error"
      );
      return;
    }

    await hireWorker(currentPlayer._id, "seller");
    await loadPlayerData();
    showStatusMessage(`Seller aangenomen voor €${formatNumber(sellerCost)}!`);
  } catch (error) {
    console.error("Fout:", error);
    showStatusMessage(error.message, "error");
  } finally {
    hireSellerBtn.disabled = false;
  }
});

// Event Listeners - Pauzeer/hervat functionaliteiten
pauseWorkersBtn.addEventListener("click", async () => {
  try {
    pauseWorkersBtn.disabled = true;
    const result = await toggleWorkersPause(currentPlayer._id);
    await loadPlayerData();
    showStatusMessage(result.message);
  } catch (error) {
    console.error("Fout:", error);
    showStatusMessage("Fout bij pauzeren workers", "error");
  } finally {
    pauseWorkersBtn.disabled = false;
  }
});

pauseSellersBtn.addEventListener("click", async () => {
  try {
    pauseSellersBtn.disabled = true;
    const result = await toggleSellersPause(currentPlayer._id);
    await loadPlayerData();
    showStatusMessage(result.message);
  } catch (error) {
    console.error("Fout:", error);
    showStatusMessage("Fout bij pauzeren sellers", "error");
  } finally {
    pauseSellersBtn.disabled = false;
  }
});

// Event Listener - Resource upgrade systeem
if (upgradeBtn) {
  upgradeBtn.addEventListener("click", async () => {
    try {
      upgradeBtn.disabled = true;

      console.log(
        "VOOR UPGRADE - Workers:",
        currentPlayer.workers,
        "Sellers:",
        currentPlayer.sellers
      );

      const result = await upgradeResource(currentPlayer._id);

      console.log("NA UPGRADE - Réponse serveur:", result.player);
      console.log(
        "Workers in antwoord:",
        result.player.workers,
        "Sellers:",
        result.player.sellers
      );

      // verwerk de huidige spelergegevens
      currentPlayer = result.player;

      // Stop auto-tick onmiddelijk
      if (autoTickInterval) {
        stopAutoTick();
      }

      // verwerk de weergave van de speler
      playerWorkers.textContent = result.player.workers || 0;
      playerSellers.textContent = result.player.sellers || 0;

      console.log(
        "getoont - Workers:",
        playerWorkers.textContent,
        "Sellers:",
        playerSellers.textContent
      );

      // Celebreer de upgrade met visuele effecten
      const resourceTypes = {
        1: { name: "Steen", emoji: "🪨" },
        2: { name: "IJzer", emoji: "⛏️" },
        3: { name: "Goud", emoji: "🏆" },
        4: { name: "Diamant", emoji: "💎" },
        5: { name: "Platina", emoji: "⭐" },
      };

      const newResourceData = resourceTypes[result.upgradeInfo.newLevel];
      celebrateUpgrade(newResourceData);

      // refresh player data
      await loadPlayerData();

      // Force re-update après le reload
      updatePlayerDisplay(result.player, true);

      // Toon upgrade bericht
      let upgradeMessage = `Geüpgraded naar ${result.upgradeInfo.newResource.name}! Nieuwe waarde: €${result.upgradeInfo.newValue}`;

      if (
        result.upgradeInfo.workersReset > 0 ||
        result.upgradeInfo.sellersReset > 0
      ) {
        upgradeMessage += `\n⚠️ Werknemers gereset: ${result.upgradeInfo.workersReset} Workers, ${result.upgradeInfo.sellersReset} Sellers`;
      }

      showStatusMessage(upgradeMessage);
    } catch (error) {
      console.error("Fout:", error);
      showStatusMessage(error.message, "error");
    } finally {
      upgradeBtn.disabled = false;
    }
  });
}

// Toetsenbord snelkoppelingen voor snelle toegang
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) return; // Vermijd conflicten met systeemkoppelingen

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
    case "p":
      if (!pauseWorkersBtn.disabled) pauseWorkersBtn.click();
      break;
    case "u":
      if (upgradeBtn && !upgradeBtn.disabled) upgradeBtn.click();
      break;
  }
});

// Spel initialisatie bij laden van pagina
window.addEventListener("load", async () => {
  // Controleer of een speler is ingelogd
  const playerData = sessionStorage.getItem("currentPlayer");
  if (!playerData) {
    window.location.href = "../index.html";
    return;
  }

  try {
    currentPlayer = JSON.parse(playerData);
    userName.textContent = currentPlayer.username;

    // Laad huidige spelergegevens van server
    await loadPlayerData();

    // Initialiseer achtergrond effecten
    const resourceTypes = {
      1: {
        name: "Steen",
        emoji: "🪨",
        className: "resource-level-1",
        particleType: "stone",
      },
      2: {
        name: "IJzer",
        emoji: "⛏️",
        className: "resource-level-2",
        particleType: "iron",
      },
      3: {
        name: "Goud",
        emoji: "🏆",
        className: "resource-level-3",
        particleType: "gold",
      },
      4: {
        name: "Diamant",
        emoji: "💎",
        className: "resource-level-4",
        particleType: "diamond",
      },
      5: {
        name: "Platina",
        emoji: "⭐",
        className: "resource-level-5",
        particleType: "platinum",
      },
    };

    const currentResourceLevel = currentPlayer.resourceLevel || 1;
    updateBackgroundLevel(resourceTypes[currentResourceLevel]);

    // Start auto-tick als speler al werknemers heeft
    if (currentPlayer.workers > 0 || currentPlayer.sellers > 0) {
      startAutoTick();
    }
  } catch (error) {
    console.error("Initialisatiefout:", error);
    sessionStorage.removeItem("currentPlayer");
    window.location.href = "../index.html";
  }
});

// Opruimen bij sluiten van venster
window.addEventListener("beforeunload", () => {
  stopAutoTick();
});

// Periodieke refresh voor offline wijzigingen (elke 30 seconden)
setInterval(async () => {
  if (currentPlayer && !autoTickInterval) {
    await loadPlayerData();
  }
}, 30000);
