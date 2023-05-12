// Allows us to use ES6 in our migrations and tests.
require('dotenv').config();
const HDWalletProvider=require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: process.env.LOCAL_HOST,
      port: process.env.LOCAL_PORT,
      network_id: '*'//any network id
    },
    sepolia:{
      provider:new HDWalletProvider(process.env.MNEMONIC,process.env.RPC_URL_SEPOLIA+process.env.INFURA_API_KEY),
      chainId:11155111,
      skipDryRun:true
    },
    goerli:{
      provider:new HDWalletProvider(process.env.MNEMONIC,process.env.RPC_URL_GOERLI+process.env.INFURA_API_KEY),
      chainId:5,
      skipDryRun:true
    },
    mainnet:{
      provider:new HDWalletProvider(process.env.MNEMONIC,process.env.RPC_URL_MAINNET+process.env.INFURA_API_KEY),
      chainId:1,
      skipDryRun:false
    }
  },
  compilers:{
    solc:{
      version:'0.8.19'
    }
  }
}
