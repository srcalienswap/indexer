import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import * as Sdk from "@reservoir0x/sdk";
import { idb, redb } from "@/common/db";
import { baseProvider } from "@/common/provider";
import { fromBuffer, toBuffer, bn } from "@/common/utils";
import { config } from "@/config/index";
import { Royalty } from "../royalties";
import { keccak256 } from "@ethersproject/solidity";

type SplitConfig = {
  fees: Royalty[];
  distributorFee: number;
};

export async function getSplitsAddress(
  apiKey: string,
  originalFee: Royalty,
  orderBookFee: Royalty,
  currency?: string
) {
  try {
    const totalBps = originalFee.bps + orderBookFee.bps;
    const newFees: Royalty[] = [];
    newFees.push({
      ...orderBookFee,
      bps: Math.round((orderBookFee.bps / totalBps) * 1e6),
    });

    newFees.push({
      ...originalFee,
      bps: Math.round((originalFee.bps / totalBps) * 1e6),
    });

    // Sort by account
    newFees.sort((a, b) => {
      return bn(a.recipient).gt(bn(b.recipient)) ? 0 : -1;
    });

    const distributorFee = 0;
    const splitConfig = {
      fees: newFees,
      distributorFee,
    };

    const configHash = getSplitConfigHash(splitConfig);
    const exist = await getSplitConfigFromDB(configHash);
    if (exist && currency) {
      // tracking currency used
      const isNewCurrency = !exist.tokens.includes(currency);
      if (isNewCurrency) {
        await updateSplitTokens(exist.config, [...exist.tokens, currency]);
      }
      return exist;
    }

    const zeroSplit = new Contract(
      Sdk.ZeroSplits.Addresses.SplitMain[config.chainId],
      new Interface([
        `function predictImmutableSplitAddress(address[] calldata accounts, uint32[] calldata percentAllocations, uint32 distributorFee) external view returns (address split)`,
      ]),
      baseProvider
    );

    const mergedAddress = (
      await zeroSplit.predictImmutableSplitAddress(
        newFees.map((c) => c.recipient),
        newFees.map((c) => c.bps),
        distributorFee
      )
    ).toLowerCase();
    await saveSplitFee(mergedAddress, apiKey, splitConfig, currency ? [currency] : []);
    return {
      address: mergedAddress,
      config: splitConfig,
      tokens: [currency],
    };
  } catch (error) {
    // Skip errors
  }
  return undefined;
}

export const getSplitConfigFromDB = async (hash: string) => {
  const result = await redb.oneOrNone(
    `
      SELECT
        zerosplits_fees.*
      FROM zerosplits_fees
      WHERE zerosplits_fees.hash = $/hash/
    `,
    { hash }
  );
  if (!result) {
    return undefined;
  }

  return {
    address: fromBuffer(result.address),
    config: result.config as SplitConfig,
    tokens: result.tokens as string[],
  };
};

function getSplitConfigHash(config: SplitConfig) {
  return keccak256(["string"], [JSON.stringify(config)]);
}

export const saveSplitFee = async (
  splitAddress: string,
  apiKey: string,
  config: SplitConfig,
  tokens: string[]
) => {
  const hash = getSplitConfigHash(config);
  await idb.none(
    `
      INSERT INTO zerosplits_fees(
        hash,
        address,
        api_key,
        config,
        tokens
      ) VALUES (
        $/hash/,
        $/splitAddress/,
        $/apiKey/,
        $/config:json/,
        $/tokens:json/
      ) ON CONFLICT DO NOTHING
    `,
    {
      hash,
      splitAddress: toBuffer(splitAddress),
      apiKey,
      config,
      tokens,
    }
  );
};

export const updateSplitTokens = async (config: SplitConfig, tokens: string[]) => {
  const hash = getSplitConfigHash(config);
  await idb.none(
    `
      UPDATE zerosplits_fees
        SET tokens = $/tokens:json/
      WHERE hash = $/hash/
    `,
    {
      hash,
      tokens,
    }
  );
};
