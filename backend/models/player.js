const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    money: { type: Number, default: 1000 },
    resources: { type: Number, default: 0 },
    workers: { type: Number, default: 0 },
    sellers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("player", playerSchema);
