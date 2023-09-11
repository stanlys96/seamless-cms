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
  ],
};
