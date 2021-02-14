const CoinGecko = require("coingecko-api");
const Bottleneck = require("bottleneck");
const rp = require("request-promise");
const CoinGeckoClient = new CoinGecko();

// const coingeckoApiLimiter = new Bottleneck({
//   maxConcurrent: 1,
//   minTime: 1000,
//   id: 'coigecko',
//   // datastore: 'redis',
//   // clearDatastore: false,
//   // clientOptions: {
//   //   host: host,
//   //   port: port,
//   // },
// })
function delay(t, val) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(val);
    }, t);
  });
}

exports.coinsNotToAthYet = async () => {
  const ath_days_diff = 365;
  const { data: coins } = await CoinGeckoClient.coins.markets({
    vs_currency: "eur",
  });
  console.log("🚀 ~ exports.coinsNotToAthYet= ~ coins", coins.length);

  return coins.reduce((acc, coin) => {
    const { symbol, name, ath_change_percentage, ath_date } = coin;
    console.log(`[coinsNotToAthYet] checking ${name} (${symbol})`);
    const eur_ath_date = new Date(ath_date);

    const date_to_check = new Date();
    date_to_check.setDate(date_to_check.getDate() - ath_days_diff);

    if (
      ath_change_percentage < 0 &&
      eur_ath_date.getTime() < date_to_check.getTime()
    ) {
      return [...acc, coin];
    }
    return acc;
  }, []);
};

exports.coinsNotListedYetOn = async (markets = ["gdax", "binance"]) => {
  let { data: coins } = await CoinGeckoClient.coins.list();
  coins = coins.filter(
    ({ id }) => id && id.indexOf("x-long") < 0 && id.indexOf("x-short") < 0
  );
  console.log("[coinsNotListedYetOn] coins to check", coins.length);
  return coins.reduce(async (accPromise, coin) => {
    const acc = await accPromise;
    await delay(750); // to avoid the CoinGecko API limiter
    const { symbol, name, id } = coin;
    let coin_data;
    try {
      const response = await CoinGeckoClient.coins.fetch(id, {
        developer_data: false,
        sparkline: false,
        localization: false,
        community_data: false,
      });
      coin_data = response.data;
    } catch (err) {
      console.log(`coin ${id} errored: ${err}`);
      return acc;
    }
    if (!coin_data) {
      return acc;
    }
    const { tickers } = coin_data;
    // console.log("🚀 ~ returncoins.reduce ~ tickers", tickers);
    const existingInMarkets = tickers.find(({ market }) => {
      const { identifier } = market;
      return markets.some((m) => m === identifier);
    });

    console.log(`checking coin ${id}. Adding? ${!existingInMarkets}`);
    if (!existingInMarkets) {
      return [...acc, coin_data];
    }
    return acc;
  }, Promise.resolve([]));
};

exports.coinsNotListedYetOn2 = async () => {
  // markets = ["gdax", "binance"]
  const { data: coins } = await CoinGeckoClient.coins.list();
  const coinIds = coins
    .filter(
      ({ id }) => id && id.indexOf("x-long") < 0 && id.indexOf("x-short") < 0
    )
    .map((c) => c._id)
    .join(",");
  const { data: markets } = await CoinGeckoClient.coins.markets({
    vs_currency: "eur",
    ids: coinIds,
  });
  console.log("[coinsNotListedYetOn] coinIds to check", coinIds.length);
  // return coins.reduce(async (accPromise, coin) => {
  //   const acc = await accPromise;
  //   await delay(750); // to avoid the CoinGecko API limiter
  //   const { symbol, name, id } = coin;
  //   let coin_data;
  //   try {
  //     const response = await CoinGeckoClient.coins.fetch(id, {
  //       developer_data: false,
  //       sparkline: false,
  //       localization: false,
  //       community_data: false,
  //     });
  //     coin_data = response.data;
  //   } catch (err) {
  //     console.log(`coin ${id} errored: ${err}`);
  //     return acc;
  //   }
  //   if (!coin_data) {
  //     return acc;
  //   }
  //   const { tickers } = coin_data;
  //   // console.log("🚀 ~ returncoins.reduce ~ tickers", tickers);
  //   const existingInMarkets = tickers.find(({ market }) => {
  //     const { identifier } = market;
  //     return markets.some((m) => m === identifier);
  //   });

  //   console.log(`checking coin ${id}. Adding? ${!existingInMarkets}`);
  //   if (!existingInMarkets) {
  //     return [...acc, coin_data];
  //   }
  //   return acc;
  // }, Promise.resolve([]));
};
