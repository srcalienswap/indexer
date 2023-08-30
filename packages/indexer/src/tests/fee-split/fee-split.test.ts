import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

import { getSplitsAddress } from "../../utils/fee-split";
import { jest, describe, it } from "@jest/globals";

jest.setTimeout(1000 * 1000);

describe("Fee Split", () => {
  it("save-split-fee", async () => {
    await getSplitsAddress("test", [
      {
        bps: 300,
        recipient: "0x860a80d33E85e97888F1f0C75c6e5BBD60b48DA9",
      },
      {
        bps: 200,
        recipient: "0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5",
      },
    ]);
  });
});
