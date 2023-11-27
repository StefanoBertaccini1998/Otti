const { expect } = require("chai");
const {
  BN,
  constants,
  expectEvent,
  expectRevert,
  time,
} = require("@openzeppelin/test-helpers");

const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const Notarize = artifacts.require("Notarize");

const { ZERO_ADDRESS } = constants;

const fromWei = (x) => web3.utils.fromWei(x.toString());
const toWei = (x) => web3.utils.toWei(x.toString());

const HashWriter =
  "0x9bd7b39e404ec8163ddb5278c0044198ca50a2bf864985cbc93f934a5afed5d6";
const AdminRole =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const hash1 =
  "0x8613911112c3d65a9c52f1316fbd18f56eb43b7c0f68f49f6694d9b561bfeaf7";
const hash2 =
  "0x5b5aa7db42b8a6bccffceb0096f32de6dcb30ed454deb514de75c0c5ecc1370c";

contract("Notarization Test", function (accounts) {
  const Admin = accounts[0];
  const HashWriter1 = accounts[1];

  it("retrieve contract", async function () {
    NotarizeContract = await Notarize.deployed();
    expect(NotarizeContract.address).to.be.not.equal(ZERO_ADDRESS);
    expect(NotarizeContract.address).to.match(/0x[0-9a-fA-F]{40}/);
  });

  it("Contract admin assign hash writer role to account", async function () {
    await expectRevert(
      NotarizeContract.setHashWriterRole(HashWriter1, { from: HashWriter1 }),
      "AccessControl: account " +
        HashWriter1.toLowerCase() +
        " is missing role " +
        AdminRole
    );
    await NotarizeContract.setHashWriterRole(HashWriter1, {
      from: Admin,
    });
    expect(await NotarizeContract.hasRole(HashWriter, HashWriter1)).to.be.true;
  });

  it("A hash writer address cannot assign the same role to another address", async function () {
    await expectRevert(
      NotarizeContract.setHashWriterRole(HashWriter1, { from: HashWriter1 }),
      "AccessControl: account " +
        HashWriter1.toLowerCase() +
        " is missing role " +
        AdminRole
    );
  });

  it("A admin address cannot notarize a document", async function () {
    await expectRevert(
      NotarizeContract.addNewDocument("Example", hash1, { from: Admin }),
      "AccessControl: account " +
        Admin.toLowerCase() +
        " is missing role " +
        HashWriter
    );
  });

  it("A hash writer address can notarize a document and get notarized doc back", async function () {
    await NotarizeContract.addNewDocument("example", hash1, {
      from: HashWriter1,
    });
    tot = await NotarizeContract.getDocsCount();
    console.log("Total document registered: " + tot.toString());
    result = await NotarizeContract.getDocInfo(tot - 1);
    console.log(result[0].toString() + ":" + result[1]);
  });

  it("A hash writer address cannot notarize a document twice", async function () {
    await expectRevert(
      NotarizeContract.addNewDocument("example2", hash1, { from: HashWriter1 }),
      "Hash already notarized"
    );
    tot = await NotarizeContract.getDocsCount();
    console.log("Total document registered: " + tot.toString());
  });

  it("A hash writer address can notarize another document and get notarized doc back", async function () {
    await NotarizeContract.addNewDocument("test", hash2, {
      from: HashWriter1,
    });
    tot = await NotarizeContract.getDocsCount();
    console.log("Total document registered: " + tot.toString());
    result = await NotarizeContract.getDocInfo(tot - 1);
    console.log(result[0].toString() + ":" + result[1]);
  });

  it("Is document already registered", async function () {
    expect(await NotarizeContract.getRegisteredHash(hash1)).to.be.true;
    const hash1Corrupted =
      "0xa2cbe6a9b5c75f04196a2d044fd62056a455feb6204af1803456be72c2ce0523";
    expect(
      await NotarizeContract.getRegisteredHash(hash1Corrupted)
    ).to.be.false;
  });
});
