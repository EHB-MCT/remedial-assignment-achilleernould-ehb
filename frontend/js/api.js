const BASE_URL = "http://localhost:3000/api";

// maken van een nieuwe speler
export async function createPlayer(username) {
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

// verkrijg alle spelers
export async function getPlayers() {
  const response = await fetch(`${BASE_URL}/players`);

  if (!response.ok) {
    throw new Error("Error tijdens het ophalen van spelers");
  }

  return await response.json();
}

// verkrijg een speler op basis van ID
export async function getPlayerById(playerId) {
  const players = await getPlayers();
  const player = players.find((p) => p._id === playerId);

  if (!player) {
    throw new Error("speler niet gevonden");
  }

  return player;
}

// verzamel resources
export async function collectResources(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/collect`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.error || "Error tijdens het verzamelen van resources"
    );
  }

  return await response.json();
}

// verkoop resources
export async function sellResources(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/sell`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "error tijdens verkoop");
  }

  return await response.json();
}

// een werker inhuren
export async function hireWorker(playerId, type) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/hire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error bij het inhuren van een werker");
  }

  return response.json();
}

// auto-tick voor het automatisch verzamelen van resources
export async function autoTick(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/auto-tick`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Error tijdens auto-tick");
  }

  return response.json();
}

// handige functies voor login
export async function loginPlayer(username) {
  const players = await getPlayers();
  const player = players.find(
    (p) => p.username.toLowerCase() === username.toLowerCase()
  );

  if (!player) {
    throw new Error("Speler niet gevonden");
  }

  return player;
}
