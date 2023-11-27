const { BigNumber, constants } = require("ethers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const { expect } = require("chai");

const fromWei = (x) => web3.utils.fromWei(BigNumber.from(x).toString());
const toWei = (x) => web3.utils.toWei(BigNumber.from(x).toString());

require("@nomicfoundation/hardhat-chai-matchers");

describe("Ballot", async function (accounts) {
  it("system setup", async function () {
    [testOwner, voter1, voter2, voter3, voter4, voter5] =
      await ethers.getSigners();

    proposal1 = ethers.encodeBytes32String("Proposal1");
    proposal2 = ethers.encodeBytes32String("Proposal2");
    proposal3 = ethers.encodeBytes32String("Proposal3");

    const Ballot = await ethers.getContractFactory("Ballot");
    ballotContract = await Ballot.deploy([proposal1, proposal2, proposal3]);
    await ballotContract.waitForDeployment();
    ballotAddress = await ballotContract.getAddress();
    console.log("Ballot contract deployed @:" + ballotAddress);
    expect(ballotAddress).to.be.not.equal(ethers.ZeroAddress);
    expect(ballotAddress).to.match(/0x[0-9a-fA-F]{40}/);
    console.log("chairPerson: " + (await ballotContract.chairPerson()));
    console.log(await ballotContract.proposals(0));
    console.log(await ballotContract.proposals(1));
    console.log(await ballotContract.proposals(2));
  });

  it("give rights toi voters", async function () {
    await ballotContract.giveRightToVote(voter1.address);
    await ballotContract.giveRightToVote(voter2.address);
    await ballotContract.giveRightToVote(voter3.address);
    await ballotContract.giveRightToVote(voter4.address);
    await ballotContract.giveRightToVote(voter5.address);

    await expect(
      ballotContract.giveRightToVote(voter5.address)
    ).to.be.revertedWithoutReason();
  });

  it("some voters can delegate other voters", async function () {
    await ballotContract.connect(voter2).delegate(voter1);
    await ballotContract.connect(voter5).delegate(voter3);

    console.log(await ballotContract.voters(voter1.address));
    console.log(await ballotContract.voters(voter2.address));
  });

  it("voting procedures", async function () {
    await expect(
      ballotContract.connect(voter1).vote(4)
    ).to.be.revertedWithPanic();

    await ballotContract.connect(voter1).vote(0);
    await expect(ballotContract.connect(voter2).vote(1)).to.be.revertedWith(
      "You already voted"
    );
    await ballotContract.connect(voter3).vote(2);
    await ballotContract.connect(voter4).vote(0);
    await expect(ballotContract.connect(voter5).vote(2)).to.be.revertedWith(
      "You already voted"
    );
  });

  it("check vote count after voting", async function () {
    console.log(await ballotContract.winnerName());
    winIdx = await ballotContract.winningProposal();
    console.log(await ballotContract.proposals(winIdx));
  });
});
