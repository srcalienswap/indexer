import { Provider } from "@ethersproject/abstract-provider";

import { getPoolPriceFromAPI } from "./helpers";
import * as Types from "./types";
import { lc, s } from "../utils";

export class Order {
  public chainId: number;
  public params: Types.OrderParams;

  constructor(chainId: number, params: Types.OrderParams) {
    this.chainId = chainId;

    try {
      this.params = normalize(params);
    } catch {
      throw new Error("Invalid params");
    }
  }

  async getQuote(slippage: number, provider: Provider) {
    const side = this.params.idsOut?.length ? "buy" : "sell";
    return getPoolPriceFromAPI(
      this.params.pool,
      side,
      slippage,
      provider,
      this.params.userAddress,
      side === "buy" ? this.params.idsOut! : this.params.idsIn!,
      this.params.amounts
    );
  }
}

const normalize = (order: Types.OrderParams): Types.OrderParams => {
  // Perform some normalization operations on the order:
  // - convert bignumbers to strings where needed
  // - convert strings to numbers where needed
  // - lowercase all strings

  return {
    vaultId: s(order.vaultId),
    pool: lc(order.pool),
    collection: lc(order.collection),
    userAddress: lc(order.userAddress),
    idsIn: order.idsIn ? order.idsIn.map(s) : [],
    idsOut: order.idsOut ? order.idsOut.map(s) : [],
    amounts: order.amounts ? order.amounts.map(s) : [],
    currency: s(order.currency),
    path: order.path ? order.path.map(s) : [],
    executeCallData: order.executeCallData ? lc(order.executeCallData) : undefined,
    deductRoyalty: order.deductRoyalty ? "true" : "false",
    vTokenPremiumLimit: s(order.vTokenPremiumLimit),
    price: s(order.price),
    extra: {
      prices: order.extra.prices.map(s),
    },
  };
};
