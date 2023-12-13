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

describe("Voting contract", function (accounts) {
  
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

    const VotingContract = await ethers.getContractFactory("VotingContract");

    voting = await VotingContract.deploy();
    await voting.deployed();

    voting.initialize(vault.address, otti.address);

    votingAddress = await voting.address;
    console.log("Voting contract deployed @:" + votingAddress);

    await vault.connect(testOwner).transferOwnershipToContract(votingAddress);
    console.log("Vault change ownerShip with @:" + votingAddress);

    await otti
      .connect(testOwner)
      .transferOwnershipToContract(votingAddress, 1000000);
    console.log("Otti change ownerShip with @:" + votingAddress);

    console.log(
      "Voting contract supply:" + (await otti.balanceOf(votingAddress))
    );

    expect(votingAddress).to.be.not.equal(ethers.ZeroAddress);
    expect(votingAddress).to.match(/0x[0-9a-fA-F]{40}/);
  });

  it("Owner init voting", async function () {
    proposal1 = ethers.utils.formatBytes32String("Mela Melinda");
    proposal2 = ethers.utils.formatBytes32String("Albiccocca Albisole");
    proposal3 = ethers.utils.formatBytes32String("Pera sudtirol");

    await voting
      .connect(testOwner)
      .initVoting(minuteEnding, eurValue, [proposal1, proposal2, proposal3]);
    console.log(await voting.proposals(0));
    console.log(await voting.proposals(1));
    console.log(await voting.proposals(2));
    console.log(await voting.getProposalLength());
  });

  it("Owner try to init voting again", async function () {
    proposal1 = ethers.utils.formatBytes32String("Mela Melinda");
    proposal2 = ethers.utils.formatBytes32String("Albiccocca Albisole");
    proposal3 = ethers.utils.formatBytes32String("Pera sudtirol");

    await expect(
      voting
        .connect(testOwner)
        .initVoting(minuteEnding, eurValue, [proposal1, proposal2, proposal3])
    ).to.be.revertedWithCustomError(voting, "votingNotClosed");
  });

  it("Owner add a proposal", async function () {
    await voting
      .connect(testOwner)
      .addProposal(ethers.utils.formatBytes32String("Limone Siracusa"));
    console.log(await voting.proposals(3));
    console.log(await voting.getProposalLength());
  });

  it("Users votes for a proposal", async function () {
    console.log("Voter1 vote");
    await expect(voting.connect(voter1).vote(0, { value: toWei(1) })).to.emit(
      voting,
      "Vote"
    );

    voter1Value = await otti.balanceOf(voter1.address);
    console.log("Voter1 has otti: " + voter1Value);

    console.log("Voter2 vote");
    await expect(voting.connect(voter2).vote(1, { value: toWei(2) })).to.emit(
      voting,
      "Vote"
    );
    voter2Value = await otti.balanceOf(voter2.address);
    console.log("Voter2 has otti: " + voter2Value);

    console.log("Voter3 vote");
    await expect(voting.connect(voter3).vote(2, { value: toWei(3) })).to.emit(
      voting,
      "Vote"
    );
    voter3Value = await otti.balanceOf(voter3.address);
    console.log("Voter3 has otti: " + voter3Value);
    console.log(
      "Voter1 has " +
        voter1Value +
        ", Voter2 has " +
        voter2Value +
        ", Voter3 has " +
        voter3Value
    );
    fund = await voting.donationAmount();
    console.log("Fund has tokena amount of: " + fund.toString());
  });

  it("User try to vote without fund", async function () {
    await expect(voting.connect(voter5).vote(1)).to.revertedWithCustomError(
      voting,
      "amountZero"
    );
  });

  it("User try to vote for the second time", async function () {
    console.log(await voting.voters(voter1.address).voted);
    await expect(
      voting.connect(voter1).vote(0, { value: toWei(1) })
    ).to.revertedWithCustomError(voting, "voted");
  });

  it("Owner try to close open voting", async function () {
    console.log(BigNumber.from(await voting.votingEndTime()).toString());
    await expect(
      voting.connect(testOwner).closeVoting()
    ).to.be.revertedWithCustomError(voting, "timeNotElapsed");
  });

  it("time fast forward by 5 mintes", async function () {
    await time.increase(6500);
  });

  it("Owner try to withdraw fund when voting is not closed", async function () {
    amount = await voting.donationAmount();
    await expect(
      voting.connect(testOwner).withdrawDonations(testOwner.address, amount)
    ).to.be.revertedWithCustomError(voting, "votingNotClosed");
  });

  it("Owner try to close lapsed voting", async function () {
    console.log(
      "Time that have to lapse for the ending " +
        BigNumber.from(await voting.votingEndTime()).toString()
    );
    await voting.connect(testOwner).closeVoting();
    num = await voting.winningProposalId();
    console.log("Winning proposal have id:" + num.toString());
    console.log(await voting.latestWinner());
  });

  it("User try to vote in lapsed voting", async function () {
    await expect(
      voting.connect(voter4).vote(1, { value: toWei(1) })
    ).to.revertedWithCustomError(voting, "timeElapsed");
  });

  it("Owner try to withdraw more fund", async function () {
    amount = await voting.donationAmount();
    await expect(
      voting
        .connect(testOwner)
        .withdrawDonations(testOwner.address, amount + 100)
    ).to.be.revertedWithCustomError(vault, "notEnoughValue");
  });

  it("Owner try to withdraw fund", async function () {
    amount = await voting.donationAmount();
    console.log("Donation in Vault recorded is:" + amount);
    await voting
      .connect(testOwner)
      .withdrawDonations(testOwner.address, amount);
  });

  it("Owner init for the second time voting system", async function () {
    proposal1 = ethers.utils.formatBytes32String("Mela Melinda");
    proposal2 = ethers.utils.formatBytes32String("Albiccocca Albisole");
    proposal3 = ethers.utils.formatBytes32String("Pera sudtirol");

    await voting
      .connect(testOwner)
      .initVoting(minuteEnding, eurValue, [proposal1, proposal2, proposal3]);
    console.log(await voting.getProposalLength());
  });

  it("Users votes for a proposal for the second time", async function () {
    console.log("Voter1 vote for the second time");
    voter1Value = await otti.balanceOf(voter1.address);
    console.log("Voter1 has otti: " + voter1Value);
    await expect(voting.connect(voter1).vote(0, { value: toWei(1) })).to.emit(
      voting,
      "Vote"
    );
    voter1Value = await otti.balanceOf(voter1.address);
    console.log("Voter1 has otti2: " + voter1Value);
    });

});
