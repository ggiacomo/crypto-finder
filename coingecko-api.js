const CoinGecko = require("coingecko-api");
const rp = require("request-promise");
const CoinGeckoClient = new CoinGecko();

const fetchAllData = async (method, params = {}) => {
  const allResults = [];
  let finished = false;
  const paginationData = {
    page: 0,
    per_page: 250,
  };
  try {
    while (finished === false) {
      const { data } = await method({ ...paginationData, ...params });
      console.log(
        `🚀 ~ calling method for page ${paginationData.page}. Result ${data} (Total ${allResults.length})`
      );
      allResults.push(...data);
      if (data.length < paginationData.per_page) {
        finished = true;
      }
      paginationData.page++;
    }
  } catch (err) {
    console.log(`error: `, err);
  }

  return allResults;
};

function delay(t, val) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(val);
    }, t);
  });
}

exports.coinsNotToAthYet = async () => {
  const ath_days_diff = 365;
  const coins = await fetchAllData(CoinGeckoClient.coins.markets, {
    vs_currency: "eur",
  });

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

exports.coinsNotListedYetOn = async (exchange = "binance") => {
  const {
    data: { tickers },
  } = await CoinGeckoClient.exchanges.fetch(exchange);
  const { data: allCoins } = await CoinGeckoClient.coins.all();
  console.log("[coinsNotListedYetOn] ~ # coins", allCoins.length);
  const coins = allCoins.filter(
    ({ id }) => id && id.indexOf("x-long") < 0 && id.indexOf("x-short") < 0
  );

  return coins.reduce((acc, coin) => {
    const exists = tickers.find(
      (t) => t.coin_id === coin.id || t.target_coin_id === coin.id
    );
    if (!exists) {
      return [...acc, coin];
    }
    return acc;
  }, []);
};
