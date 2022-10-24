import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-toolbox";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

const tokenType = 0;
const stampHash = "abcabcabcabc";
const tokenTypes = [0, 1];
const stampHashes = ["abcabcabcabc", "xyzxyzxyzxyz"];
const amounts = [1, 1];
const duplicateTokenTypes = [0, 1, 1];
const duplicateStampHashes = ["abcabcabcabc", "xyzxyzxyzxyz", "xyzxyzxyzxyz"];
const duplicateAmounts = [1, 1, 1];

describe("PassportSBT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function PassportSbtMinter() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const sbtContractV1 = await ethers.getContractFactory("PassportSBTokenV1");
    const contract = await upgrades.deployProxy(
      sbtContractV1, 
      ["Gitcoin Passport Soulbound Token", "GPSBT"], 
      { initializer: "initialize", kind: "uups" }
    );

    return { contract, owner, otherAccount };
  }

  describe("Passport SBT minting functionality", function () {
    it("Should mint stamp if no stamp has already been minted for the given address", async function () {
      const { contract } = await loadFixture(PassportSbtMinter);

      await contract.mint(tokenType, stampHash);

      await expect(contract.mint(tokenType, stampHash)).to.be.revertedWith("Stamp is already minted!");
    });

    it("Should mint multiple stamps at once if none of those stamps have been minted for the given address", async function () {
      const { contract } = await loadFixture(PassportSbtMinter);

      await contract.mintBatch(tokenTypes, stampHashes, amounts);

      await expect(contract.mintBatch(duplicateTokenTypes, duplicateStampHashes, duplicateAmounts)).to.be.revertedWith("Stamp is already minted!");
    });

  });
  
  describe("Passport SBT burning functionality", function () {
    it("should burn a single token with the id sent in from the UI", async function() {
      const { contract } = await loadFixture(PassportSbtMinter);
  
      await contract.mint(tokenType, stampHash);
  
      await contract.burnToken(tokenType, stampHash, 1);
    });
  
    it("should burn all tokens with the ids sent in from the UI", async function() {
      const { contract } = await loadFixture(PassportSbtMinter);
  
      await contract.mintBatch(tokenTypes, stampHashes, amounts);
  
      await contract.burnTokenBatch(tokenTypes, stampHashes, amounts);
    });
  });

  describe("Minting after burning", function () {
    it("should batch mint tokens after batch burning", async function() {
      const { contract } = await loadFixture(PassportSbtMinter);
    
      await contract.mintBatch(tokenTypes, stampHashes, amounts);
  
      await contract.burnTokenBatch(tokenTypes, stampHashes, amounts);

      await contract.mintBatch(tokenTypes, stampHashes, amounts);
    });
  });
});
