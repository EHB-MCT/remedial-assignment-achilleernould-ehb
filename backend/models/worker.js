const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    type: { type: String, enum: ["collector", "seller"], required: true },
    level: { type: Number, default: 1 },
    collectionRate: { type: Number, default: 1 }, // resources collected per tick
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worker", workerSchema);
