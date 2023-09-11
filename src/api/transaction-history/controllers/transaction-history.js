"use strict";

/**
 * transaction-history controller
 */

const axios = require("axios");
const { createCoreController } = require("@strapi/strapi").factories;
require("dotenv").config();

const axiosCustom = axios.default.create({
  baseURL: "https://bigflip.id/api/v2",
  headers: {
    Authorization: process.env.FLIP_AUTH,
  },
});

module.exports = createCoreController(
  "api::transaction-history.transaction-history",
  ({ strapi }) => ({
    async inquiry(ctx) {
      try {
        const inquire = await axiosCustom.post(
          "/disbursement/bank-account-inquiry",
          ctx.request.body
        );
        return inquire.data;
      } catch (e) {
        return e.response.data;
      }
    },
    async bankAccounts(ctx) {
      try {
        const inquire = await axiosCustom.get("/general/banks");
        return inquire.data;
      } catch (e) {
        return e.response.data;
      }
    },
  })
);
