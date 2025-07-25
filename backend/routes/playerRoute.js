const express = require("express");
const router = express.Router();
const Player = require("../models/player");

// Route POST
router.post("/player", async (req, res) => {
  try {
    const player = new Player({
      username: req.body.username,
      money: req.body.money,
      resources: req.body.resources,
    });
    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route GET
router.get("/players", async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route voor het verzamelen van resources
router.patch("/player/:id/collect", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    player.resources += 5; // of een andere hoeveelheid later
    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route voor het verkopen van resources
router.patch("/player/:id/sell", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    const sellingPrice = 10; // every resource sells for 10
    const resourcesToSell = player.resources;
    player.money += resourcesToSell * sellingPrice;
    player.resources = 0;
    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
