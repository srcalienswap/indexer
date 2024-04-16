/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import * as Sdk from "@reservoir0x/sdk/src";
import hre, { ethers } from "hardhat";
import { Wallet } from "zksync-web3";
import fs from "fs";

export const DEPLOYER = "0xaE627F4CEc0616C3267DFb7D9242E9Ca035B4844";

const main = async () => {
  const chainId = await ethers.provider.getNetwork().then((n) => n.chainId);

  const wallet = new Wallet(process.env.DEPLOYER_PK!);
  const deployer = new Deployer(hre, wallet);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deploy = async (contractName: string, args?: any[]) => {
    const c = await deployer
      .loadArtifact(contractName)
      .then((artifact) => deployer.deploy(artifact, args));
    console.log(`${contractName} deployed to address ${c.address.toLowerCase()}`);

    return c.address;
  };

  const reservoirAddress = "0xd4b15253ad19a9ee0d4280606aa862acc73de7cd";
  fs.writeFileSync("reservoir-testnet-contracts.txt", `ReservoirV6_0_1: ${reservoirAddress}\n`);

  const conduitControllerAddress = "0xDccEF9EC0879c951a461a3F4ac293aad39FFbAD3";

  const reservoirApprovalProxyAddress = "0x8f92bcbfb436da339660fd78b02289d41191bf11";
  fs.appendFileSync("reservoir-testnet-contracts.txt", `ReservoirApprovalProxy: ${reservoirApprovalProxyAddress}\n`);

  const exchange = "0xc30be300542FA1E9E1965A4077A9Dd0782481773" // alienswap contract
  const alienswapModuleAddress = await deploy("AlienswapV2Module", [DEPLOYER, reservoirAddress, exchange])
  fs.appendFileSync("reservoir-testnet-contracts.txt", `AlienswapV2Module: ${alienswapModuleAddress}\n`);

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });