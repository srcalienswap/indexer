import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import * as Sdk from "@reservoir0x/sdk";
import { idb, redb } from "@/common/db";
import { baseProvider } from "@/common/provider";
import { fromBuffer, toBuffer } from "@/common/utils";
import { config } from "@/config/index";
import { Royalty } from "../royalties";
import { keccak256 } from "@ethersproject/solidity";

type SplitConfig = {
  fees: Royalty[];
  distributorFee: number;
};

export async function getSplitsAddress(apiKey: string, fees: Royalty[], platformFeePercent = 0.3) {
  try {
    const totalBps = fees.reduce((total, item) => total + item.bps, 0);
    const feeCutPercent = totalBps * platformFeePercent;
    const newTotalBps = totalBps - feeCutPercent;

    const newFees = fees.map((c) => {
      c.bps = Math.floor(((newTotalBps * (c.bps / totalBps)) / totalBps) * 100) * 10000;
      return c;
    });

    newFees.push({
      bps: (feeCutPercent / totalBps) * 100 * 10000,
      recipient: config.tradingFee,
    });

    const distributorFee = 0;
    const splitConfig = {
      fees: newFees,
      distributorFee,
    };

    const configHash = getSplitConfigHash(splitConfig);
    const exist = await getSplitConfigFromDB(configHash);
    if (exist) {
      return exist.address;
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

    await saveSplitFee(mergedAddress, apiKey, splitConfig);
    return mergedAddress;
  } catch {
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
  };
};

function getSplitConfigHash(config: SplitConfig) {
  return keccak256(["string"], [JSON.stringify(config)]);
}

export const saveSplitFee = async (splitAddress: string, apiKey: string, config: SplitConfig) => {
  const hash = getSplitConfigHash(config);
  await idb.none(
    `
      INSERT INTO zerosplits_fees(
        hash,
        address,
        api_key,
        config
      ) VALUES (
        $/hash/,
        $/splitAddress/,
        $/apiKey/,
        $/config:json/
      ) ON CONFLICT DO NOTHING
    `,
    {
      hash,
      splitAddress: toBuffer(splitAddress),
      apiKey,
      config,
    }
  );
};
