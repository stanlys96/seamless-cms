"use strict";

/**
 * transaction-history controller
 */

const axios = require("axios");
const { createCoreController } = require("@strapi/strapi").factories;
require("dotenv").config();

const axiosCustom = axios.default.create({
  baseURL: "https://bigflip.id/api/v2/disbursement",
  headers: {
    Authorization: process.env.FLIP_AUTH,
  },
});

module.exports = createCoreController(
  "api::transaction-history.transaction-history",
  ({ strapi }) => ({
    async inquiry(ctx) {
      try {
        console.log(ctx.request.body, "<<< BODY");
        console.log(ctx.request.body.account_number, "<<<");
        console.log(ctx.request.body.bank_code, "<<<");
        const inquire = await axiosCustom.post(
          "/bank-account-inquiry",
          ctx.request.body
        );
        console.log(inquire.data, "<<<");
        return inquire.data;
      } catch (e) {
        return e.response.data;
      }
    },
  })
);
