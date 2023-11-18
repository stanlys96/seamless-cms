require("dotenv").config();

module.exports = {
  chainData: [
    {
      id: 1,
      chainId: 1,
      name: "Ethereum",
      transactionUrl: "https://etherscan.io/tx/",
    },
    {
      id: 2,
      chainId: 42161,
      name: "Arbitrum",
      transactionUrl: "https://arbiscan.io/tx/",
    },
    {
      id: 3,
      chainId: 137,
      name: "Polygon",
      transactionUrl: "https://polygonscan.com/tx/",
    },
    {
      id: 4,
      chainId: 10,
      name: "Optimism",
      transactionUrl: "https://optimistic.etherscan.io/tx/",
    },
    {
      id: 5,
      chainId: 56,
      name: "BSC",
      transactionUrl: "https://bscscan.com/tx/",
    },
    {
      id: 6,
      chainId: 5,
      name: "Goerli",
      transactionUrl: "https://goerli.etherscan.io/tx/",
    },
    {
      id: 7,
      chainId: 1313161554,
      name: "Aurora",
      transactionUrl: "https://explorer.aurora.dev/tx/",
    },
    {
      id: 8,
      chainId: 84531,
      name: "Base",
      transactionUrl: "https://basescan.org/tx/",
    },
    {
      id: 9,
      chainId: 59114,
      name: "Linea",
      transactionUrl: "https://lineascan.build/tx/",
    },
  ],
  contracts: [
    {
      id: 1,
      name: "Ethereum",
      rpcUrl: process.env.ARBITRUM_RPC_URL,
      contract: process.env.ETHEREUM_CUSTOM_CONTRACT,
    },
    {
      id: 2,
      name: "Polygon",
      rpcUrl: process.env.ARBITRUM_RPC_URL,
      contract: process.env.POLYGON_CUSTOM_CONTRACT,
    },
    {
      id: 3,
      name: "Arbitrum",
      rpcUrl: process.env.ARBITRUM_RPC_URL,
      contract: process.env.ARBITRUM_CUSTOM_CONTRACT,
    },
    {
      id: 4,
      name: "Binance",
      rpcUrl: process.env.ARBITRUM_RPC_URL,
      contract: process.env.BINANCE_CUSTOM_CONTRACT,
    },
    {
      id: 5,
      name: "Optimism",
      rpcUrl: process.env.ARBITRUM_RPC_URL,
      contract: process.env.OPTIMISM_CUSTOM_CONTRACT,
    },
    {
      id: 6,
      name: "Base",
      rpcUrl: process.env.ARBITRUM_RPC_URL,
      contract: process.env.BASE_CUSTOM_CONTRACT,
    },
    {
      id: 7,
      name: "Linea",
      rpcUrl: process.env.ARBITRUM_RPC_URL,
      contract: process.env.LINEA_CUSTOM_CONTRACT,
    },
    {
      id: 8,
      name: "Goerli",
      rpcUrl: process.env.ARBITRUM_RPC_URL,
      contract: process.env.GOERLI_CUSTOM_CONTRACT,
    },
  ],
};
