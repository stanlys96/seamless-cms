const telegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const { Server } = require("socket.io");
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_API_KEY;

const theTelegramBot = new telegramBot(TELEGRAM_TOKEN);

module.exports = {
  async afterCreate(event) {
    const { params, result } = event;
    if (params?.data?.status === "Blockchain") {
      theTelegramBot.sendMessage(
        -4045247511,
        `${result?.wallet_address} just started a transaction!`
      );
    }
  },
  async afterUpdate(event) {
    const { params, result } = event;
    if (params?.data?.status === "Blockchain") {
      theTelegramBot.sendMessage(
        -4045247511,
        `${result?.wallet_address} just started a transaction!`
      );
    }
  },
};
