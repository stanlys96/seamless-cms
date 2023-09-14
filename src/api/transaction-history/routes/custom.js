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
      method: "POST",
      path: "/disbursement",
      handler: "transaction-history.createDisbursement",
      config: {
        auth: false,
      },
    },
  ],
};
