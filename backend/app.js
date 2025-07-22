const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const playerRoutes = require("./routes/playerRoute");
app.use("/api", playerRoutes);

mongoose
  .connect(
    "mongodb+srv://achilleernould:Achille123@web2.bggqmql.mongodb.net/economy-simulator?retryWrites=true&w=majority&appName=web2"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Economy Simulator Backend Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
