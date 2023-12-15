require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
require("dotenv").config();

const { SEPOLIA_URL, METAMASK_PRIVATE_KEY, ETHERSCAN_API_KEY, ETH_URL } =
  process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: ETH_URL,
        //blockNumber: 15000000,
      },
    },
    dashboard: {
      url: "http://localhost:24012/rpc",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    env: "./env",
  },
  mocha: {
    timeout: 40000,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: "",
    currency: "EUR",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=gasPrice",
    token: "ETH",
  },
  docgen: {
    path: "./docs",
    clear: true,
    runOnCompile: true,
  }
};
