const { BigNumber, constants } = require("ethers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const { expect } = require("chai");

const fromWei = (x) => web3.utils.fromWei(BigNumber.from(x).toString());
const toWei = (x) => web3.utils.toWei(BigNumber.from(x).toString());

require("@nomicfoundation/hardhat-chai-matchers");

const { ethers, upgrades } = require("hardhat");

const minuteEnding = 6000;
const eurValue = 100;
describe('VotingContract', function () {


    it("system setup", async function () {
        [testOwner, voter1, voter2, voter3, voter4, voter5] =
        await ethers.getSigners();

        const Vault = await ethers.getContractFactory("DonationVault");
        vault = await Vault.deploy();

        await vault.deployed();

        expect(vault.address).to.be.not.equal(ethers.ZeroAddress);
        expect(vault.address).to.match(/0x[0-9a-fA-F]{40}/);

        const Otti = await ethers.getContractFactory("Otti");

        otti = await Otti.deploy("Otti", "Oti");

        await otti.deployed();

        expect(otti.address).to.be.not.equal(ethers.ZeroAddress);
        expect(otti.address).to.match(/0x[0-9a-fA-F]{40}/);

        console.log("Otti contract supply:" + (await otti.totalSupply()));
        console.log("Owner supply:" + (await otti.balanceOf(testOwner.address)));

        VotingContract = await ethers.getContractFactory('VotingContract');
        votingContract = await upgrades.deployProxy(VotingContract, [vault.address, otti.address]);
        await votingContract.deployed();
        votingAddress = votingContract.address;
        await vault.connect(testOwner).transferOwnershipToContract(votingAddress);
        console.log("Vault change ownerShip with @:" + votingAddress);

        await otti
        .connect(testOwner)
        .transferOwnershipToContract(votingAddress, 1000000);
        console.log("Otti change ownerShip with @:" + votingAddress);

    });

    it("Owner init voting", async function () {
        proposal1 = ethers.utils.formatBytes32String("Mela Melinda");
        proposal2 = ethers.utils.formatBytes32String("Albiccocca Albisole");
        proposal3 = ethers.utils.formatBytes32String("Pera sudtirol");
    
        await votingContract
          .connect(testOwner)
          .initVoting(minuteEnding, eurValue, [proposal1, proposal2, proposal3]);
        console.log(await votingContract.proposals(0));
        console.log(await votingContract.proposals(1));
        console.log(await votingContract.proposals(2));
        console.log(await votingContract.getProposalLength());
      });

    // Add more test cases...

    it('should upgrade to VotingContractV2', async function () {
        const VotingContractV2 = await ethers.getContractFactory('VotingContract');
        const upgradedLogicContract = await upgrades.upgradeProxy(votingContract.address, VotingContractV2);
        expect(upgradedLogicContract.address).to.equal(votingContract.address);
    });
});
