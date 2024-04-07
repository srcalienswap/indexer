import { getCreate2Address } from "@ethersproject/address";
import { keccak256 } from "@ethersproject/solidity";
import * as Sdk from "@reservoir0x/sdk";

import { idb, pgp, redb } from "@/common/db";
import { fromBuffer, toBuffer, bn } from "@/common/utils";
import { config } from "@/config/index";

type Fee = {
  recipient: string;
  bps: number;
};

type RequiredPaymentSplitData = {
  address: string;
  apiKey: string;
  fees: Fee[];
};

type OptionalPaymentSplitData = {
  isDeployed?: boolean;
  lastDistributionTime?: number;
  createdAt?: number;
  updatedAt?: number;
};

type PaymentSplit = RequiredPaymentSplitData & OptionalPaymentSplitData;

const MAX_BPS = 1e6;

export const supportsPaymentSplits = () =>
  Boolean(Sdk.ZeroExSplits.Addresses.SplitMain[config.chainId]);

export const generatePaymentSplit = async (apiKey: string, originalFee: Fee, reservoirFee: Fee) => {
  try {
    const totalBps = originalFee.bps + reservoirFee.bps;

    // Adjust the total fee percentages to relative fee percentages needed for payment splits
    const splitFees: Fee[] = [];
    for (const fee of [originalFee, reservoirFee]) {
      splitFees.push({
        recipient: fee.recipient,
        bps: Math.round((originalFee.bps / totalBps) * MAX_BPS),
      });
    }

    // Fix any precision issues by granting the recipient of `originalFee` additional bps units
    const totalSplitFeesBps = splitFees.map((f) => f.bps).reduce((a, b) => a + b);
    if (totalSplitFeesBps < MAX_BPS) {
      splitFees[0].bps += MAX_BPS - totalSplitFeesBps;
    }

    // Sort by recipient
    splitFees.sort((a, b) => (bn(a.recipient).gt(bn(b.recipient)) ? 0 : -1));

    const splitHash = keccak256(
      ["address[]", "uint32[]", "uint32"],
      [splitFees.map((f) => f.recipient), splitFees.map((f) => f.bps), 0]
    );
    const splitAddress = getCreate2Address(
      Sdk.ZeroExSplits.Addresses.SplitMain[config.chainId],
      splitHash,
      keccak256(
        ["bytes"],
        [
          // TODO: We should make sure the init code is the same across all supported chains (non-EVM compatible chains like zkSync might be problematic)
          "0x3d605d80600a3d3981f336603057343d52307f830d2d700a97af574b186c80d40429385d24241565b08a7c559ba283a964d9b160203da23d3df35b3d3d3d3d363d3d37363d73d94c0ce4f8eefa4ebf44bf6665688edeef213b335af43d3d93803e605b57fd5bf3",
        ]
      )
    );

    const existingSplit = await getPaymentSplitFromDb(splitAddress);
    if (!existingSplit) {
      await savePaymentSplit({
        address: splitAddress,
        apiKey,
        fees: splitFees,
      });
    }

    return existingSplit;
  } catch {
    // Skip errors
  }

  return undefined;
};

export const getPaymentSplitFromDb = async (address: string): Promise<PaymentSplit | undefined> => {
  const results = await redb.manyOrNone(
    `
      SELECT
        payment_splits.address,
        payment_splits.api_key,
        payment_splits.is_deployed,
        payment_splits_recipients.recipient,
        payment_splits_recipients.amount_bps,
        floor(extract(epoch FROM payment_splits.last_distribution_time) / 1000) AS last_distribution_time,
        floor(extract(epoch FROM payment_splits.created_at) / 1000) AS created_at,
        floor(extract(epoch FROM payment_splits.updated_at) / 1000) AS updated_at
      FROM payment_splits
      JOIN payment_splits_recipients
        ON payment_splits.address = payment_splits_recipients.payment_split_address
      WHERE payment_splits.address = $/address/
    `,
    { address: toBuffer(address) }
  );
  if (!results.length) {
    return undefined;
  }

  return {
    address,
    fees: results.map((r) => ({
      recipient: fromBuffer(r.recipient),
      bps: r.amount_bps,
    })),
    apiKey: results[0].api_key,
    isDeployed: results[0].is_deployed,
    lastDistributionTime: results[0].last_distribution_time,
    createdAt: results[0].created_at,
    updatedAt: results[0].updated_at,
  };
};

export const savePaymentSplit = async (paymentSplit: RequiredPaymentSplitData) => {
  const columns = new pgp.helpers.ColumnSet(["payment_split_address", "recipient", "amount_bps"], {
    table: "payment_splits_recipients",
  });

  await idb.none(
    `
      INSERT INTO payment_splits(
        address,
        api_key
      ) VALUES (
        $/address/,
        $/apiKey/
      ) ON CONFLICT DO NOTHING;
      ${
        pgp.helpers.insert(
          paymentSplit.fees.map((f) => ({
            payment_split_address: toBuffer(paymentSplit.address),
            recipient: toBuffer(f.recipient),
            amount_bps: f.bps,
          })),
          columns
        ) + " ON CONFLICT DO NOTHING"
      }
    `,
    {
      address: toBuffer(paymentSplit.address),
      apiKey: paymentSplit.apiKey,
    }
  );
};
