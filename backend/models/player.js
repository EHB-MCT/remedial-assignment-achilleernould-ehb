const mongoose = require("mongoose");

// Speler schema definitie voor de database
const playerSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // Unieke spelernaam
    money: { type: Number, default: 0 }, // Start met 0 geld
    resources: { type: Number, default: 0 }, // Aantal resources in bezit
    workers: { type: Number, default: 0 }, // Aantal workers aangenomen
    sellers: { type: Number, default: 0 }, // Aantal sellers aangenomen

    // Nieuwe eigenschappen voor pause functionaliteit
    workersPaused: { type: Boolean, default: false }, // Workers gepauzeerd status
    sellersPaused: { type: Boolean, default: false }, // Sellers gepauzeerd status

    // Resource upgrade systeem
    resourceLevel: { type: Number, default: 1 }, // Huidige resource niveau (1-5)
    resourceValue: { type: Number, default: 1 }, // Verkoopwaarde per resource (start met 1€ voor steen)

    // Statistieken tracking voor speler voortgang
    totalResourcesCollected: { type: Number, default: 0 }, // Totaal verzamelde resources
    totalMoneySaved: { type: Number, default: 0 }, // Totaal verdiend geld
    totalUpgrades: { type: Number, default: 0 }, // Aantal uitgevoerde upgrades
  },
  { timestamps: true } // Automatisch createdAt en updatedAt timestamps
);

module.exports = mongoose.model("Player", playerSchema);
