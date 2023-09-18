"use strict";

/**
 * transaction-history controller
 */
const telegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { createCoreController } = require("@strapi/strapi").factories;
require("dotenv").config();
const { Server } = require("socket.io");
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_API_KEY;

const theTelegramBot = new telegramBot(TELEGRAM_TOKEN);

const axiosCustom = axios.default.create({
  baseURL: "https://bigflip.id/api",
  headers: {
    Authorization: process.env.FLIP_AUTH,
  },
});

const io = new Server(strapi.server.httpServer, {
  cors: {
    // cors setup
    origin: "*",
    methods: ["GET", "POST"],
  },
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
        const { account_number, bank_code, amount, idempotency_key } =
          ctx.request.body;
        const disburse = await axiosCustom.post(
          "/v3/disbursement",
          {
            account_number,
            bank_code,
            amount,
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
        theTelegramBot.sendMessage(
          1108175939,
          `A user just finished a transaction! Receipt: ${theData.receipt}`
        );
        if (theData.receipt) {
          const date = new Date();
          date.setHours(date.getHours() + 7);
          const dateStr =
            date.getFullYear() +
            "-" +
            ("00" + (date.getMonth() + 1)).slice(-2) +
            "-" +
            ("00" + date.getDate()).slice(-2) +
            " " +
            ("00" + date.getHours()).slice(-2) +
            ":" +
            ("00" + date.getMinutes()).slice(-2) +
            ":" +
            ("00" + date.getSeconds()).slice(-2) +
            ("." + date.getMilliseconds()).slice(-4);
          const entry = await strapi.db
            .query("api::transaction-history.transaction-history")
            .update({
              where: {
                transaction_id: theData.id,
              },
              data: {
                status: "Flip Success",
                receipt: theData.receipt,
                end_progress: dateStr,
              },
            });
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
  })
);
