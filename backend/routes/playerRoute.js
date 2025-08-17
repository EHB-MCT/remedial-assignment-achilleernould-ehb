const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");

// Basis speler routes
router.post("/player", playerController.createPlayer); // Nieuwe speler aanmaken
router.get("/players", playerController.getPlayers); // Alle spelers ophalen

// Spel actie routes
router.patch("/player/:id/collect", playerController.collectResources); // Resources verzamelen
router.patch("/player/:id/sell", playerController.sellResources); // Resources verkopen
router.post("/player/:id/hire", playerController.hireWorker); // Werknemer aannemen
router.post("/player/:id/auto-tick", playerController.autoTick); // Automatische tick voor idle functionaliteit

// Nieuwe functionaliteit routes
router.patch("/player/:id/toggle-workers", playerController.toggleWorkersPause); // Workers pauzeren/hervatten
router.patch("/player/:id/toggle-sellers", playerController.toggleSellersPause); // Sellers pauzeren/hervatten
router.post("/player/:id/upgrade-resource", playerController.upgradeResource); // Resource niveau upgraden
router.get("/player/:id/resource-info", playerController.getResourceInfo); // Resource informatie ophalen

module.exports = router;
