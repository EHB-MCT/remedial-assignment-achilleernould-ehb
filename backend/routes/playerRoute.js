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

module.exports = router;
