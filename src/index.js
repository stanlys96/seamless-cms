"use strict";
const { ethers } = require("ethers");
const Web3 = require("web3");
require("dotenv").config();
const seamlessAbi = require("./seamless-abi.json");
const { chainData } = require("./helper");

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
  bootstrap({ strapi }) {
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

      currentContract.on("TokenSent", async (_name, name) => {
        try {
          const tx = await name.getTransaction();
          const hash = tx.hash;
          const chainId = tx.chainId;
          const query = await strapi.db
            .query("api::transaction-history.transaction-history")
            .findOne({
              where: {
                transaction_hash:
                  chainData.find(
                    (data) => data.chainId.toString() === chainId.toString()
                  ).transactionUrl + hash,
              },
            });
          console.log(query, "<<<<<");
        } catch (e) {
          console.log(e, "<<< ERROR");
        }
      });
    }
  },
};
