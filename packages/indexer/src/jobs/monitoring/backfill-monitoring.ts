import cron from "node-cron";
import { config } from "@/config/index";
import { logger } from "@/common/logger";
import { idb } from "@/common/db";

if (
  config.doBackgroundWork &&
  [43114, 59144, 888888888, 84532, 168587773, 70700, 81457].includes(config.chainId)
) {
  cron.schedule("*/5 * * * *", async () => {
    // Log backfill progress for new chains
    const result = await idb.oneOrNone(
      `
        SELECT MAX(block) AS currentBlock,
        MIN(block) AS earliestBlock
        FROM nft_transfer_events
      `
    );

    logger.info("backfill-progress", JSON.stringify(result));
  });
}
