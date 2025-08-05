const BASE_URL = "http://localhost:3000/api";

// DOM
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const loginText = document.getElementById("loginText");
const statusMessage = document.getElementById("statusMessage");

// handige functies
function showStatusMessage(message, type = "success") {
  statusMessage.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
  setTimeout(() => {
    statusMessage.innerHTML = "";
  }, 5000);
}

function showLoading(show = true) {
  if (show) {
    loginText.innerHTML = '<span class="loading"></span>Chargement...';
    loginBtn.disabled = true;
  } else {
    loginText.innerHTML = "🚀 Start met Spelen";
    loginBtn.disabled = false;
  }
}

// API functions
async function createPlayer(username) {
  const response = await fetch(`${BASE_URL}/player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error tijdens het aanmaken van de speler");
  }

  return await response.json();
}

async function getPlayers() {
  const response = await fetch(`${BASE_URL}/players`);

  if (!response.ok) {
    throw new Error("Error met de server, probeer het later opnieuw");
  }

  return await response.json();
}

async function findOrCreatePlayer(username) {
  try {
    // Eersr zoeken naar de speler
    const players = await getPlayers();
    const existingPlayer = players.find(
      (p) => p.username.toLowerCase() === username.toLowerCase()
    );

    if (existingPlayer) {
      return { player: existingPlayer, isNew: false };
    } else {
      // als de speler niet bestaat, maak een nieuwe aan
      const newPlayer = await createPlayer(username);
      return { player: newPlayer, isNew: true };
    }
  } catch (error) {
    throw error;
  }
}

// Event listeners
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  if (!username) {
    showStatusMessage("Geef een Naam in!", "error");
    return;
  }

  if (username.length < 2) {
    showStatusMessage("De naam moet minstens 2 letters bevatten", "error");
    return;
  }

  showLoading(true);

  try {
    const result = await findOrCreatePlayer(username);
    const player = result.player;
    const isNew = result.isNew;

    if (isNew) {
      showStatusMessage(
        `Nieuw account aangemaakt! WELKOM! ${player.username} !`,
        "success"
      );
    } else {
      showStatusMessage(`WELKOM TERUG! ${player.username} !`, "success");
    }

    // sla de spelergegevens op in sessionStorage
    sessionStorage.setItem("currentPlayer", JSON.stringify(player));

    // redirect naar de game pagina na 1.5 seconde
    setTimeout(() => {
      window.location.href = "pages/game.html";
    }, 1500);
  } catch (error) {
    console.error("Erreur:", error);
    showStatusMessage(error.message, "error");
  } finally {
    showLoading(false);
  }
});

// check of de speler al is ingelogd
window.addEventListener("load", () => {
  const currentPlayer = sessionStorage.getItem("currentPlayer");
  if (currentPlayer) {
    //  als de speler al is ingelogd, redirect naar de game pagina
    showStatusMessage("Loading", "success");
    setTimeout(() => {
      window.location.href = "pages/game.html";
    }, 1000);
  }
});

// intro animatie
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".login-container");
  container.style.opacity = "0";
  container.style.transform = "translateY(50px)";

  setTimeout(() => {
    container.style.transition = "all 0.6s ease";
    container.style.opacity = "1";
    container.style.transform = "translateY(0)";
  }, 100);
});

// network status
window.addEventListener("online", () => {
  showStatusMessage("Connectie terug gevonden!", "success");
});

window.addEventListener("offline", () => {
  showStatusMessage("Connectie Verloren", "error");
});
