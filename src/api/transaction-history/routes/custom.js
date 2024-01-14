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
  ],
};
