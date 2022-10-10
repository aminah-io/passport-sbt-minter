import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-toolbox";
import { expect } from "chai";
import { ethers } from "hardhat";

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

    const PassportSbt = await ethers.getContractFactory("PassportSBToken");
    const passportSbtSM = await PassportSbt.deploy();

    return { passportSbtSM, owner, otherAccount };
  }

  describe("Test stamp minting functionality", function () {
    it("Should mint stamp if no stamp has already been minted for the given address", async function () {
      const { passportSbtSM } = await loadFixture(PassportSbtMinter);

      await passportSbtSM.mint(tokenType, stampHash);

      await expect(passportSbtSM.mint(tokenType, stampHash)).to.be.revertedWith("Stamp is already minted!");
    });

    it("Should mint multiple stamps at once if none of those stamps have been minted for the given address", async function () {
      const { passportSbtSM } = await loadFixture(PassportSbtMinter);

      await passportSbtSM.mintBatch(tokenTypes, stampHashes, amounts);

      await expect(passportSbtSM.mintBatch(duplicateTokenTypes, duplicateStampHashes, duplicateAmounts)).to.be.revertedWith("Stamp is already minted!");
    });

    it("should burn all tokens with the ids sent in from the UI", async function() {
      const { passportSbtSM } = await loadFixture(PassportSbtMinter);

      await passportSbtSM.burnBatch("", tokenTypes, amounts);
    });
  });
});

// Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      // await expect(
      //   hardhatToken.connect(addr1).transfer(owner.address, 1)
      // ).to.be.revertedWith("Not enough tokens");