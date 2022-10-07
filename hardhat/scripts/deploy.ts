const { ethers } = require("hardhat");
 
async function main() {
  // Grab the contract factory
  const PassportSBT = await ethers.getContractFactory("PassportSBT");
 
  // Start deployment, returning a promise that resolves to a contract object
  const passportSbt = await PassportSBT.deploy(); // Instance of the contract
  await passportSbt.deployed();
  console.log("Contract deployed to address:", passportSbt.address);
}
 
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });