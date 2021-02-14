const express = require("express");

const ath1 = require("./data/ath1.json");
const unlisted1 = require("./data/unlisted1.json");

const {
  ping,
  coinsNotToAthYet,
  coinsNotListedYetOn,
} = require("./coingecko-api");
const app = express();

app.get("/", async (req, res) => {
  const result = await ping();
  res.json(result);
});

app.get("/ath", async (req, res) => {
  const result = await coinsNotToAthYet();
  res.json(result);
});

app.get("/ath-data", async (req, res) => {
  const result = ath1.map((c) => c.id);
  res.json(result);
});

app.get("/unlisted-coins", async (req, res) => {
  const result = await coinsNotListedYetOn(["gdax", "binance"]);
  res.json(result);
});

app.get("/unlisted-data", async (req, res) => {
  const result = unlisted1.map((c) => c.id);
  res.json(result);
});

app.listen(3000, function () {
  console.log("Crypto finder running on port 3000!");
});
