const BASE_URL = "http://localhost:3000/api";

// maak een nieuwe speler aan
export async function createPlayer(username) {
  const response = await fetch(`${BASE_URL}/player`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username }),
  });
  return await response.json();
}

// get een lijst van alle spelers
export async function getPlayers() {
  const response = await fetch(`${BASE_URL}/players`);
  return await response.json();
}

export async function collectResources(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/collect`, {
    method: "PATCH",
  });
  return await response.json();
}

export async function sellResources(playerId) {
  const response = await fetch(`${BASE_URL}/player/${playerId}/sell`, {
    method: "PATCH",
  });
  return await response.json();
}
