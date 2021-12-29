require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require("dotenv").config()

const { TASK_COMPILE, TASK_NODE } = require("hardhat/builtin-tasks/task-names");
const { task } = require("hardhat/config");
const open = require('open')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("get", "Gets token with ID", async ({tokenId}, {deployments, ethers}) => {
  const deployment = await deployments.get("PortfolioNFT")
  const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi, ethers.provider)
  const tokenURI = await portfolioNFT.tokenURI(tokenId)
  console.log(tokenURI)
}).addParam("tokenId", "ID of the token to get")

task("mint", "Mints NFT", async ({address}, {deployments, ethers}) => {
  const deployment = await deployments.get("PortfolioNFT")
  const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi, ethers.provider)
  const [account] = await ethers.getSigners()
  const tokenId = await portfolioNFT.connect(account).mint(address)
  console.log("Minted", tokenId)
})
.addParam("address", "Owner of NFT")

task("mint-and-get", "Mints NFT", async (_, {deployments, ethers}) => {
  const deployment = await deployments.get("PortfolioNFT")
  const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi, ethers.provider)
  const [account] = await ethers.getSigners()
  const tokenId = await portfolioNFT.connect(account).mint(account.address)
  console.log("Minted", tokenId)

  const tokenURI = await portfolioNFT.tokenURI(1)
  console.log(tokenURI)
})

task("quote", "Gets price for in token in terms of out token", async ({tokenIn, tokenOut}, {deployments, ethers}) => {
  const deployment = await deployments.get("PriceFetcher")
  const priceFetcher = new ethers.Contract(deployment.address, deployment.abi, ethers.provider)
  const [quote, decimals] = await priceFetcher.quote(tokenOut, tokenIn)
  console.log(quote, decimals)
})
.addParam("tokenIn", "Address of token in")
.addParam("tokenOut", "Address of token out")

task("generate", "Outputs 10 random token SVGs", async (taskArgs, hre) => {

  await run(TASK_COMPILE)

  await Promise.race([run(TASK_NODE), new Promise(resolve => setTimeout(resolve, 2_000))]);

  const ERC20 = await ethers.getContractFactory('ERC20PresetMinterPauser')
  const baseToken = await ERC20.deploy('Base Token', 'BASE')

  const PortfolioNFT = await ethers.getContractFactory('PortfolioNFT')
  const portfolioNFT = await PortfolioNFT.deploy(baseToken.address)

  const PortfolioMetadata = await ethers.getContractFactory('PortfolioMetadata')
  const portfolioMetadata = await PortfolioMetadata.deploy(portfolioNFT.address)

  await portfolioNFT.setPortfolioMetadataAddress(portfolioMetadata.address);

  await Promise.all([... new Array(10)].map(async (_, i) => {
    const tokenURI = await portfolioNFT.tokenURI(i)
    const tokenURIDecoded = atob(tokenURI.split(",")[1])
    const imageData = JSON.parse(tokenURIDecoded).image
    const decodedSvg = atob(JSON.parse(tokenURIDecoded).image.split(",")[1])
    console.log(decodedSvg)

    const x = await open(imageData, {app: {name: "google chrome"}})
  }))
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const hardhat = {
  // your basic hardhat config
}

const external = {
  deployments: {
    
  }
}

if (process.env.FORK) {
  hardhat.forking = {
    // your forking config
    url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
    // blockNumber: 13900580
  },
  external.deployments.localhost = ['deployments/polygon']
}


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat,
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.DEPLOYER],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.DEPLOYER],
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [process.env.DEPLOYER],
      etherscan: {
        apiKey: process.env.POLYGONSCAN_API_KEY
      }
    },
  },
  namedAccounts: {
    deployer: 0
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  external
};
