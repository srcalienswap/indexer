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

  // const reservoirAddress = await deploy("ReservoirV6_0_1", []);
  // fs.writeFileSync("reservoir-contracts.txt", `ReservoirV6_0_1: ${reservoirAddress}\n`);

  // const conduitControllerAddress = "0xDccEF9EC0879c951a461a3F4ac293aad39FFbAD3"

  // const reservoirApprovalProxyAddress = await deploy("ReservoirApprovalProxy", [conduitControllerAddress, reservoirAddress])
  // fs.appendFileSync("reservoir-contracts.txt", `ReservoirApprovalProxy: ${reservoirApprovalProxyAddress}\n`);

  // const create3FactoryAddress = await deploy("Create3Factory", []);
  // fs.appendFileSync("reservoir-contracts.txt", `Create3Factory: ${create3FactoryAddress}\n`);

  const router = "0xAa44E964Ad394501ab05779ae4b662a11bBd8Ea3" // reservoirAddress 
  const exchange = "0xe480aefB2594F888d7B343B524542b9a7C06ecd6" // alienswapAddress
  const alienswapModuleAddress = await deploy("AlienswapV2Module", [DEPLOYER, router, exchange])
  fs.appendFileSync("reservoir-contracts.txt", `AlienswapV2Module: ${alienswapModuleAddress}\n`);

};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });