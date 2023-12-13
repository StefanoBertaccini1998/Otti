// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, upgrades } = require("hardhat");

async function main() {
  const UPGRADE = false;

  // Replace with the actual logic contract address
  const logicContractAddress = "";

  if(!UPGRADE){
    //Deploy Vault
    const Vault = await ethers.getContractFactory("DonationVault");
    vault = await Vault.deploy();

    await vault.deployed();

    //Deploy Otti token
    const Otti = await ethers.getContractFactory("Otti");

    otti = await Otti.deploy("Otti", "Oti");

    await otti.deployed();

    const VotingContract = await ethers.getContractFactory("VotingContract");

    // Deploy the logic contract
    const logicContract = await upgrades.deployProxy(VotingContract, [/* initialize parameters */]);
    await logicContract.deployed();

    console.log("Logic Contract address:", logicContract.address);
    
  } else {

    const VotingContract = await ethers.getContractFactory("VotingContract");

    // Deploy the upgraded logic contract
    const upgradedLogicContract = await upgrades.upgradeProxy(logicContractAddress, VotingContract);
    console.log("Upgraded Logic Contract address:", upgradedLogicContract.address);
  }
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
