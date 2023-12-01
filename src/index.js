"use strict";
const { ethers } = require("ethers");
require("dotenv").config();
const seamlessAbi = require("./seamless-abi.json");
const { chainData, contracts } = require("./helper");
const axios = require("axios");
const { formatEther } = require("@ethersproject/units");
const cron = require("node-cron");

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
  register({ strapi }) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    cron.schedule("*/15 * * * * *", async function () {
      const theData = await strapi.db
        .query("api::transaction-history.transaction-history")
        .findMany({
          where: {
            status: {
              $in: ["Blockchain", "Blockchain Success"],
            },
          },
        });
      console.log("ASD");
      for (let transactionData of theData) {
        try {
          const transactionHash = transactionData.transaction_hash;
          const currentNetwork = chainData.find((theData) =>
            transactionHash.includes(theData.transactionUrl)
          );

          let cronProvider;
          let tx;
          try {
            const theHash = transactionHash.split("/tx/");
            cronProvider = new ethers.providers.JsonRpcProvider(
              "https" + currentNetwork.httpsRpcUrl
            );
            tx = await cronProvider.getTransactionReceipt(theHash[1]);
          } catch (e) {
            console.log(e, "<<<");
          }
          if (tx && tx.status === 1) {
            try {
              console.log("???");
              const disburse = await axiosCustom.post(
                "/v3/disbursement",
                {
                  account_number: transactionData.bank_account_number,
                  bank_code: transactionData.bank_code,
                  amount: transactionData.receive,
                  remark: "Seamless Finance",
                },
                {
                  headers: {
                    "idempotency-key": transactionData.idempotency_key,
                  },
                }
              );
              console.log(disburse);
              const result = disburse.data;
              strapi.db
                .query("api::transaction-history.transaction-history")
                .update({
                  where: {
                    id: result.id,
                  },
                  data: {
                    status: "Flip",
                    transaction_id: result.id,
                  },
                });
              strapi.db.query("api::flip-transaction.flip-transaction").create({
                data: {
                  account_number: result.account_number,
                  amount: result.amount,
                  account_name: result.recipient_name,
                  idempotency_key: result.idempotency_key,
                  bank_code: result.bank_code,
                  sender_bank: result.sender_bank,
                  transaction_id: result.id.toString(),
                  fee: result.fee,
                  user_id: result.user_id.toString(),
                  receipt: "",
                },
              });
            } catch (e) {
              console.log(e, "<<< ??? ");
            }
          }
        } catch (e) {
          console.log(e, "<<< E");
        }
      }
    });
    for (let theContract of contracts) {
      try {
        const provider = new ethers.providers.WebSocketProvider(
          "wss" + theContract.rpcUrl
        );
        const currentContract = new ethers.Contract(
          theContract.contract,
          seamlessAbi,
          provider
        );
        currentContract.on("TokenSent", async (_name, name) => {
          try {
            const tx = await name.getTransaction();
            const transaction = await name.getTransactionReceipt();
            console.log(tx, "<<< tx");
            console.log(transaction, "<<< transaction");
            const hash = tx.hash;
            const chainId = tx.chainId;
            if (transaction.status.toString() !== "1") {
              strapi.db
                .query("api::transaction-history.transaction-history")
                .update({
                  where: {
                    transaction_hash:
                      chainData.find(
                        (data) => data.chainId.toString() === chainId.toString()
                      ).transactionUrl + hash,
                  },
                  data: {
                    status: "Blockchain Error",
                  },
                });
              return;
            }

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
              strapi.db
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
              try {
                const disburse = await axiosCustom.post(
                  "/v3/disbursement",
                  {
                    account_number: query.bank_account_number,
                    bank_code: query.bank_code,
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

                strapi.db
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
                strapi.db
                  .query("api::flip-transaction.flip-transaction")
                  .create({
                    data: {
                      account_number: result.account_number,
                      amount: result.amount,
                      account_name: result.recipient_name,
                      idempotency_key: result.idempotency_key,
                      bank_code: result.bank_code,
                      sender_bank: result.sender_bank,
                      transaction_id: result.id.toString(),
                      fee: result.fee,
                      user_id: result.user_id.toString(),
                      receipt: "",
                    },
                  });
              } catch (e) {
                console.log(e, "<<< E!");
              }
            }
          } catch (e) {
            console.log(e, "<<< ERROR");
          }
        });
      } catch (e) {
        console.log(e, "<<< E");
      }
    }
  },
};
