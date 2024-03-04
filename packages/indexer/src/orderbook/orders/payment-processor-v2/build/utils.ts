import { AddressZero } from "@ethersproject/constants";
import * as Sdk from "@reservoir0x/sdk";
import { BaseBuildParams } from "@reservoir0x/sdk/dist/payment-processor-v2/builders/base";

import { redb } from "@/common/db";
import { fromBuffer } from "@/common/utils";
import { config } from "@/config/index";
import * as commonHelpers from "@/orderbook/orders/common/helpers";
import { cosigner } from "@/utils/offchain-cancel";
import * as paymentProcessorV2 from "@/utils/payment-processor-v2";
import { getRoyalties, getRoyaltiesByTokenSet, hasRoyalties } from "@/utils/royalties";

export interface BaseOrderBuildOptions {
  maker: string;
  contract?: string;
  currency?: string;
  weiPrice: string;
  listingTime?: number;
  expirationTime?: number;
  quantity?: number;
  fee?: number[];
  feeRecipient?: string[];
  useOffChainCancellation?: boolean;
  cosigner?: string;
  replaceOrderId?: string;
}

type OrderBuildInfo = {
  params: BaseBuildParams;
};

export const getRoyaltiesToBePaid = async (
  contract: string,
  tokenId?: string,
  tokenSetId?: string
) => {
  const has = async (spec: string) => hasRoyalties(spec, contract);
  const get = async (spec: string) =>
    tokenSetId ? getRoyaltiesByTokenSet(tokenSetId, spec) : getRoyalties(contract, tokenId, spec);

  // Royalty ordering: `eip2981` > `pp-v2-backfill` > `onchain` > `opensea` > `custom`
  return (await has("eip2981"))
    ? await get("eip2981")
    : (await has("pp-v2-backfill"))
    ? await get("pp-v2-backfill")
    : (await has("custom"))
    ? await get("custom")
    : (await has("onchain"))
    ? await get("onchain")
    : await get("opensea");
};

export const getBuildInfo = async (
  options: BaseOrderBuildOptions,
  collection: string,
  side: "sell" | "buy"
): Promise<OrderBuildInfo> => {
  const collectionResult = await redb.oneOrNone(
    `
      SELECT
        contracts.address,
        contracts.kind
      FROM collections
      JOIN contracts
        ON collections.contract = contracts.address
      WHERE collections.id = $/collection/
      LIMIT 1
    `,
    { collection }
  );
  if (!collectionResult) {
    // Skip if we cannot retrieve the collection
    throw new Error("Could not fetch token collection");
  }

  let marketplace = AddressZero;
  let marketplaceFeeNumerator = 0;
  if (options.fee?.length && options.feeRecipient?.length) {
    marketplace = options.feeRecipient[0];
    marketplaceFeeNumerator = options.fee[0];

    if (options.feeRecipient?.length > 1) {
      throw new Error("Multiple fees not supported");
    }
  }

  const contract = fromBuffer(collectionResult.address);
  const nonce = await paymentProcessorV2.getAndIncrementUserNonce(options.maker, marketplace);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const royalties = await getRoyaltiesToBePaid(collection, (options as any).tokenId);

  const buildParams: BaseBuildParams = {
    protocol:
      collectionResult.kind === "erc721"
        ? Sdk.PaymentProcessorV2.Types.OrderProtocols.ERC721_FILL_OR_KILL
        : Sdk.PaymentProcessorV2.Types.OrderProtocols.ERC1155_FILL_PARTIAL,
    marketplace,
    amount: options.quantity ?? "1",
    marketplaceFeeNumerator,
    maxRoyaltyFeeNumerator: royalties.map((r) => r.bps).reduce((a, b) => a + b, 0),
    fallbackRoyaltyRecipient: royalties.length ? royalties[0].recipient : undefined,
    maker: options.maker,
    tokenAddress: contract,
    itemPrice: options.weiPrice,
    nonce,
    expiration: options.expirationTime!,
    paymentMethod:
      options.currency ??
      (side === "sell"
        ? Sdk.Common.Addresses.Native[config.chainId]
        : Sdk.Common.Addresses.WNative[config.chainId]),
    masterNonce: await commonHelpers.getMinNonce("payment-processor-v2", options.maker),
  };

  if (options.useOffChainCancellation) {
    const cosignerAddress = options.cosigner ?? cosigner().address;
    buildParams.cosigner = cosignerAddress.toLowerCase();

    if (options.replaceOrderId) {
      buildParams.nonce = options.replaceOrderId;
    }
  }

  return {
    params: buildParams,
  };
};
