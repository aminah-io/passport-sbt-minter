import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    // localhost: {
    //   url: "http://127.0.0.1:8545"
    // },
    hardhat: {
      chainId: 1337
    },
    goerli: {
      url: `${process.env.GOERLI_ALCHEMY_URL}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
  }
};

export default config;