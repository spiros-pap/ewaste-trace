import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Registry = await ethers.getContractFactory("EwasteRegistry");
  const registry = await Registry.deploy(deployer.address);
  await registry.waitForDeployment();

  console.log("EwasteRegistry deployed at:", await registry.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
