import React from "react";
// @ts-ignore
import * as CoinGecko from "coingecko-api";

const PRICE_REFRESH = 10000;

const CoinGeckoClient = new CoinGecko();

export enum CoingeckoStatus {
  Success,
  FetchFailed,
}

export interface CoinInfo {
  price: number;
  volume_24: number;
  market_cap: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
  last_updated: Date;
}

export interface CoinInfoResult {
  data: {
    market_data: {
      current_price: {
        usd: number;
      };
      total_volume: {
        usd: number;
      };
      market_cap: {
        usd: number;
      };
      price_change_percentage_24h: number;
      market_cap_rank: number;
    };
    last_updated: string;
  };
}

export type CoinGeckoResult = {
  coinInfo?: CoinInfo;
  status: CoingeckoStatus;
};

export function useCoinGecko(coinId?: string): CoinGeckoResult | undefined {
  const [coinInfo, setCoinInfo] = React.useState<CoinGeckoResult>();
  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (coinId) {
      const getCoinInfo = () => {
        CoinGeckoClient.coins
          .fetch(coinId)
          .then((info: CoinInfoResult) => {
            setCoinInfo({
              coinInfo: {
                price: 0.25,//info.data.market_data.current_price.usd,
                volume_24: 0,//info.data.market_data.total_volume.usd,
                market_cap: 0.25*10000,//info.data.market_data.market_cap.usd,
                market_cap_rank: 2490,//info.data.market_data.market_cap_rank,
                price_change_percentage_24h:
                  0,//info.data.market_data.price_change_percentage_24h,
                last_updated: new Date(info.data.last_updated),
              },
              status: CoingeckoStatus.Success,
            });
          })
          .catch((error: any) => {
            setCoinInfo({
              status: CoingeckoStatus.FetchFailed,
            });
          });
      };

      getCoinInfo();
      interval = setInterval(() => {
        getCoinInfo();
      }, PRICE_REFRESH);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [setCoinInfo, coinId]);

  return coinInfo;
}
