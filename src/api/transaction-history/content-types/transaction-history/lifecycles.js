const telegramBot = require("node-telegram-bot-api");
const { EmbedBuilder, WebhookClient } = require("discord.js");
require("dotenv").config();
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_API_KEY;

const theTelegramBot = new telegramBot(TELEGRAM_TOKEN);

const webhookClient = new WebhookClient({
  id: process.env.DISCORD_BOT_TX_ID,
  token: process.env.DISCORD_BOT_TX_TOKEN,
});

module.exports = {
  async afterCreate(event) {
    const { params, result } = event;
    if (params?.data?.status === "Blockchain") {
      const embed = new EmbedBuilder()
        .setTitle("Transaction")
        .setColor(0x00ffff);

      webhookClient.send({
        content: `${result?.wallet_address} just started a transaction!
Tx ID: ${result?.id}`,
        username: "Transaction Bot",
        avatarURL: "https://i.imgur.com/AfFp7pu.png",
        // embeds: [embed],
      });
      theTelegramBot.sendMessage(
        parseInt(process.env.TELEGRAM_GROUP_ID),
        `${result?.wallet_address} just started a transaction!
Tx ID: ${result?.id}`
      );
    }
  },
  async afterUpdate(event) {
    const { params, result } = event;
    if (params?.data?.status === "Blockchain") {
      const embed = new EmbedBuilder()
        .setTitle("Transaction")
        .setColor(0x00ffff);

      webhookClient.send({
        content: `${result?.wallet_address} just started a transaction!
Tx ID: ${result?.id}`,
        username: "Transaction Bot",
        avatarURL: "https://i.imgur.com/AfFp7pu.png",
        // embeds: [embed],
      });
      theTelegramBot.sendMessage(
        parseInt(process.env.TELEGRAM_GROUP_ID),
        `${result?.wallet_address} just started a transaction!
Tx ID: ${result?.id}`
      );
    }
  },
};
