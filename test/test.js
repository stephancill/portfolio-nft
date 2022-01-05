const { expect } = require("chai");
const { ethers } = require("hardhat");
const BN = ethers.BigNumber
const UniswapV2Pair = require("@uniswap/v2-core/build/UniswapV2Pair.json")
const IERC20 = require("@uniswap/v2-core/build/IERC20.json")
const { getPaths, getPathsDetail } = require("./../tasks/portfolio-nft")

async function deployUniswap({deployer, WETH}) {
  const UniswapV2FactoryCompilerOutput =  require("@uniswap/v2-core/build/UniswapV2Factory.json")
  const UniswapV2FactoryBytecode = UniswapV2FactoryCompilerOutput.bytecode
  const UniswapV2FactoryABI = UniswapV2FactoryCompilerOutput.abi
  const UniswapV2FactoryFactory = new ethers.ContractFactory(UniswapV2FactoryABI, UniswapV2FactoryBytecode, deployer)

  const uniswapFactory = await UniswapV2FactoryFactory.deploy(deployer.address)
 
  const UniswapV2RouterCompilerOutput =  require("@uniswap/v2-periphery/build/UniswapV2Router02.json")
  const UniswapV2RouterBytecode = UniswapV2RouterCompilerOutput.bytecode
  const UniswapV2RouterABI = UniswapV2RouterCompilerOutput.abi
  const UniswapV2RouterFactory = new ethers.ContractFactory(UniswapV2RouterABI, UniswapV2RouterBytecode, deployer)

  const uniswapRouter = await UniswapV2RouterFactory.deploy(uniswapFactory.address, WETH.address)

  return {factory: uniswapFactory, router: uniswapRouter}
}

async function createPairWithPrice({signer, pairFactory, router, baseToken, otherToken, price, liquidityMagnitude=10e6}) {
  price = BN.from(price);

  const otherTokenDecimals = await otherToken.decimals()
  const baseTokenDecimals = await baseToken.decimals()
  
  await pairFactory.createPair(otherToken.address, baseToken.address)

  const tokenLPAmount = ethers.utils.parseUnits(liquidityMagnitude.toString(), otherTokenDecimals)
  const baseLPAmount = ethers.utils.parseUnits(price.mul((liquidityMagnitude).toString()).toString(), baseTokenDecimals)

  await otherToken.mint(signer.address, tokenLPAmount)
  await baseToken.mint(signer.address, baseLPAmount)

  // Approve router to transfer liquidity tokens
  await otherToken.connect(signer).approve(router.address, ethers.utils.parseUnits("10000000000000000", otherTokenDecimals))
  await baseToken.connect(signer).approve(router.address, ethers.utils.parseUnits("1000000000000000", baseTokenDecimals))

  // Add liquidity
  await router.connect(signer).addLiquidity(
    baseToken.address,
    otherToken.address,
    baseLPAmount,
    tokenLPAmount,
    baseLPAmount,
    tokenLPAmount,
    signer.address,
    BN.from("10000000000000000000")
  )
}

async function deployTokens({decimals=18, mintAccount=undefined, mintAmount=100_000, numberOfTokens=10}) {
  const tokens = Promise.all([...new Array(numberOfTokens)].map(async (_, i) => {
    const ERC20 = await ethers.getContractFactory('ERC20PresetMinterPauser')
    const token = await ERC20.deploy(`Token ${i+1}`, `TOKEN${i+1}`)
    if (mintAccount) {
      await token.mint(mintAccount, ethers.utils.parseUnits(`${mintAmount}`, decimals))
    }
    return token
  }))
  return tokens
}

