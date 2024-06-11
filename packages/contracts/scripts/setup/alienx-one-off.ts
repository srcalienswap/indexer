import { ethers } from "hardhat";
import { ethers as _ethers } from "ethers";
import fs from 'fs';
import verify from '../utils/verify';
import conduitControllerArtifacts from "../abi/ConduitController.json";

let contractName: string;
let contractFactory: _ethers.ContractFactory;
let contract: _ethers.Contract;
let args: any[] = [];

async function main() {
    console.log("start deploy")
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
    const reservoirAddress = "0xCCc7e6b7308688Ec229dd504266a7f628AA0A9de";
    console.log(`${contractName} address:`, reservoirAddress);
    fs.writeFileSync("deployed-contracts.txt", `${contractName}: ${reservoirAddress}\n`);
    // await verify(reservoirAddress, args);

    const conduitControllerAddress = "0x00000000F9490004C11Cef243f5400493c00Ad63"; // alienx chain

    contractName = "ReservoirApprovalProxy";
    // contractFactory = await ethers.getContractFactory(contractName);
    // args = [conduitControllerAddress, reservoirAddress];
    // const reservoirApprovalProxy = await contractFactory.deploy(...args);
    // await reservoirApprovalProxy.deployed();
    // const reservoirApprovalProxyAddress = reservoirApprovalProxy.address;
    const reservoirApprovalProxyAddress = "0x243bABdD53eBca4835dB7716DA675c011d265c69";
    console.log(`${contractName} address:`, reservoirApprovalProxyAddress);
    fs.appendFileSync("deployed-contracts.txt", `${contractName}: ${reservoirApprovalProxyAddress}\n`);
    // await verify(reservoirApprovalProxyAdds, args);res

    const alienswapAddress = "0x0568faA5d870089571192309d3033eB5FD89EB36"; // alienx chain

    contractName = "AlienswapV2Module";
    contractFactory = await ethers.getContractFactory(contractName);
    args = [deployer.address, reservoirAddress, alienswapAddress];
    const alienswapV2Module = await contractFactory.deploy(...args);
    await alienswapV2Module.deployed();
    const alienswapV2ModuleAddress = alienswapV2Module.address;

    console.log(`${contractName} address:`, alienswapV2ModuleAddress)
    fs.appendFileSync("deployed-contracts.txt", `${contractName}: ${alienswapV2ModuleAddress}\n`);
    await verify(alienswapV2ModuleAddress, args);

    // open channel on conduit controller for ReservoirApprovalProxy
    const conduitAddress = "0x029EA8CC764F0cfA943D304F7539a04505DB2A61"; // alienx chain
    const conduitController = new ethers.Contract(conduitControllerAddress, conduitControllerArtifacts.abi, deployer);

    const channelsBefore = await conduitController.getChannels(conduitAddress)
    console.log(`channelsBefore: ${channelsBefore}`)

    await conduitController.updateChannel(conduitAddress, reservoirApprovalProxyAddress, true);
    // await conduitController.updateChannel(conduitAddress, "0x3cB4Ce90Cf0cD4737e1075BeC5640671782efF0A", true);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const channelsAfter = await conduitController.getChannels(conduitAddress);
    console.log(`channelsAfter: ${channelsAfter}`)

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
