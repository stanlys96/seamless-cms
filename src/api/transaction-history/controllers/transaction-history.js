"use strict";

/**
 * transaction-history controller
 */

const axios = require("axios");
const { createCoreController } = require("@strapi/strapi").factories;
require("dotenv").config();
const { Server } = require("socket.io");

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
    async createDisbursement(ctx) {
      try {
        const { account_number, bank_code, amount, idempotency_key } =
          ctx.request.body;
        console.log(ctx.request.body);
        console.log(ctx.request.body.idempotency_key, "<<<<");
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
        console.log(theData);
      } catch (e) {
        console.log(e, "<<< E");
      }
    },
    async callbackDisbursement(ctx) {
      try {
        const theData = JSON.parse(ctx.request.body.data);
        console.log(theData);
        const entry = await strapi.entityService.findMany(
          "api::transaction-history:transaction-history",
          {
            filters: {
              transaction_id: "451943357",
            },
          }
        );
        console.log(entry, "<<< entry");
      } catch (e) {
        console.log(e, "<<< E");
      }
    },
  })
);
