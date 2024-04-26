import { ethers } from "hardhat";
import { ethers as _ethers } from "ethers";
import fs from 'fs';
import verify from '../utils/verify';

let contractName: string;
let contractFactory: _ethers.ContractFactory;
let contract: _ethers.Contract;
let args: any[] = [];

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", (await deployer.getBalance()).toString());

    contractName = "ReservoirV6_0_1";
    // contractFactory = await ethers.getContractFactory(contractName);
    // args = [];
    // const ReservoirV6_0_1 = await contractFactory.deploy();
    // await ReservoirV6_0_1.deployed();
    // const reservoirAddress = ReservoirV6_0_1.address;
    const reservoirAddress = "0x2fFf099a564a9FaE2fD5863C606640928Cd44813";

    console.log(`${contractName} address:`, reservoirAddress);
    fs.writeFileSync("deployed-contracts.txt", `${contractName}: ${reservoirAddress}\n`);
    // await verify(reservoirAddress, args);

    // const conduitControllerAddress = "0xF4DF163BD47de2F1F1694Fa3e2958b4adA9E5403"; // testnet
    // const conduitControllerAddress = "0x2eB4Ef12f7d0050db8aC54fb99BCA24f0f9D8E44"; // mainnet
    const conduitControllerAddress = "0x00000000F9490004C11Cef243f5400493c00Ad63"; // mainnet (created by create2)

    contractName = "ReservoirApprovalProxy";
    contractFactory = await ethers.getContractFactory(contractName);
    args = [conduitControllerAddress, reservoirAddress];
    const reservoirApprovalProxy = await contractFactory.deploy(...args);
    await reservoirApprovalProxy.deployed();
    const reservoirApprovalProxyAddress = reservoirApprovalProxy.address;

    console.log(`${contractName} address:`, reservoirApprovalProxyAddress);
    fs.appendFileSync("deployed-contracts.txt", `${contractName}: ${reservoirApprovalProxyAddress}\n`);
    await verify(reservoirApprovalProxyAddress, args);

    // const alienswapAddress = "0xeCc35Cd2D2A18e1F5224bC243E89d08714Ee9918"; // testnet
    // const alienswapAddress = "0xa916124D8501431b250147AF769BE4a418b46668"; // mainnet
    const alienswapAddress = "0x156ADd7faf8391dcbCc904B0EbA0e8BF518265ba"; // mainnet

    contractName = "AlienswapV2Module";
    contractFactory = await ethers.getContractFactory(contractName);
    args = [deployer.address, reservoirAddress, alienswapAddress];
    const alienswapV2Module = await contractFactory.deploy(...args);
    await alienswapV2Module.deployed();
    const alienswapV2ModuleAddress = alienswapV2Module.address;

    console.log(`${contractName} address:`, alienswapV2ModuleAddress)
    fs.appendFileSync("deployed-contracts.txt", `${contractName}: ${alienswapV2ModuleAddress}\n`);
    await verify(alienswapV2ModuleAddress, args);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });