"use strict";
/**
 * transaction-history controller
 */
const telegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { createCoreController } = require("@strapi/strapi").factories;
const { EmbedBuilder, WebhookClient } = require("discord.js");
const Web3 = require("web3");

const erc20Abi = require("../../../erc20-abi.json");
const { cryptoData } = require("../../../crypto-helper");
require("dotenv").config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_API_KEY;

const theTelegramBot = new telegramBot(TELEGRAM_TOKEN);

const axiosCustom = axios.default.create({
  baseURL: "https://bigflip.id/api",
  headers: {
    Authorization: process.env.FLIP_AUTH,
  },
});

const webhookClient = new WebhookClient({
  id: process.env.DISCORD_BOT_RECEIPT_ID,
  token: process.env.DISCORD_BOT_RECEIPT_TOKEN,
});

module.exports = createCoreController(
  "api::transaction-history.transaction-history",
  ({ strapi }) => ({
    async inquiry(ctx) {
      try {
        const inquire = await axiosCustom.post(
          "/v2/disbursement/bank-account-inquiry",
          ctx.request.body
        );
        return inquire.data;
      } catch (e) {
        return e.response.data;
      }
    },
    async bankAccounts(ctx) {
      try {
        const inquire = await axiosCustom.get("/v2/general/banks");
        return inquire.data;
      } catch (e) {
        return e.response.data;
      }
    },
    async balance(ctx) {
      try {
        const data = await axiosCustom.get("/v2/general/balance");
        return data.data;
      } catch (e) {
        return e.response.data;
      }
    },
    async createDisbursement(ctx) {
      try {
        const { account_number, bank_code, amount, idempotency_key, remark } =
          ctx.request.body;
        const disburse = await axiosCustom.post(
          "/v3/disbursement",
          {
            account_number,
            bank_code,
            amount,
            remark,
          },
          {
            headers: {
              "idempotency-key": idempotency_key,
            },
          }
        );
        return disburse.data;
      } catch (e) {
        return e.response.data;
      }
    },
    async callbackInquiry(ctx) {
      try {
        const theData = JSON.parse(ctx.request.body.data);
        return theData;
      } catch (e) {
        console.log(e, "<<< E");
      }
    },
    async callbackDisbursement(ctx) {
      try {
        const theData = JSON.parse(ctx.request.body.data);

        if (theData.receipt) {
          const query = await strapi.db
            .query("api::transaction-history.transaction-history")
            .findOne({
              where: {
                transaction_id: theData.id,
              },
            });
          const embed = new EmbedBuilder()
            .setTitle("Receipt")
            .setColor(0x00ffff);
          const endDate = new Date(theData?.time_served ?? Date.now());
          const startDate = new Date(query?.start_progress ?? Date.now());
          const progress_time =
            (endDate.getTime() - startDate.getTime()) / 1000;

          const entry = await strapi.db
            .query("api::transaction-history.transaction-history")
            .update({
              where: {
                transaction_id: theData.id,
              },
              data: {
                status: "Flip Success",
                receipt: theData.receipt,
                end_progress: theData.time_served,
                progress_time: progress_time,
              },
            });

          try {
            webhookClient.send({
              content: `${query?.wallet_address} just finished a transaction!
Tx ID: ${query?.id}
Blockchain Tx: ${query?.transaction_hash} 
Flip Receipt: ${theData.receipt}
Progress Time: ${progress_time} seconds`,
              username: "Receipt Bot",
              avatarURL: "https://i.imgur.com/AfFp7pu.png",
              // embeds: [embed],
            });
          } catch (botError) {
            console.log(botError, "<<< DISCORD BOT ERROR");
          }

          try {
            theTelegramBot.sendMessage(
              parseInt(process.env.TELEGRAM_GROUP_ID),
              `${query?.wallet_address} just finished a transaction!
Tx ID: ${query?.id}
Blockchain Tx: ${query?.transaction_hash} 
Flip Receipt: ${theData.receipt}
Progress Time: ${progress_time} seconds`
            );
          } catch (botError) {
            console.log(botError, "<<< TELEGRAM BOT ERROR");
          }

          const flipEntry = await strapi.db
            .query("api::flip-transaction.flip-transaction")
            .update({
              where: {
                transaction_id: theData.id,
              },
              data: {
                receipt: theData.receipt,
              },
            });

          const referralWallet = await strapi.db
            .query("api::wallets-referred.wallets-referred")
            .findOne({
              where: {
                wallet_address: query?.wallet_address ?? "",
              },
              populate: ["referral_code"],
            });
          if (referralWallet) {
            const referralCode = await strapi.db
              .query("api::referral-code.referral-code")
              .findOne({
                where: {
                  wallet_address: referralWallet.referral_code.wallet_address,
                },
              });
            strapi.db.query("api::referral-code.referral-code").update({
              where: {
                wallet_address: referralWallet.referral_code.wallet_address,
              },
              data: {
                points: !referralCode.points
                  ? query.receive / 1000
                  : referralCode.points + query.receive / 1000,
              },
            });
          }
        }
        return theData.receipt;
      } catch (e) {
        console.log(e, "<<< E");
      }
    },
    async checkWalletAccounts(ctx) {
      try {
        const parsedData = ctx.request.body;
        const walletAddress = parsedData.wallet_address;
        const bankCode = parsedData.bank_code;
        const bankAccountName = parsedData.bank_account_name;
        const bankAccountNumber = parsedData.bank_account_number;
        const phoneNumber = parsedData.phone_number;
        const walletAccount = await strapi.db
          .query("api::wallet-account.wallet-account")
          .findOne({
            where: {
              wallet_address: walletAddress,
              bank_code: bankCode,
              bank_account_name: bankAccountName,
              bank_account_number: bankAccountNumber,
            },
          });
        if (!walletAccount) {
          await strapi.entityService.create(
            "api::wallet-account.wallet-account",
            {
              data: {
                wallet_address: walletAddress,
                bank_code: bankCode,
                bank_account_name: bankAccountName,
                bank_account_number: bankAccountNumber,
                phone_number: phoneNumber,
                latest: true,
              },
            }
          );
        }
        const walletAccounts = await strapi.db
          .query("api::wallet-account.wallet-account")
          .findMany({
            where: {
              wallet_address: walletAddress,
              bank_code: bankCode,
            },
          });
        let theResult;
        for (const theAccount of walletAccounts) {
          if (
            theAccount.bank_account_name !== bankAccountName &&
            theAccount.bank_account_number !== bankAccountNumber
          ) {
            await strapi.db.query("api::wallet-account.wallet-account").update({
              where: {
                id: theAccount.id,
              },
              data: {
                latest: false,
              },
              populate: {
                category: true,
              },
            });
          } else {
            theResult = await strapi.db
              .query("api::wallet-account.wallet-account")
              .update({
                where: {
                  id: theAccount.id,
                },
                data: {
                  latest: true,
                  phone_number: phoneNumber,
                },
                populate: {
                  category: true,
                },
              });
          }
        }
        return theResult;
      } catch (e) {
        console.log(e, "<<<< E");
      }
    },
    async checkKtpFile(ctx) {
      const { fileName } = ctx.request.body;
      try {
        const response = await axios.default.get(
          `${process.env.KTP_VERIFY_URL}${fileName}`
        );
        return response.data;
      } catch (e) {
        console.log(e);
      }
    },
    async handleSwap(ctx) {
      try {
        console.log(ctx.request.body);
        const { chainId, fromToken, toToken, amount, address, slippage } =
          ctx.request.body;
        const tx = await axios.default.get(
          `https://api.1inch.dev/swap/v5.2/${chainId}/swap?src=0x${fromToken}&dst=0x${toToken}&amount=${amount}&from=${address}&slippage=${slippage}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.INCH_KEY}`,
            },
          }
        );
        return tx.data;
      } catch (e) {
        console.log(e);
      }
    },
    async handleSwapOld(ctx) {
      try {
        console.log(ctx.request.body);
        const { chainId, fromToken, toToken, amount, address, slippage } =
          ctx.request.body;
        const tx = await axios.default.get(
          `https://api/1inch.io/v5.2/${chainId}/swap?src=0x${fromToken}&dst=0x${toToken}&amount=${amount}&from=${address}&slippage=${slippage}`
        );
        return tx.data;
      } catch (e) {
        console.log(e);
      }
    },
    async handleApprove(ctx) {
      try {
        const { chainId, tokenAddress, amount } = ctx.request.body;
        const tx = await axios.default.get(
          `https://api.1inch.dev/swap/v5.2/${chainId}/approve/transaction?chain=${chainId}&tokenAddress=${tokenAddress}&amount=${amount}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.INCH_KEY}`,
            },
          }
        );
        return tx.data;
      } catch (e) {
        console.log(e);
      }
    },
    async handleQuote(ctx) {
      try {
        const { chainId, fromToken, toToken, amount } = ctx.request.body;
        const tx = await axios.default.get(
          `https://api.1inch.dev/swap/v5.2/${chainId}/quote?src=${fromToken}&dst=${toToken}&amount=${amount}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.INCH_KEY}`,
            },
          }
        );
        return tx.data;
      } catch (e) {
        console.log(e);
      }
    },
    async handleCallback(ctx) {
      try {
        console.log(ctx.request.body);
      } catch (e) {
        console.log(e);
      }
    },
    async callbackPayment(ctx) {
      try {
        const { data, token } = ctx.request.body;
        const result = JSON.parse(data);
        const offrampTransaction = await strapi.db
          .query("api::offramp-transaction.offramp-transaction")
          .findOne({
            where: {
              link_id: result.bill_link_id,
            },
          });
        if (offrampTransaction) {
          const currentChain = cryptoData.find(
            (crypto) => crypto.chainId === offrampTransaction.chain_id
          );
          const web3 = new Web3.default(currentChain.rpcUrl ?? "");
          const currentToken = currentChain.tokenData.find(
            (token) => token.name === offrampTransaction.crypto
          );
          if (currentToken.native) {
            const value = web3.utils.toWei(
              offrampTransaction.crypto_value.toString(),
              "ether"
            );
            const signedTransaction = await web3.eth.accounts.signTransaction(
              {
                from: process.env.FROM_ADDRESS,
                to: offrampTransaction.to_address,
                value: value,
                gas: 21000,
                gasPrice: await web3.eth.getGasPrice(),
              },
              process.env.PRIVATE_KEY
            );
            web3.eth
              .sendSignedTransaction(signedTransaction.rawTransaction)
              .then(async (receipt) => {
                console.log(receipt.status, "<<< receipt");
                await strapi.db
                  .query("api::offramp-transaction.offramp-transaction")
                  .update({
                    where: {
                      link_id: result.bill_link_id,
                    },
                    data: {
                      status: "Success",
                    },
                  });
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            const count = await web3.eth.getTransactionCount(
              process.env.FROM_ADDRESS
            );
            const token = new web3.eth.Contract(
              erc20Abi,
              "0x" + currentToken.contractAddress
            );
            const txObject = {
              from: process.env.FROM_ADDRESS,
              nonce: "0x" + count.toString(16),
              to: offrampTransaction.to_address,
              gas: 1000000000,
              value: "0x0",
              gasPrice: await web3.eth.getGasPrice(),
              data: token.methods
                .transfer(
                  offrampTransaction.to_address,
                  web3.utils.toHex(
                    web3.utils.toWei(
                      offrampTransaction.crypto_value.toString(),
                      "ether"
                    )
                  )
                )
                .encodeABI(),
            };
            web3.eth.accounts
              .signTransaction(txObject, process.env.PRIVATE_KEY)
              .then((res) => {
                const theResult = res.rawTransaction;
                web3.eth
                  .sendSignedTransaction(theResult)
                  .then(async (res) => {
                    console.log(res, "<<< SUCCESS!!");
                    await strapi.db
                      .query("api::offramp-transaction.offramp-transaction")
                      .update({
                        where: {
                          link_id: result.bill_link_id,
                        },
                        data: {
                          status: "Success",
                        },
                      });
                  })
                  .catch((err) => {
                    console.log(err, "<< send signed transaction err");
                  });
              })
              .catch((err) => {
                console.log(err, "<< sign transaction err");
              });
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    async createPayment(ctx) {
      try {
        const payment = await axiosCustom.post(
          "/v2/pwf/bill",
          ctx.request.body
        );
        console.log(payment, "<<< PAYMENT");
        return payment.data;
      } catch (e) {
        return e.response.data;
      }
    },
    async openUrl(ctx) {
      try {
        const { url } = ctx.request.body;
        window.open(url, "_blank");
      } catch (e) {
        return e;
      }
    },
    async secondOpenUrl(ctx) {
      try {
        const { url } = ctx.request.body;
        (await import("open")).default(url);
      } catch (e) {
        return e;
      }
    },
  })
);
