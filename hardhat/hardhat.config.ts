import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

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
      // accounts: {
      //   mnemonic: process.env.MNEMONIC,
      //   path: "m/44'/60'/0'/0",
      //   initialIndex: 0,
      //   count: 20,
      //   passphrase: "",
      // },
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
  }
};

export default config;