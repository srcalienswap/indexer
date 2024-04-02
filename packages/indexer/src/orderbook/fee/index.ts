import { config } from "@/config/index";
import { OrderKind } from "@/orderbook/orders";
import { getSplitsAddress } from "@/utils/fee-split";

export async function attachOrderbookFee(
  params: {
    fee?: string[];
    feeRecipient?: string[];
    orderKind: OrderKind;
    orderbook: string;
    currency?: string;
  },
  apiKey?: string
) {
  if (params.orderbook != "reservoir") {
    return;
  }

  const singleFeeOrderKinds = ["payment-processor", "payment-processor-v2"];
  if (config.orderbookFeeRecipient) {
    params.fee = params.fee ?? [];
    params.feeRecipient = params.feeRecipient ?? [];
    // Skip single fee marketplaces for now
    if (params.fee.length >= 1 && singleFeeOrderKinds.includes(params.orderKind)) {
      if (apiKey && params.fee.length === 1) {
        const newFeeBps = params.fee[0] + config.defaultOrderbookFeeBps;
        const newRecipient = await getSplitsAddress(
          apiKey,
          {
            bps: Number(params.fee[0]),
            recipient: params.feeRecipient[0],
          },
          {
            bps: Number(config.defaultOrderbookFeeBps),
            recipient: config.orderbookFeeRecipient,
          },
          params.currency
        );

        if (newRecipient) {
          // Override with the split address
          params.feeRecipient[0] = newRecipient.address;
          params.fee[0] = newFeeBps;
        }
      } else {
        return;
      }
    }

    params.fee.push(config.defaultOrderbookFeeBps);
    params.feeRecipient.push(config.orderbookFeeRecipient);
  }
}
