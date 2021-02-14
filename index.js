const express = require("express");

const ath1 = require("./data/ath1.json");
const unlistedBinance = require("./data/unlisted-binance.json");
const unlistedCoinbase = require("./data/unlisted-coinbase.json");

const {
  ping,
  coinsNotToAthYet,
  coinsNotListedYetOn,
  coinsNotListedYetOnBinance,
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

app.get("/unlisted-binance-coins", async (req, res) => {
  const result = await coinsNotListedYetOn("binance");
  res.json(result);
});

app.get("/unlisted-binance-data", async (req, res) => {
  const result = unlistedBinance.map((c) => c.id);
  res.json(result);
});

app.get("/unlisted-coinbase-coins", async (req, res) => {
  const result = await coinsNotListedYetOn("gdax");
  res.json(result);
});

app.get("/unlisted-coinbase-data", async (req, res) => {
  const result = unlistedCoinbase.map((c) => c.id);
  res.json(result);
});

app.listen(3000, function () {
  console.log("Crypto finder running on port 3000!");
});
