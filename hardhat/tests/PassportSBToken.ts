import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-toolbox";
import { expect } from "chai";
import { ethers } from "hardhat";

const tokenType = 0;
const stampHash = "abcabcabcabc";

describe("PassportSBT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function PassportSbtMinter() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const PassportSbt = await ethers.getContractFactory("PassportSBT");
    const passportSbtSM = await PassportSbt.deploy();

    return { passportSbtSM, owner, otherAccount };
  }

  describe("Test stamp minting functionality", function () {
    it("Should mint stamp if no stamp has already been minted for the given address", async function () {
      const { passportSbtSM } = await loadFixture(PassportSbtMinter);

      await passportSbtSM.mint(tokenType, stampHash);

      await expect(passportSbtSM.mint(tokenType, stampHash)).to.be.revertedWith("Stamp is already minted!");
    });
  });
});

// Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
      // `require` will evaluate false and revert the transaction.
      // await expect(
      //   hardhatToken.connect(addr1).transfer(owner.address, 1)
      // ).to.be.revertedWith("Not enough tokens");