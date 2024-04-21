module.exports = {
  routes: [
    {
      method: "POST",
      path: "/inquiry",
      handler: "transaction-history.inquiry",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/banks",
      handler: "transaction-history.bankAccounts",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/balance",
      handler: "transaction-history.balance",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/disbursement",
      handler: "transaction-history.createDisbursement",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/callback-inquiry",
      handler: "transaction-history.callbackInquiry",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/callback-disbursement",
      handler: "transaction-history.callbackDisbursement",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/check-wallet-accounts",
      handler: "transaction-history.checkWalletAccounts",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/check-ktp-file",
      handler: "transaction-history.checkKtpFile",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/handle-swap",
      handler: "transaction-history.handleSwap",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/handle-swap-old",
      handler: "transaction-history.handleSwapOld",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/handle-approve",
      handler: "transaction-history.handleApprove",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/handle-quote",
      handler: "transaction-history.handleQuote",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/handle-callback",
      handler: "transaction-history.handleCallback",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/callback-payment",
      handler: "transaction-history.callbackPayment",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/create-payment",
      handler: "transaction-history.createPayment",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/open-url",
      handler: "transaction-history.openUrl",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/second-open-url",
      handler: "transaction-history.secondOpenUrl",
      config: {
        auth: false,
      },
    },
  ],
};
