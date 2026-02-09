import express from "express";
import path from "path";
import * as dotenv from "dotenv";
import { fetchAaveRates } from "./aave";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const publicDir = path.join(__dirname, "..");

app.use(express.static(publicDir));

app.get("/api/aave-rates", async (_req, res) => {
  try {
    const rates = await fetchAaveRates();
    res.json({
      updatedAt: new Date().toISOString(),
      rates
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching Aave rates:", error);
    res.status(500).json({ error: "Failed to fetch Aave rates" });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});

