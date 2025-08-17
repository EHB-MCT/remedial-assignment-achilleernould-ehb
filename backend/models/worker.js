const mongoose = require("mongoose");

// Worker schema voor eventuele toekomstige uitbreidingen
const workerSchema = new mongoose.Schema(
  {
    // Referentie naar de eigenaar (speler) van deze worker
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player", // Verwijst naar het Player model
      required: true,
    },

    // Type worker: "collector" voor resource verzameling, "seller" voor verkoop
    type: {
      type: String,
      enum: ["collector", "seller"],
      required: true,
    },

    // Level van de worker (voor toekomstige upgrade mogelijkheden)
    level: { type: Number, default: 1 },

    // Verzamel snelheid - hoeveel resources per tick deze worker verzamelt
    collectionRate: { type: Number, default: 1 },
  },
  { timestamps: true } // Automatische timestamps voor created/updated
);

module.exports = mongoose.model("Worker", workerSchema);
