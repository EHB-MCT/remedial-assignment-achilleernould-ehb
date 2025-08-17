const Player = require("../models/player");

// Système d'upgrade des ressources
const RESOURCE_TYPES = {
  1: { name: "Steen", emoji: "🪨", upgradeCost: 5000 },
  2: { name: "IJzer", emoji: "⛏️", upgradeCost: 25000 },
  3: { name: "Goud", emoji: "🏆", upgradeCost: 100000 },
  4: { name: "Diamant", emoji: "💎", upgradeCost: 500000 },
  5: { name: "Platina", emoji: "⭐", upgradeCost: null }, // Niveau max
};

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

exports.hireWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const player = await Player.findById(id);

    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    const cost = 200;
    if (player.money < cost)
      return res.status(400).json({ error: "Niet genoeg geld" });

    player.money -= cost;

    if (type === "collector") {
      player.workers += 1;
    } else if (type === "seller") {
      player.sellers += 1;
    } else {
      return res.status(400).json({ error: "Ongeldig werker type" });
    }

    await player.save();
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.autoTick = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    let collected = 0;
    let sold = 0;

    // Collecte automatique (si pas en pause)
    if (!player.workersPaused && player.workers > 0) {
      collected = player.workers;
      player.resources += collected;
      player.totalResourcesCollected += collected;
    }

    // Vente automatique (si pas en pause)
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

// Nouvelle fonction : Pause/Resume workers
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

// Nouvelle fonction : Pause/Resume sellers
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

// Nouvelle fonction : Upgrade des ressources
exports.upgradeResource = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    const currentLevel = player.resourceLevel;
    const nextLevel = currentLevel + 1;

    // Vérifier si un upgrade est possible
    if (nextLevel > 5) {
      return res.status(400).json({ error: "Maximum niveau bereikt!" });
    }

    const upgradeCost = RESOURCE_TYPES[currentLevel].upgradeCost;

    if (player.money < upgradeCost) {
      return res.status(400).json({
        error: `Niet genoeg geld! Kosten: €${upgradeCost.toLocaleString()}`,
      });
    }

    // Effectuer l'upgrade
    player.money -= upgradeCost;
    player.resourceLevel = nextLevel;
    player.resourceValue = nextLevel * 10; // Nouvelle valeur : niveau * 10
    player.totalUpgrades += 1;

    await player.save();

    const newResourceType = RESOURCE_TYPES[nextLevel];

    res.json({
      player,
      upgradeInfo: {
        newLevel: nextLevel,
        newResource: newResourceType,
        newValue: player.resourceValue,
        costPaid: upgradeCost,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Nouvelle fonction : Obtenir les infos des ressources
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
            value: (player.resourceLevel + 1) * 10,
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

// Fonction pour obtenir les coûts des prochains workers
exports.getWorkerCosts = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: "Speler niet gevonden" });

    // Fonction pour calculer les coûts (assurez-vous qu'elle existe dans votre fichier)
    const calculateWorkerCost = (currentCount) => {
      const baseCost = 200;
      return Math.floor(baseCost * Math.pow(1.5, currentCount));
    };

    const nextWorkerCost = calculateWorkerCost(player.workers);
    const nextSellerCost = calculateWorkerCost(player.sellers);

    res.json({
      nextWorkerCost,
      nextSellerCost,
      canAffordWorker: player.money >= nextWorkerCost,
      canAffordSeller: player.money >= nextSellerCost,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
