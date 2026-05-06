import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Node Sentinel AI Transaction Engine 🚀");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Transaction Engine running on http://localhost:${PORT}`);
});
