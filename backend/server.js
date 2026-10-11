const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");
const eventRoutes = require("./src/routes/eventRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Event Management System API is running!");
});

app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Event routes mounted at /api/events");
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startServer();
