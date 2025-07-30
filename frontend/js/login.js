const BASE_URL = "http://localhost:3000/api";

// Éléments DOM
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const loginText = document.getElementById("loginText");
const statusMessage = document.getElementById("statusMessage");

// Fonctions utilitaires
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
    loginText.innerHTML = "🚀 Commencer à jouer";
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
    throw new Error(error.error || "Erreur lors de la création du compte");
  }

  return await response.json();
}

async function getPlayers() {
  const response = await fetch(`${BASE_URL}/players`);

  if (!response.ok) {
    throw new Error("Erreur de connexion au serveur");
  }

  return await response.json();
}

async function findOrCreatePlayer(username) {
  try {
    // D'abord, essayer de trouver le joueur existant
    const players = await getPlayers();
    const existingPlayer = players.find(
      (p) => p.username.toLowerCase() === username.toLowerCase()
    );

    if (existingPlayer) {
      return { player: existingPlayer, isNew: false };
    } else {
      // Si le joueur n'existe pas, le créer
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
    showStatusMessage("Veuillez entrer un nom d'utilisateur", "error");
    return;
  }

  if (username.length < 2) {
    showStatusMessage("Le nom doit contenir au moins 2 caractères", "error");
    return;
  }

  showLoading(true);

  try {
    const result = await findOrCreatePlayer(username);
    const player = result.player;
    const isNew = result.isNew;

    if (isNew) {
      showStatusMessage(
        `Nouveau compte créé ! Bienvenue ${player.username} !`,
        "success"
      );
    } else {
      showStatusMessage(`Bon retour ${player.username} !`, "success");
    }

    // Sauvegarder les infos du joueur
    sessionStorage.setItem("currentPlayer", JSON.stringify(player));

    // Redirection vers le jeu après un délai
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

// Vérifier si un joueur est déjà connecté
window.addEventListener("load", () => {
  const currentPlayer = sessionStorage.getItem("currentPlayer");
  if (currentPlayer) {
    // Rediriger directement vers le jeu si déjà connecté
    showStatusMessage("Redirection vers votre jeu...", "success");
    setTimeout(() => {
      window.location.href = "pages/game.html";
    }, 1000);
  }
});

// Animation d'entrée
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

// Gestion des erreurs de réseau
window.addEventListener("online", () => {
  showStatusMessage("Connexion rétablie !", "success");
});

window.addEventListener("offline", () => {
  showStatusMessage("Connexion perdue. Vérifiez votre réseau.", "error");
});
