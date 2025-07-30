const BASE_URL = "http://localhost:3000/api";

// Créer un nouveau joueur
export async function createPlayer(username) {
  const response = await fetch(`${BASE_URL}/player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la création du joueur");
  }

  return await response.json();
}

// Obtenir la liste de tous les joueurs
export async function getPlayers() {
  const response = await fetch(`${BASE_URL}/players`);

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des joueurs");
  }

  return await response.json();
}

// Obtenir un joueur par ID
export async function getPlayerById(playerId) {
  const players = await getPlayers();
  const player = players.find((p) => p._id === playerId);

  if (!player) {
    throw new Error("Joueur introuvable");
  }

  return player;
}

// Collecter des ressources
export async function collectResources(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/collect`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la collecte");
  }

  return await response.json();
}

// Vendre des ressources
export async function sellResources(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/sell`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de la vente");
  }

  return await response.json();
}

// Recruter un worker
export async function hireWorker(playerId, type) {
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

// Auto-tick pour automatisation
export async function autoTick(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/auto-tick`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erreur lors de l'auto-tick");
  }

  return response.json();
}

// Fonction utilitaire pour se connecter (trouver un joueur existant)
export async function loginPlayer(username) {
  const players = await getPlayers();
  const player = players.find(
    (p) => p.username.toLowerCase() === username.toLowerCase()
  );

  if (!player) {
    throw new Error("Joueur non trouvé");
  }

  return player;
}
