const Player = require("../models/player");

// Systeem voor resource types
const RESOURCE_TYPES = {
  1: { name: "Steen", emoji: "🪨", baseValue: 1, upgradeCost: 10000 },
  2: { name: "IJzer", emoji: "⛏️", baseValue: 10, upgradeCost: 100000 },
  3: { name: "Goud", emoji: "🏆", baseValue: 100, upgradeCost: 1000000 },
  4: { name: "Diamant", emoji: "💎", baseValue: 1000, upgradeCost: 10000000 },
  5: { name: "Platina", emoji: "⭐", baseValue: 10000, upgradeCost: null },
};

// Functie om werknemerskosten te berekenen (DOIT ÊTRE GLOBALE)
function calculateWorkerCost(currentCount) {
  const baseCost = 200;
  return Math.floor(baseCost * Math.pow(1.5, currentCount));
}

// Nieuwe speler aanmaken
exports.createPlayer = async (req, res) => {
  try {
    const { username } = req.body;
    const player = new Player({
      username,
      resourceValue: RESOURCE_TYPES[1].baseValue,
    });
    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alle spelers ophalen
exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resources verzamelen
exports.collectResources = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    const collected = player.workers > 0 ? player.workers : 1;
    player.resources += collected;
    player.totalResourcesCollected += collected;

    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resources verkopen
exports.sellResources = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    const sold = player.resources > 0 ? player.resources : 0;
    const moneyEarned = sold * player.resourceValue;

    player.money += moneyEarned;
    player.totalMoneySaved += moneyEarned;
    player.resources = 0;

    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Worker of seller aannemen (CORRIGÉ)
exports.hireWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const player = await Player.findById(id);

    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    // Bereken kosten AVANT d'embaucher
    let cost;
    if (type === "collector") {
      cost = calculateWorkerCost(player.workers); // Coût AVANT d'ajouter
    } else if (type === "seller") {
      cost = calculateWorkerCost(player.sellers); // Coût AVANT d'ajouter
    } else {
      return res.status(400).json({ error: "Ongeldig werknemer type" });
    }

    console.log(
      `Tentative d'embauche ${type}: coût calculé = ${cost}, argent joueur = ${player.money}`
    );

    if (player.money < cost) {
      return res.status(400).json({
        error: `Niet genoeg geld! Kosten: €${cost.toLocaleString()}`,
      });
    }

    // geld afhalen en werknemer toevoegen
    player.money -= cost;

    if (type === "collector") {
      player.workers += 1;
    } else {
      player.sellers += 1;
    }

    console.log(
      `Embauche réussie: nouveau nombre de ${type}s = ${
        type === "collector" ? player.workers : player.sellers
      }`
    );

    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Auto-tick
exports.autoTick = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    let collected = 0;
    let sold = 0;

    if (!player.workersPaused && player.workers > 0) {
      collected = player.workers;
      player.resources += collected;
      player.totalResourcesCollected += collected;
    }

    if (!player.sellersPaused && player.sellers > 0) {
      for (let i = 0; i < player.sellers; i++) {
        if (player.resources > 0) {
          player.resources -= 1;
          const moneyFromSale = player.resourceValue;
          player.money += moneyFromSale;
          player.totalMoneySaved += moneyFromSale;
          sold += 1;
        }
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

// Pause workers
exports.toggleWorkersPause = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    player.workersPaused = !player.workersPaused;
    await player.save();

    res.json({
      workersPaused: player.workersPaused,
      message: player.workersPaused ? "Workers gepauzeerd" : "Workers hervat",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pause sellers
exports.toggleSellersPause = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    player.sellersPaused = !player.sellersPaused;
    await player.save();

    res.json({
      sellersPaused: player.sellersPaused,
      message: player.sellersPaused ? "Sellers gepauzeerd" : "Sellers hervat",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPGRADE RESOURCE
exports.upgradeResource = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    const currentLevel = player.resourceLevel;
    const nextLevel = currentLevel + 1;

    if (nextLevel > 5) {
      return res.status(400).json({ error: "Maximum niveau bereikt!" });
    }

    const upgradeCost = RESOURCE_TYPES[currentLevel].upgradeCost;

    if (player.money < upgradeCost) {
      return res.status(400).json({
        error: `Niet genoeg geld! Kosten: €${upgradeCost.toLocaleString()}`,
      });
    }

    // save previous state for reset
    const previousWorkers = player.workers;
    const previousSellers = player.sellers;

    console.log(
      `UPGRADE: Avant reset - Workers: ${previousWorkers}, Sellers: ${previousSellers}`
    );

    // upgrade uitvoeren
    player.money -= upgradeCost;
    player.resourceLevel = nextLevel;
    player.resourceValue = RESOURCE_TYPES[nextLevel].baseValue;
    player.totalUpgrades += 1;

    // reset workers en sellers
    player.workers = 0;
    player.sellers = 0;
    player.workersPaused = false;
    player.sellersPaused = false;

    console.log(
      `UPGRADE: Après reset - Workers: ${player.workers}, Sellers: ${player.sellers}`
    );

    await player.save();

    const newResourceType = RESOURCE_TYPES[nextLevel];

    console.log(
      `UPGRADE: Sauvegardé avec succès - Workers: ${player.workers}, Sellers: ${player.sellers}`
    );

    res.json({
      player,
      upgradeInfo: {
        newLevel: nextLevel,
        newResource: newResourceType,
        newValue: player.resourceValue,
        costPaid: upgradeCost,
        workersReset: previousWorkers,
        sellersReset: previousSellers,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resource info
exports.getResourceInfo = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    const currentResource = RESOURCE_TYPES[player.resourceLevel];
    const nextResource = RESOURCE_TYPES[player.resourceLevel + 1] || null;

    res.json({
      current: {
        ...currentResource,
        level: player.resourceLevel,
        value: player.resourceValue,
      },
      next: nextResource
        ? {
            ...nextResource,
            level: player.resourceLevel + 1,
            value: nextResource.baseValue,
          }
        : null,
      canUpgrade: nextResource && player.money >= currentResource.upgradeCost,
      stats: {
        totalCollected: player.totalResourcesCollected,
        totalEarned: player.totalMoneySaved,
        totalUpgrades: player.totalUpgrades,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
