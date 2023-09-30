"use strict";
const { ethers } = require("ethers");
require("dotenv").config();
const seamlessAbi = require("./seamless-abi.json");
const { chainData, contracts } = require("./helper");
const axios = require("axios");
const { formatEther } = require("@ethersproject/units");

const axiosCustom = axios.default.create({
  baseURL: "https://bigflip.id/api",
  headers: {
    Authorization: process.env.FLIP_AUTH,
  },
});

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

      currentContract.on("TokenSent", async (_name, name) => {
        try {
          const tx = await name.getTransaction();

          console.log(tx, "<<< tx");
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
          if (query) {
            await strapi.db
              .query("api::transaction-history.transaction-history")
              .update({
                where: {
                  id: query.id,
                },
                data: {
                  status: "Blockchain Success",
                  gas_price: parseFloat(formatEther(tx.gasPrice)),
                  block_confirmation: tx.confirmations.toString(),
                  transaction_success: true,
                },
              });
            await tx.wait(3);
            const disburse = await axiosCustom.post(
              "/v3/disbursement",
              {
                account_number: query.bank_account_number,
                bank_code: query.bank_name.toLowerCase(),
                amount: query.receive,
                remark: "Seamless Finance",
              },
              {
                headers: {
                  "idempotency-key": query.idempotency_key,
                },
              }
            );

            const result = disburse.data;

            await strapi.db
              .query("api::transaction-history.transaction-history")
              .update({
                where: {
                  id: query.id,
                },
                data: {
                  status: "Flip",
                  transaction_id: result.id,
                },
              });
          }
        } catch (e) {
          console.log(e, "<<< ERROR");
        }
      });
    }
  },
};
