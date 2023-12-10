const { BigNumber, constants } = require("ethers");
const { AddressZero, EtherSymbol } = constants;

const { expect } = require("chai");
const { ethers } = require("hardhat");

require("@nomicfoundation/hardhat-chai-matchers");
let certifcateNFT, owner, other1, other2, event, authLab, authLab2;

product1Hash = "";

describe("TokenNFT test", function (accounts) {
  //TODO change uri
  baseUri = "ipfs://Qmb27L7Zr1853xV3rC7Z9mSQ1KTF7NJQnEDdinLNPKH71V/";

  it("NFT Contract setup", async function () {
    const AnalyticalCertificateNFT = await ethers.getContractFactory(
      "AnalyticalCertificateNFT"
    );
    [owner, other1, other2, authLab, authLab2] = await ethers.getSigners();

    certifcateNFT = await AnalyticalCertificateNFT.deploy();

    expect(certifcateNFT.address).to.be.not.equal(AddressZero);
    expect(certifcateNFT.address).to.match(/0x[0-9a-fA-F]{40}/);
  });

  it("Owner authorize one lab to mint NFT", async function () {
    await certifcateNFT.connect(owner).addAuthorizedLab(authLab.address);
  });

  it("Not a Owner try to authorize one lab to mint NFT", async function () {
    await expect(
      certifcateNFT.connect(other1).addAuthorizedLab(authLab.address)
    ).to.be.revertedWith(
      "AccessControl: account " +
        other1.address.toLowerCase() +
        " is missing role " +
        AdminRole
    );
  });
  it("Normal users can NOT mint tokens", async function () {
    await expect(
      certifcateNFT.connect(other1).mint(other1.address, 1, 1, 0x111123)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Lab can mint 1 token with id=1", async function () {
    tx = await certifcateNFT.connect(authLab).newProductAnalysis(product1Hash);
    //get event
    const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
    transferEventInterface = new ethers.utils.Interface([
      "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
    ]);
    const data = receipt.logs[0].data;
    const topics = receipt.logs[0].topics;
    event = transferEventInterface.decodeEventLog(
      "TransferSingle",
      data,
      topics
    );
    expect(event.from).to.equal(AddressZero);
    expect(event.to).to.equal(authLab.address);
    expect(event.id.toString()).to.equal("1");
    expect(event.value.toString()).to.equal("1");

    expect(await certifcateNFT.balanceOf(authLab.address, 1)).to.be.equal(
      BigNumber.from("1")
    );
    expect(await certifcateNFT.uri(1)).to.be.equal(baseUri + "1.json");
  });

  it("Lab can mint 1 token with id=2", async function () {});
  it("Lab can mint second token with id=1", async function () {});
});
