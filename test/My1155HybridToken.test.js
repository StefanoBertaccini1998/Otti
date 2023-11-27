const { BigNumber, constants } = require("ethers");
const { AddressZero, EtherSymbol } = constants;

const { expect } = require("chai");
const { ethers } = require("hardhat");

require("@nomicfoundation/hardhat-chai-matchers");
let erc1155Token, creator, other1, other2, event, newCreator;

describe("TokenNFT test", function (accounts) {
  baseUri = "ipfs://Qmb27L7Zr1853xV3rC7Z9mSQ1KTF7NJQnEDdinLNPKH71V/";

  it("token setup", async function () {
    const Token1155 = await ethers.getContractFactory("My1155HybridToken");
    [creator, other1, other2, newCreator] = await ethers.getSigners();

    erc1155Token = await Token1155.deploy();

    expect(erc1155Token.address).to.be.not.equal(AddressZero);
    expect(erc1155Token.address).to.match(/0x[0-9a-fA-F]{40}/);
  });

  it("token URI setup for ID", async function () {
    await erc1155Token.connect(creator).setTokenUri(1, baseUri + "1.json");
    await erc1155Token.connect(creator).setTokenUri(2, baseUri + "2.json");
    await erc1155Token.connect(creator).setTokenUri(3, baseUri + "3.json");
  });

  describe("minting", function () {
    it("users can NOT mint tokens", async function () {
      await expect(
        erc1155Token.connect(other1).mint(other1.address, 1, 1, 0x111123)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("creator can mint 1 token with id=1 for other account", async function () {
      tx = await erc1155Token
        .connect(creator)
        .mint(other1.address, 1, 1, 0x1112);
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
      expect(event.to).to.equal(other1.address);
      expect(event.id.toString()).to.equal("1");
      expect(event.value.toString()).to.equal("1");

      expect(await erc1155Token.balanceOf(other1.address, 1)).to.be.equal(
        BigNumber.from("1")
      );

      expect(await erc1155Token.uri(1)).to.be.equal(baseUri + "1.json");
    });

    it("creator can mint 10 token with id=2 for other2 account", async function () {
      await expect(
        erc1155Token.connect(creator).mint(other2.address, 2, 10, 0x11)
      )
        .to.emit(erc1155Token, "TransferSingle")
        .withArgs(creator.address, AddressZero, other2.address, 2, 10);

      expect(await erc1155Token.balanceOf(other2.address, 2)).to.be.equal(
        BigNumber.from(10)
      );

      expect(await erc1155Token.totalSupply(2)).to.be.equal(
        BigNumber.from("20")
      );

      expect(await erc1155Token.uri(2)).to.be.equal(baseUri + "2.json");
    });

    it("creator can batch mint some token with different ids for other2 account", async function () {
      await expect(
        erc1155Token
          .connect(creator)
          .mintBatch(other2.address, [2, 3], [10, 15], 0x11)
      )
        .to.emit(erc1155Token, "TransferBatch")
        .withArgs(
          creator.address,
          AddressZero,
          other2.address,
          [2, 3],
          [10, 15]
        );

      expect(await erc1155Token.balanceOf(other2.address, 3)).to.be.equal(
        BigNumber.from(15)
      );
      expect(await erc1155Token.balanceOf(other2.address, 2)).to.be.equal(
        BigNumber.from(20)
      );

      expect(await erc1155Token.totalSupply(3)).to.be.equal(
        BigNumber.from("30")
      );
      expect(await erc1155Token.totalSupply(2)).to.be.equal(
        BigNumber.from("30")
      );

      expect(await erc1155Token.uri(3)).to.be.equal(baseUri + "3.json");
    });
  });

  describe("transfer", function () {
    it("other1 can transfer their tokens", async function () {
      await erc1155Token
        .connect(other1)
        .safeTransferFrom(other1.address, other2.address, 1, 1, 0x11);
      expect(await erc1155Token.balanceOf(other1.address, 1)).to.be.equal(
        BigNumber.from("0")
      );
      expect(await erc1155Token.balanceOf(other2.address, 1)).to.be.equal(
        BigNumber.from("1")
      );
    });

    it("other2 can batch transfer their tokens", async function () {
      await erc1155Token
        .connect(other2)
        .safeBatchTransferFrom(
          other2.address,
          other1.address,
          [2, 3],
          [3, 5],
          0x1122
        );
      expect(await erc1155Token.balanceOf(other1.address, 2)).to.be.equal(
        BigNumber.from("3")
      );
      expect(await erc1155Token.balanceOf(other2.address, 2)).to.be.equal(
        BigNumber.from("17")
      );
      expect(await erc1155Token.balanceOf(other1.address, 3)).to.be.equal(
        BigNumber.from("5")
      );
      expect(await erc1155Token.balanceOf(other2.address, 3)).to.be.equal(
        BigNumber.from("10")
      );
    });
  });
});
