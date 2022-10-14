import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-toolbox";
import { expect } from "chai";
import { ethers } from "hardhat";


const account = "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f";
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

    const PassportSBToken = await ethers.getContractFactory("PassportSBToken");
    const passportSbtContract = await PassportSBToken.deploy();

    return { passportSbtContract, owner, otherAccount };
  }

  describe("Passport SBT minting functionality", function () {
    it("Should mint stamp if no stamp has already been minted for the given address", async function () {
      const { passportSbtContract } = await loadFixture(PassportSbtMinter);

      await passportSbtContract.mint(tokenType, stampHash);

      await expect(passportSbtContract.mint(tokenType, stampHash)).to.be.revertedWith("Stamp is already minted!");
    });

    it("Should mint multiple stamps at once if none of those stamps have been minted for the given address", async function () {
      const { passportSbtContract } = await loadFixture(PassportSbtMinter);

      await passportSbtContract.mintBatch(tokenTypes, stampHashes, amounts);

      await expect(passportSbtContract.mintBatch(duplicateTokenTypes, duplicateStampHashes, duplicateAmounts)).to.be.revertedWith("Stamp is already minted!");
    });

  });
  
  describe("Passport SBT burning functionality", function () {
    it("should burn a single token with the id sent in from the UI", async function() {
      const { passportSbtContract } = await loadFixture(PassportSbtMinter);
  
      await passportSbtContract.mint(tokenType, stampHash);
  
      await passportSbtContract.burnToken(tokenType, stampHash, 1);
    });
  
    it("should burn all tokens with the ids sent in from the UI", async function() {
      const { passportSbtContract } = await loadFixture(PassportSbtMinter);
  
      await passportSbtContract.mintBatch(tokenTypes, stampHashes, amounts);
  
      await passportSbtContract.burnTokenBatch(tokenTypes, stampHashes, amounts);
    });
  });
});
