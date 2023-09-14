"use strict";

const { Server } = require("socket.io");

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
  bootstrap(/*{ strapi }*/) {
    const io = new Server(strapi.server.httpServer, {
      cors: {
        // cors setup
        origin: "https://seamless-test.vercel.app/",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });
    io.on("connection", (socket) => {
      console.log("a user is connected!");
      socket.on("check-bank", async (data) => {
        console.log(data, "<<<");
      });
    });
  },
};
