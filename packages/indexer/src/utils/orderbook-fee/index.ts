import { AddressZero } from "@ethersproject/constants";
import { OrderKind } from "@/orderbook/orders";
import { getSplitsAddress } from "@/utils/fee-split";
import { Royalty } from "../royalties";

export const FEE_BPS = 0;
export const FEE_RECIPIENT = AddressZero;

export const attachOrderbookFee = async (
  params: {
    fee?: string[];
    feeRecipient?: string[];
    orderKind: OrderKind;
    orderbook: string;
    currency?: string;
  },
  apiKey?: string
) => {
  // Only native orders
  if (params.orderbook != "reservoir") {
    return;
  }

  // Only certain order kinds
  const matchingOrderKinds: OrderKind[] = ["payment-processor-v2", "seaport-v1.5", "seaport-v1.6"];
  if (!matchingOrderKinds.includes(params.orderKind)) {
    return;
  }

  const singleFeeOrderKinds = ["payment-processor-v2"];
  if (FEE_BPS > 0) {
    params.fee = params.fee ?? [];
    params.feeRecipient = params.feeRecipient ?? [];

    // Skip single fee marketplaces for now
    if (params.fee.length >= 1 && singleFeeOrderKinds.includes(params.orderKind)) {
      if (apiKey) {
        const allFees: Royalty[] = [];
        params.fee.forEach((fee, index) => {
          if (params.feeRecipient && params.feeRecipient[index]) {
            allFees.push({
              bps: Number(fee),
              recipient: params.feeRecipient[index],
            });
          }
        });

        const newFeeBps = allFees.reduce((total, item) => total + item.bps, 0) + FEE_BPS;
        const newRecipient = await getSplitsAddress(
          apiKey,
          allFees,
          {
            bps: FEE_BPS,
            recipient: FEE_RECIPIENT,
          },
          params.currency
        );

        if (newRecipient) {
          // Override with the split address
          params.feeRecipient = [newRecipient.address];
          params.fee = [String(newFeeBps)];
        }
      }
      return;
    }

    params.fee.push(String(FEE_BPS));
    params.feeRecipient.push(FEE_RECIPIENT);
  }
};
