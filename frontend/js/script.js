import { createPlayer, getPlayers } from "./api.js";

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
