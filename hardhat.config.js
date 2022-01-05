require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require("dotenv").config()

const { TASK_COMPILE, TASK_NODE } = require("hardhat/builtin-tasks/task-names");
const { task } = require("hardhat/config");
const open = require('open')
const fetch = require("node-fetch")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("show", "Show token with ID", async ({tokenId}, {deployments, ethers}) => {
  const deployment = await deployments.get("PortfolioNFT")
  const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi, ethers.provider)
  const tokenURI = await portfolioNFT.tokenURI(tokenId)
  const svg = JSON.parse(atob(tokenURI.split(",")[1])).image
  const open = require("open")
  await open(svg, {app: {name: "google chrome"}})
}).addParam("tokenId", "ID of the token to get")

task("transfer", "Transfer token to address", async ({tokenId, toAddress}, {deployments, ethers}) => {
  const deployment = await deployments.get("PortfolioNFT")
  const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi, ethers.provider)
  const [account] = await ethers.getSigners()
  await portfolioNFT.connect(account).transferFrom(account.address, toAddress, tokenId)
}).addParam("tokenId", "ID of the token to get")
.addParam("toAddress", "Recipient address")

task("mint", "Mints NFT", async ({address}, {deployments, ethers}) => {
  const deployment = await deployments.get("PortfolioNFT")
  const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi, ethers.provider)
  const [account] = await ethers.getSigners()
  const tx = await portfolioNFT.connect(account).mint(address)
  const txInfo = await tx.wait()
  const tokenId = txInfo.events[0].args.tokenId.toString()
  console.log("Minted", {tokenId})
})
.addParam("address", "Owner of NFT")

task("track-token", "Gets route and tracks token for tokenId", async ({tokenId, tokenAddress}, {deployments, ethers, getNamedAccounts}) => {
  const PortfolioNFT = await deployments.get("PortfolioNFT")
  const PriceFetcher = await deployments.get("PriceFetcher")
  const PairFactory = await deployments.get("UniswapV2Factory")
  const portfolioNFT = new ethers.Contract(PortfolioNFT.address, PortfolioNFT.abi, ethers.provider)
  const priceFetcher = new ethers.Contract(PriceFetcher.address, PriceFetcher.abi, ethers.provider)
  const [account] = await ethers.getSigners()
  const {deployer} = await getNamedAccounts()
  
  const {getPaths} = require("./tasks/portfolio-nft")
  const baseTokenAddress = await portfolioNFT.baseTokenAddress()


  const {chainId} = await ethers.provider.getNetwork()

  let tokens
  await (async () => {
    let _tokenListUri = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
    let tokenList = await fetch(_tokenListUri)
    let tokenListJson = await tokenList.json()
    let filteredTokens = tokenListJson.tokens.filter(function (t) {
      return t.chainId === chainId
    })
    tokens = [...filteredTokens]
  })()

  let baseTokens = tokens.filter(function (t) {
    return ['DAI', 'USDC', 'USDT', 'FRAX', 'ETH'].includes(t.symbol)
  }).map((el) => {
    return el.address
  }) 

  const paths = await getPaths({
    tokenIn: tokenAddress, 
    tokenOut: baseTokenAddress, 
    baseTokens: baseTokens, 
    pairFactoryAddress: PairFactory.address, 
    provider: ethers.provider
  })

  const tx = await portfolioNFT.connect(account).trackToken(tokenId, tokenAddress, paths[0])
  await tx.wait()

  console.log("Done", tokenAddress, paths[0])
})
.addParam("tokenId", "Owner of NFT")
.addParam("tokenAddress", "Owner of NFT")

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
  const WETH = await ERC20.deploy('Wrapped Ether', 'WETH')

  const PortfolioNFT = await ethers.getContractFactory('PortfolioNFT')
  const portfolioNFT = await PortfolioNFT.deploy("Portfolio NFT", "PNFT", baseToken.address, WETH.address, "WETH", [])

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

let hardhat = {
  // your basic hardhat config
}

const external = {
  deployments: {
    
  }
}

const hhNetworkOverrides = {
  polygon: {
    chainId: 137,
    forking: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    }
  },
  mainnet: {
    chainId: 1,
    forking: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
    }
  }
}

// WARNING: WILL USE DEPLOYED CONTRACTS EVEN IF REDEPLOYED LOCALLY (e.g. PortfolioNFT won't update)
if (process.env.FORK) {
  hardhat = {
    ...hardhat,
    ...hhNetworkOverrides[process.env.FORK]
  }
  external.deployments.localhost = [`deployments/${process.env.FORK}`]
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
    apiKey: {
      rinkeby: process.env.ETHERSCAN_API_KEY,
      ropsten: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
    }
  },
  external
};