async function priceOf(pairAddress, tokenAddress, DECIMALS) {
  const pair = new ethers.Contract(pairAddress, UniswapV2Pair.abi, ethers.provider)
  const [token0, token1] = await Promise.all([await pair.token0(), await pair.token1()])
  const otherTokenAddress = token0 == tokenAddress ? token1 : token0

  let [res0, res1] = await pair.getReserves()

  if (token0 != otherTokenAddress) {
    const tmp = res0
    res0 = res1
    res1 = tmp
  }

  const [tokenDecimals, otherTokenDecimals] = await Promise.all([
    await new ethers.Contract(tokenAddress, IERC20.abi, ethers.provider).decimals(),
    await new ethers.Contract(otherTokenAddress, IERC20.abi, ethers.provider).decimals()
  ])
  res0 = res0.mul(BN.from("10").pow(tokenDecimals.toString()))
  res1 = res1.mul(BN.from("10").pow((otherTokenDecimals-DECIMALS).toString()))

  const price = res0.div(res1)
  return price
}

describe("PriceFetcher tests", function () {
  let deployer
  let account1
  let account2
  let account3
  let account4
  let WETH
  let priceFetcher
  let baseToken
  let pairFactory
  let router
  let multicall

  before(async () => {
    [deployer, account1, account2, account3, account4] = await ethers.getSigners()
    const ERC20 = await ethers.getContractFactory('ERC20PresetMinterPauser')
    baseToken = await ERC20.deploy('Base Token', 'BASE')
    const decimals = await baseToken.decimals()
    await baseToken.mint(account1.address, ethers.utils.parseUnits("2000", decimals))

    WETH = await ERC20.deploy('Wrapped Test Ether', 'WTETH')

    // Deploy uniswap pool
    const {factory: _pairFactory, router: _router} = await deployUniswap({deployer, WETH})
    pairFactory = _pairFactory
    router = _router
    const PriceFetcher = await ethers.getContractFactory('PriceFetcher')
    priceFetcher = await PriceFetcher.deploy()
    priceFetcher["quote"] = priceFetcher["quote(address,address)"]

    const Multicall = await ethers.getContractFactory("Multicall")
    multicall = await Multicall.deploy()
  })

  it("Fetches prices for indirect pairs", async () => {
    // token1/token2 token2/baseToken
    const [token1, token2, token3, token4, token5] = await deployTokens({})
    const tokenToSymbolMapping = {}
    Promise.all([token1, token2, token3, token4, token5, baseToken].map(async (token) => {
      const symbol = await token.symbol()
      tokenToSymbolMapping[token.address] = symbol
    }))
    
    const prices = [
      {
        baseToken: token2,
        otherToken: token1,
        price: 3 
      },
      {
        baseToken: token3,
        otherToken: token2,
        price: 5
      },
      {
        baseToken: token4,
        otherToken: token2,
        price: 7 
      },
      {
        baseToken: token5,
        otherToken: token4,
        price: 13 
      },
      {
        baseToken: baseToken,
        otherToken: token5,
        price: 17 
      },
      {
        baseToken: baseToken,
        otherToken: token3,
        price: 19 
      }
    ]

    await Promise.all(prices.map(async (price) => {
      await createPairWithPrice({
        signer: account2,
        pairFactory,
        router,
        ...price
      })
    }))

    const DECIMALS = await priceFetcher.DECIMALS()

    Promise.all(
      [
        [baseToken.address, token5.address],  // 0 hops
        [baseToken.address, token2.address],  // 2 hops
        [baseToken.address, token1.address]   // 3 hops
      ].map(async ([tokenOutAddress, tokenInAddress]) => {
        const paths = await getPathsDetail({
          pairFactoryAddress: pairFactory.address, 
          multicallAddress: multicall.address, 
          baseTokens: Object.keys(tokenToSymbolMapping),
          tokenIn: tokenInAddress, 
          tokenOut: tokenOutAddress,
          provider: ethers.provider
        })// TODO: returning empty
        const path = paths[0] || []
        let routePrice = BN.from("0")
        await Promise.all(path.map(async (pair) => {
          // console.log(pair)
          const {poolAddress, tokenIn, tokenOut} = pair
          const calculatedPrice = (await priceOf(poolAddress, tokenIn, DECIMALS))
          if (routePrice == 0) {
            routePrice = calculatedPrice;
          } else {
            routePrice *= calculatedPrice.div(BN.from(10**DECIMALS).toString());
          }
        })) 
        routePrice = routePrice / 10**DECIMALS

        const pathString = []

        path.forEach(p => {
          pathString.push(p.poolAddress)
        })

        
        let [contractPrice] = await priceFetcher.quote(pathString, tokenInAddress, tokenOutAddress)
        contractPrice = contractPrice / 10**DECIMALS
        
        expect(contractPrice).to.equal(routePrice)
      })
    )
  })

  it('Should return a zero price for a token with no route', async () => {
    const [token1, token2, token3, token4, token5, noLiqToken] = await deployTokens({})
    const prices = [
      {
        baseToken: token2,
        otherToken: token1,
        price: 5 
      },
      {
        baseToken: token3,
        otherToken: token2,
        price: 10 
      },
      {
        baseToken: baseToken,
        otherToken: token3,
        price: 15 
      },
      {
        baseToken: token4,
        otherToken: token5,
        price: 15 
      },
    ]

    await Promise.all(prices.map(async (price) => {
      await createPairWithPrice({
        signer: account2,
        pairFactory,
        router,
        ...price
      })
    }))

    let [contractPrice, DECIMALS] = await priceFetcher.quote([], ethers.constants.AddressZero, ethers.constants.AddressZero)
    contractPrice = contractPrice / 10**DECIMALS
    expect(contractPrice).to.equal(0)
  })

})

