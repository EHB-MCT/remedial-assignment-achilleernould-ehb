const Player = require("../models/player");

exports.createPlayer = async (req, res) => {
  try {
    const { username } = req.body;
    const player = new Player({ username });
    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.collectResources = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Player not found" });
    player.resources += player.workers > 0 ? player.workers : 1;
    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sellResources = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Player not found" });
    const sold = player.resources > 0 ? player.resources : 0;
    player.money += sold * 10;
    player.resources = 0;
    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.hireWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const player = await Player.findById(id);
    if (!player) return res.status(404).json({ error: "Player not found" });

    const cost = 200;
    if (player.money < cost)
      return res.status(400).json({ error: "Not enough money" });

    player.money -= cost;
    if (type === "collector") {
      player.workers += 1;
    } else if (type === "seller") {
      player.sellers += 1;
    } else {
      return res.status(400).json({ error: "Invalid worker type" });
    }

    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * autoTick voor automatische acties:
 * - de spelers verzamelt automatisch resources op basis van hun aantal werkers
 * - de spelers verkoopt automatisch resources op basis van hun aantal verkopers
 */
exports.autoTick = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Player not found" });

    const collected = player.workers;
    player.resources += collected;

    let sold = 0;
    for (let i = 0; i < player.sellers; i++) {
      if (player.resources > 0) {
        player.resources -= 1;
        player.money += 10;
        sold += 1;
      }
    }

    await player.save();

    res.json({
      collected,
      sold,
      money: player.money,
      resources: player.resources,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
