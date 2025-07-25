import {
  createPlayer,
  getPlayers,
  collectResources,
  sellResources,
} from "./api.js";

const playerForm = document.getElementById("playerForm");
const playerList = document.getElementById("playerList");

async function loadPlayers() {
  const players = await getPlayers();
  playerList.innerHTML = "";
  players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = `${player.username} | Argent: ${player.money} | Ressources: ${player.resources}`;
    playerList.appendChild(li);
  });
}

playerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  if (username) {
    await createPlayer(username);
    document.getElementById("username").value = "";
    loadPlayers();
  }
});

// laad spelers bij het laden van de pagina
loadPlayers();

const playerSelect = document.getElementById("playerSelect");
const collectBtn = document.getElementById("collectBtn");
const sellBtn = document.getElementById("sellBtn");

async function updatePlayerListForSelect() {
  const players = await getPlayers();
  playerSelect.innerHTML = "";
  players.forEach((player) => {
    const option = document.createElement("option");
    option.value = player._id;
    option.textContent = `${player.username} (💰${player.money} | 🪨${player.resources})`;
    playerSelect.appendChild(option);
  });
}

// Charger la liste au démarrage
updatePlayerListForSelect();

// Actions
collectBtn.addEventListener("click", async () => {
  const playerId = playerSelect.value;
  if (!playerId) return;
  await collectResources(playerId);
  await updatePlayerListForSelect();
  await loadPlayers();
});

sellBtn.addEventListener("click", async () => {
  const playerId = playerSelect.value;
  if (!playerId) return;
  await sellResources(playerId);
  await updatePlayerListForSelect();
  await loadPlayers();
});