describe("BalanceNFT Tests", function () {
  let deployer
  let account1
  let account2
  let account3
  let account4
  let token1
  let token2
  let token3
  let token4
  let token5
  let WETH
  let portfolioNFT
  let portfolioMetadata
  let priceFetcher
  let baseToken

  let pairFactory
  let multicall

  before(async () => {
    [deployer, account1, account2, account3, account4] = await ethers.getSigners()

    const ERC20 = await ethers.getContractFactory('ERC20PresetMinterPauser')
    
    token1 = await ERC20.deploy('Token 1', 'TOKEN1')
    const decimals = await token1.decimals()
    await token1.mint(account1.address, ethers.utils.parseUnits("1000", decimals))

    token2 = await ERC20.deploy('Token 2', 'TOKEN2')
    await token2.mint(account1.address, ethers.utils.parseUnits("10000", decimals))

    token3 = await ERC20.deploy('Token 3', 'TOKEN3')
    await token3.mint(account1.address, ethers.utils.parseUnits("10000", decimals))

    token4 = await ERC20.deploy('Token 4', 'TOKEN4')
    await token4.mint(account1.address, ethers.utils.parseUnits("0.100", decimals))

    token5 = await ERC20.deploy('Token 5', 'TOKEN5')
    await token5.mint(account1.address, ethers.utils.parseUnits("0.1", decimals))

    baseToken = await ERC20.deploy('Base Token', 'BASE')
    await baseToken.mint(account1.address, ethers.utils.parseUnits("2000", decimals))

    WETH = await ERC20.deploy('Wrapped Test Ether', 'WTETH')

    // Deploy uniswap pool
    const {factory: _pairFactory, router} = await deployUniswap({deployer, WETH})
    pairFactory = _pairFactory

    await Promise.all([token1, token2, WETH, token3, token4, token5].map(async (token, i) => {
      await createPairWithPrice({
        signer: account2,
        pairFactory,
        router,
        baseToken,
        otherToken: token,
        price: 200 * (i+1) 
      })
    }))

    const Multicall = await ethers.getContractFactory("Multicall")
    multicall = await Multicall.deploy()
    
    const PriceFetcher = await ethers.getContractFactory('PriceFetcher')
    priceFetcher = await PriceFetcher.deploy()
    // priceFetcher["quote"] = priceFetcher["quote(address,address)"]
    // Gas estimate
    // let totalGas = BN.from("0")
    // const a = [priceFetcher, portfolioNFT, portfolioMetadata].map(contract => {
    //   console.log(contract.deployTransaction.gasLimit)
    //   totalGas.add(contract.deployTransaction.gasLimit)
    // })

    // console.log(totalGas)
  })

  beforeEach(async () => {
    const PortfolioNFT = await ethers.getContractFactory('PortfolioNFT')

    const pairAddress = await pairFactory.getPair(WETH.address, baseToken.address)
    const WETHSymbol = (await WETH.symbol()).slice(1)

    portfolioNFT = await PortfolioNFT.deploy("Test Portfolio NFT", "TPNFT")

    await portfolioNFT.setPriceFetcherAddress(priceFetcher.address)
    await portfolioNFT.setBaseTokenAddress(baseToken.address)
    await portfolioNFT.setWETH(WETH.address, WETHSymbol, [pairAddress])

    const PortfolioMetadata = await ethers.getContractFactory('PortfolioMetadata')
    portfolioMetadata = await PortfolioMetadata.deploy(portfolioNFT.address)

    await portfolioNFT.setPortfolioMetadataAddress(portfolioMetadata.address)
  })

  it("Should mint tokens to address", async function () {
    expect(await token1.balanceOf(account1.address)).to.equal(ethers.utils.parseUnits("1000"))
  });

  it("Should track WETH by default", async function () {
    await portfolioNFT.connect(account1).mint(account1.address)
    const tokenId = 1
    const trackedTokens = await portfolioNFT.getTokenAddresses(tokenId)
    expect(trackedTokens.length).to.equal(1)
    expect(trackedTokens[0]).to.equal(WETH.address)
  })

  it("Should track tokens", async function () {
    await portfolioNFT.connect(account1).mint(account1.address)
    const tokenId = 1
    const trackedTokensBefore = await portfolioNFT.getTokenAddresses(tokenId)

    // TODO: Test path checks
    await portfolioNFT.connect(account1).trackToken(tokenId, token1.address, [])
    const trackedTokensAfter = await portfolioNFT.getTokenAddresses(tokenId)

    expect(trackedTokensBefore.length+1).to.equal(trackedTokensAfter.length)
    expect(trackedTokensAfter).to.contain(token1.address)
  })

  it("Should batch track tokens", async function () {
    await portfolioNFT.connect(account1).mint(account1.address)
    const tokenId = 1
    const trackedTokensBefore = await portfolioNFT.getTokenAddresses(tokenId)

    await portfolioNFT.connect(account1).trackTokens(tokenId, [token1.address, token2.address], [[], []])
    const trackedTokensAfter = await portfolioNFT.getTokenAddresses(tokenId)

    expect(trackedTokensBefore.length+2).to.equal(trackedTokensAfter.length)
    expect(trackedTokensAfter).to.contain(token1.address)
    expect(trackedTokensAfter).to.contain(token2.address)
  })

  it("Should remove tracked tokens", async function () {
    await portfolioNFT.connect(account1).mint(account1.address)
    const tokenId = 1
    let trackedTokensBefore = await portfolioNFT.getTokenAddresses(tokenId)

    await portfolioNFT.connect(account1).trackToken(tokenId, token1.address, [])
    let trackedTokensAfter = await portfolioNFT.getTokenAddresses(tokenId)

    expect(trackedTokensBefore.length+1).to.equal(trackedTokensAfter.length)
    expect(trackedTokensAfter).to.contain(token1.address)

    trackedTokensBefore = trackedTokensAfter

    await portfolioNFT.connect(account1).removeToken(tokenId, token1.address)

    trackedTokensAfter = await portfolioNFT.getTokenAddresses(tokenId)

    expect(trackedTokensBefore.length-1).to.equal(trackedTokensAfter.length)
    expect(trackedTokensAfter).not.to.contain(token1.address)
  })

  it("Should batch remove tracked tokens", async function () {
    await portfolioNFT.connect(account1).mint(account1.address)
    const tokenId = 1
    let trackedTokensBefore = await portfolioNFT.getTokenAddresses(tokenId)

    await portfolioNFT.connect(account1).trackTokens(tokenId, [token1.address, token2.address], [[],[]])
    let trackedTokensAfter = await portfolioNFT.getTokenAddresses(tokenId)

    expect(trackedTokensBefore.length+2).to.equal(trackedTokensAfter.length)
    expect(trackedTokensAfter).to.contain(token1.address)
    expect(trackedTokensAfter).to.contain(token2.address)

    trackedTokensBefore = trackedTokensAfter

    await portfolioNFT.connect(account1).removeTokens(tokenId, [token1.address, token2.address])

    trackedTokensAfter = await portfolioNFT.getTokenAddresses(tokenId)

    expect(trackedTokensBefore.length-2).to.equal(trackedTokensAfter.length)
    expect(trackedTokensAfter).not.to.contain(token1.address)
    expect(trackedTokensAfter).not.to.contain(token2.address)
  })

  it("Should produce the correct SVG data", async function () {
    await portfolioNFT.connect(account1).mint(account1.address)
    
    const tokenId = 1
    
    const WETHSymbol = await portfolioNFT.WETHSymbol()
    const actualWETHSymbol = await WETH.symbol()

    expect(WETHSymbol).to.equal(actualWETHSymbol.slice(1))

    const trackedTokens = [token1, token2, token3, token4, token5, baseToken, WETH]
    const tokenAddresses = trackedTokens.map(t => t.address)

    await Promise.all(trackedTokens.map(async (token) => {
      const pricePath = (await getPaths({
        pairFactoryAddress: pairFactory.address, 
        multicallAddress: multicall.address, 
        tokenIn: token.address, 
        baseTokens: tokenAddresses,
        tokenOut: baseToken.address,
        provider: ethers.provider
      }))[0] || []
      await portfolioNFT.connect(account1).trackToken(tokenId, token.address, pricePath)
    }))

    const tokenDetails = await Promise.all(trackedTokens.map(async (token) => {
      let balance = await token.connect(account1).balanceOf(account1.address)
      let symbol = await token.symbol()
      if (token.address === WETH.address) {
        const ethBalance = await ethers.provider.getBalance(account1.address)
        balance = balance.add(ethBalance.toString())
        symbol = WETHSymbol
      }
      const decimals = await token.decimals() 
      const pricePath = (await getPaths({
        tokenIn: token.address, 
        tokenOut: baseToken.address, 
        baseTokens: [baseToken.address], 
        pairFactoryAddress: pairFactory.address, 
        multicallAddress: multicall.address,
        provider: ethers.provider
      }))[0] || []

      const [price, priceDecimals] = await priceFetcher.quote(pricePath, token.address, baseToken.address)
      const value = price.mul(balance).div((10**priceDecimals).toString())
      return {balance, address: token.address, symbol, decimals, price, value, pricePath}
    }))
    
    const tokenURI = await portfolioNFT.connect(account1).tokenURI(tokenId)
    const tokenURIDecoded = atob(tokenURI.split(",")[1])
    const decodedSvg = atob(JSON.parse(tokenURIDecoded).image.split(",")[1])

    // console.log(decodedSvg)
    console.log(JSON.parse(tokenURIDecoded).image)

    tokenDetails.sort((a, b) => b.value.sub(a.value)).splice(0, 4).map(({balance, symbol, decimals, value, address}) => {
      expect(decodedSvg).to.contain(symbol)
      let [whole, fraction] = ethers.utils.commify(ethers.utils.formatUnits(balance, decimals)).split(".")
      const balanceString = `${whole}.${fraction.slice(0,3)}`
      expect(decodedSvg).to.contain(balanceString)
      expect(decodedSvg).to.contain(`$${ethers.utils.commify(ethers.utils.formatUnits(value, decimals)).split(".")[0]}`) // TODO: Round bignumber instead of this
    })    
  })
});

// TODO: Test PriceFetcher
// TODO: Test OStrings.toStringCommaFormat