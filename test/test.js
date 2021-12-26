const { expect } = require("chai");
const { ethers } = require("hardhat");
const BN = ethers.BigNumber

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
  let balanceWatcherNFT
  let priceFetcher
  let baseToken

  let pairFactory

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

    WETH = await ERC20.deploy('Wrapped Ether', 'WETH')

    // Deploy uniswap pool
    const {factory: _pairFactory, router} = await deployUniswap({deployer, WETH})
    pairFactory = _pairFactory

    await Promise.all([token1, token2, token3, token4, token5].map(async (token, i) => {
      await pairFactory.createPair(token.address, baseToken.address)

      const price = BN.from(200 * (i+1))
      const tokenLPAmount = ethers.utils.parseUnits(`${1_000_000}`, decimals)
      const baseLPAmount = ethers.utils.parseUnits(price.mul("1000000").toString(), decimals+i)
      
      await token.mint(account2.address, tokenLPAmount)
      await baseToken.mint(account2.address, baseLPAmount)

      // Approve router to transfer liquidity tokens
      await token.connect(account2).approve(router.address, ethers.utils.parseUnits("10000000000000000", decimals))
      await baseToken.connect(account2).approve(router.address, ethers.utils.parseUnits("1000000000000000", decimals))

      // Add liquidity
      await router.connect(account2).addLiquidity(
        baseToken.address,
        token.address,
        baseLPAmount,
        tokenLPAmount,
        baseLPAmount,
        tokenLPAmount,
        account2.address,
        BN.from("10000000000000000000")
      )
    }))
    
    const PriceFetcher = await ethers.getContractFactory('PriceFetcher')
    priceFetcher = await PriceFetcher.deploy(pairFactory.address)

    const BalanceWatcherNFT = await ethers.getContractFactory('BalanceWatcherNFT')
    balanceWatcherNFT = await BalanceWatcherNFT.deploy(baseToken.address, priceFetcher.address)
  })

  beforeEach(async () => {
    
  })

  it("Should deploy uniswap pairs", async function() {
    const pairsLength = await pairFactory.allPairsLength()
    expect(pairsLength).to.not.equal(0)
    const pairAddress = await pairFactory.getPair(token1.address, baseToken.address)
    expect(pairAddress.indexOf("0x0000000000000000")).to.equal(-1)
    const pairAddressSwapped = await pairFactory.getPair(baseToken.address, token1.address)
    expect(pairAddressSwapped.indexOf("0x0000000000000000")).to.equal(-1)
  })

  it("Should mint tokens to address", async function () {
    expect(await token1.balanceOf(account1.address)).to.equal(ethers.utils.parseUnits("1000"))
  });

  it("Should produce the correct SVG data", async function () {
    await balanceWatcherNFT.mint(account1.address)
    
    const tokenId = 1

    const trackedTokens = [token1, token2, token3, token4, token5, baseToken]
    const tokenDetails = await Promise.all(trackedTokens.map(async (token) => {
      const balance = await token.connect(account1).balanceOf(account1.address)
      const symbol = await token.symbol()
      const decimals = await token.decimals() 
      const price = await priceFetcher.quote(baseToken.address, token.address)
      const value = price.mul(balance)
      return {balance, address: token.address, symbol, decimals, price, value}
    }))

    await Promise.all(trackedTokens.map(async (token) => {
      await balanceWatcherNFT.connect(account1).trackToken(tokenId, token.address)
    }))
    
    const tokenURI = await balanceWatcherNFT.tokenURI(tokenId)
    const tokenURIDecoded = atob(tokenURI.split(",")[1])
    const decodedSvg = atob(JSON.parse(tokenURIDecoded).image.split(",")[1])

    console.log(decodedSvg)

    tokenDetails.sort((a, b) => b.value.sub(a.value)).splice(0, 4).map(({balance, symbol, decimals, value}) => {
      expect(decodedSvg).to.contain(symbol)
      expect(decodedSvg).to.contain(ethers.utils.commify(ethers.utils.formatUnits(balance, decimals)))
      expect(decodedSvg).to.contain(`$${ethers.utils.commify(ethers.utils.formatUnits(value, decimals)).replace(".0", "")}`) // TODO: Round bignumber instead of this
    })
  })
});

// TODO: Test PriceFetcher
// TODO: Test OStrings.toStringCommaFormat