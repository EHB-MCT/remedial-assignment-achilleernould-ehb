const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");

// Créer un nouveau joueur
router.post("/player", playerController.createPlayer);

// Obtenir tous les joueurs
router.get("/players", playerController.getPlayers);

// Collecter des ressources (PATCH au lieu de POST)
router.patch("/player/:id/collect", playerController.collectResources);

// Vendre des ressources (PATCH au lieu de POST)
router.patch("/player/:id/sell", playerController.sellResources);

// Recruter un worker ou seller
router.post("/player/:id/hire", playerController.hireWorker);

// Auto-tick pour l'automatisation
router.post("/player/:id/auto-tick", playerController.autoTick);

module.exports = router;
