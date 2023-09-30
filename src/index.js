"use strict";
const { ethers } = require("ethers");
const Web3 = require("web3");
require("dotenv").config();
const seamlessAbi = require("./seamless-abi.json");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {
    const contracts = [
      {
        id: 1,
        name: "Ethereum",
        rpcUrl: process.env.MAINNET_RPC_URL,
        contract: process.env.ETHEREUM_CUSTOM_CONTRACT,
      },
      {
        id: 2,
        name: "Polygon",
        rpcUrl: process.env.POLYGON_RPC_URL,
        contract: process.env.POLYGON_CUSTOM_CONTRACT,
      },
      {
        id: 3,
        name: "Arbitrum",
        rpcUrl: process.env.ARBITRUM_RPC_URL,
        contract: process.env.ARBITRUM_CUSTOM_CONTRACT,
      },
      {
        id: 4,
        name: "Binance",
        rpcUrl: process.env.BSC_RPC_URL,
        contract: process.env.BINANCE_CUSTOM_CONTRACT,
      },
      {
        id: 5,
        name: "Optimism",
        rpcUrl: process.env.OPTIMISM_RPC_URL,
        contract: process.env.OPTIMISM_CUSTOM_CONTRACT,
      },
      {
        id: 6,
        name: "Base",
        rpcUrl: process.env.BASE_RPC_URL,
        contract: process.env.BASE_CUSTOM_CONTRACT,
      },
      {
        id: 7,
        name: "Linea",
        rpcUrl: process.env.LINEA_RPC_URL,
        contract: process.env.LINEA_CUSTOM_CONTRACT,
      },
      {
        id: 8,
        name: "Goerli",
        rpcUrl: process.env.GOERLI_RPC_URL,
        contract: process.env.GOERLI_CUSTOM_CONTRACT,
      },
    ];
    for (let theContract of contracts) {
      const currentProvider = new ethers.providers.JsonRpcProvider(
        theContract.rpcUrl
      );
      const currentWallet = new ethers.Wallet(
        process.env.PRIVATE,
        currentProvider
      );
      const currentContract = new ethers.Contract(
        theContract.contract,
        seamlessAbi,
        currentWallet
      );

      const contractInterface = new ethers.utils.Interface(seamlessAbi);

      currentContract.on("TokenSent", async (a) => {
        try {
          console.log(a, `1 <<<< ${theContract.name}`);
          console.log(a.toString(), "2 <<<< parsed");
          console.log(JSON.stringify(a), "3 <<< ????");
          console.log(JSON.stringify(a.toString()), "5 <<< ??? !!!!");
          const jsonParsed = JSON.parse(JSON.stringify(a.toString()));
          console.log(jsonParsed.hash);
          const theEvent = contractInterface.getEvent(a.hash);
          console.log(theEvent, "<<<< the event!");
        } catch (e) {
          console.log(e, "<<< ERROR");
        }
      });
    }
  },
};
