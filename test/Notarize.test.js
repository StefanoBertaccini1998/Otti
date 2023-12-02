const {
  BN,
  constants,
  excepctEvent,
  expectRevert,
  time,
  balance,
} = require("@openzeppelin/test-helpers");

const { ZERO_ADDRES } = constants;

const { expect } = require("chai");
const { ethers } = require("hardhat");

require("@nomicfoundation/hardhat-chai-matchers");
let notarize, creator, other1, other2, event, newCreator;

const hash1 =
  "0x8613911112c3d65a9c52f1316fbd18f56eb43b7c0f68f49f6694d9b561bfeaf7";
const hash2 =
  "0x5b5aa7db42b8a6bccffceb0096f32de6dcb30ed454deb514de75c0c5ecc1370c";
const HashWriter =
  "0x9bd7b39e404ec8163ddb5278c0044198ca50a2bf864985cbc93f934a5afed5d6";
  const AdminRole =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

describe("TokenNFT test", function (accounts) {

  it("Notarize Contract deploy", async function (){
    //Get users
    [creator, other1, other2, newCreator] = await ethers.getSigners();

    const Notarize = await ethers.getContractFactory("Notarize");
    console.log("Deploying Notarize contract...");
    notarize = await Notarize.deploy();
    await notarize.deployed();
    console.log(notarize.address)
    expect(notarize.address).to.be.not.equal(ZERO_ADDRES);
    expect(notarize.address).to.match(/0x[0-9a-fA-F]{40}/);
  });

  it("Check if not admin can assume HASH_WRITER role", async function(){
    
    await expect( notarize.connect(other1).setHashWriterRole(creator.address)).to.be.revertedWith("AccessControl: account " +
    other1.address.toLowerCase() +
    " is missing role " +
    AdminRole);
  });

  it("Check if deployer can give HASH_WRITER role and retire it", async function(){
    await notarize.connect(creator).setHashWriterRole(other1.address);
    await notarize.connect(creator).setHashWriterRole(other2.address);
    await notarize.connect(creator).removeHashWriterRole(other2.address);
  });

  it("Check if user without role of Hash_Writer can't add a document", async function (){
    docUrl = "https//:url.com";
    console.log("AccessControl: account " +
    newCreator.address.toLowerCase() +
    " is missing role " +
    HashWriter);

    await expect( notarize.connect(newCreator).addNewDocument(docUrl,hash1)).to.be.revertedWith("AccessControl: account " +
    newCreator.address.toLowerCase() +
    " is missing role " +
    HashWriter);
  });

  it("Check if Hash_Writer can add a document", async function (){
    docUrl = "https//:url.com";
    console.log("Total document registered: " + hash1);
    expect(await notarize.connect(other1).addNewDocument(docUrl,hash1)).to.emit(notarize, "DocHashAdded");
    num =  await notarize.getDocsCount();
    console.log("Total document registered: " + num.toString());
    result =  await notarize.getDocInfo(num-1);
    console.log("Document in: " + result[0] + " hash: "+result[1].toString());
  });

  it("Check if Hash_Writer try to add the same document", async function(){
    expect(await notarize.getRegisteredHash(hash1)).to.be.true;
    docUrl = "https//:url2.com";
    await expect( notarize.connect(other1).addNewDocument(docUrl,hash1)).to.be.revertedWithCustomError(notarize, "docAlreadyRegistered");
    num =  await notarize.getDocsCount();
    console.log("Total document registered: " + num.toString());
  });

  it("Check if Hash_Writer can add a second document", async function (){
    docUrl = "https//:url2.com";    
    console.log("Total document registered: " + hash2);
    expect(await notarize.connect(other1).addNewDocument(docUrl,hash2)).to.emit(notarize, "DocHashAdded");
    num =  await notarize.getDocsCount();
    console.log("Total document registered: " + num.toString());
    result =  await notarize.getDocInfo(num-1);
    console.log("Document in: " + result[0] + " hash: "+result[1].toString());
  });

 
});
