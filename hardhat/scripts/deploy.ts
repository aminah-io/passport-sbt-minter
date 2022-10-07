const { ethers } = require("hardhat");
 
async function main() {
  // Grab the contract factory
  const PassportSBToken = await ethers.getContractFactory("PassportSBToken");
 
  // Start deployment, returning a promise that resolves to a contract object
  const passportSbtoken = await PassportSBToken.deploy(); // Instance of the contract
  await passportSbtoken.deployed();
  console.log("Contract deployed to address:", passportSbtoken.address);
}
 
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });