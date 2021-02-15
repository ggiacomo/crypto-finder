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

function onlyUnique(value, index, self) {
  return self.findIndex((v) => v.id === value.id) === index;
}

app.get("/ath-data", async (req, res) => {
  const result = ath1
    .filter(onlyUnique)
    .filter((c) => c.market_cap_rank && c.market_cap_rank < 250)
    .map((c) => ({
      ath_change_percentage: c.ath_change_percentage,
      id: c.symbol,
      name: c.name,
    }))
    .sort((a, b) =>
      a.ath_change_percentage > b.ath_change_percentage ? 1 : -1
    )
    .map((c) => c.name);
  res.json(result);
});

app.get("/unlisted-binance-coins", async (req, res) => {
  const coins = await coinsNotListedYetOn("binance");
  const result = coins
    .filter(onlyUnique)
    .filter(
      (c) =>
        c.market_data.market_cap_rank && c.market_data.market_cap_rank < 250
    )
    .map((c) => c.name);
  res.json(result);
});

// app.get("/unlisted-binance-data", async (req, res) => {
//   const result = unlistedBinance
//     .filter(onlyUnique)
//     .filter((c) => c.market_cap_rank && c.market_cap_rank < 250)
//     .map((c) => ({
//       ath_change_percentage: c.ath_change_percentage,
//       id: c.symbol,
//       name: c.name,
//     }))
//     .sort((a, b) =>
//       a.ath_change_percentage > b.ath_change_percentage ? 1 : -1
//     );
//   res.json(result);
// });

app.get("/unlisted-coinbase-coins", async (req, res) => {
  const coins = await coinsNotListedYetOn("gdax");
  const result = coins
    .filter(onlyUnique)
    .filter(
      (c) =>
        c.market_data.market_cap_rank && c.market_data.market_cap_rank < 250
    )
    .map((c) => c.name);
  res.json(result);
});

// app.get("/unlisted-coinbase-data", async (req, res) => {
//   const result = unlistedCoinbase
//     .filter(onlyUnique)
//     .filter((c) => c.market_cap_rank && c.market_cap_rank < 250)
//     .map((c) => ({
//       ath_change_percentage: c.ath_change_percentage,
//       id: c.symbol,
//       name: c.name,
//     }))
//     .sort((a, b) =>
//       a.ath_change_percentage > b.ath_change_percentage ? 1 : -1
//     );
//   res.json(result);
// });

app.listen(3000, function () {
  console.log("Crypto finder running on port 3000!");
});
