const {abi:pairABI} = require("@uniswap/v2-core/build/UniswapV2Pair.json")
const {abi:pairFactoryABI} = require("@uniswap/v2-core/build/UniswapV2Factory.json")
const ERC20 = require("@uniswap/v2-core/build/IERC20.json")
const { FACTORY_ADDRESS: UNI_FACTORY_ADDRESS, Trade: UniswapTrade, Pair: UniswapPair } = require('@uniswap/v2-sdk')
const { FACTORY_ADDRESS: SUSHI_FACTORY_ADDRESS, Trade: SushiswapTrade, Pair: SushiswapPair } = require('@sushiswap/core-sdk')
const { CurrencyAmount, Token } = require("@uniswap/sdk-core")
const fetch = require("node-fetch")
const { ethers } = require("ethers")

const tokenListToObject = (array) =>
   array.reduce((obj, item) => {
     obj[item.symbol] = new Token(item.chainId, item.address, item.decimals, item.symbol, item.name)
     return obj
   }, {})

const executeMulticallInBatches = async (calls, batchSize, multicallProvider) => {
  return (await Promise.all(
    [...new Array(Math.floor(calls.length / batchSize)+1)].map(async (_, i) => {
      // console.log(i, multicallBatchSize*i, multicallBatchSize*(i+1))
      const results = await multicallProvider.all(calls.slice(batchSize*i, batchSize*(i+1)))
      return results
    }).flat()
  )).flat()
}

async function getBestSushiswapTrade({tokenInAddress, tokenOutAddress, provider}) {
  const {chainId} = await provider.getNetwork()
  return await getBestTrade({
    tokenInAddress, 
    tokenOutAddress, 
    provider, 
    Pair: SushiswapPair, 
    Trade: SushiswapTrade, 
    FACTORY_ADDRESS: 
    SUSHI_FACTORY_ADDRESS[chainId]})
}

async function getBestUniswapTrade({tokenInAddress, tokenOutAddress, provider}) {
  return await getBestTrade({
    tokenInAddress, 
    tokenOutAddress, 
    provider, 
    Pair: UniswapPair, 
    Trade: UniswapTrade, 
    FACTORY_ADDRESS: 
    UNI_FACTORY_ADDRESS})
}


async function getBestTrade({tokenInAddress, tokenOutAddress, provider, Pair, Trade, FACTORY_ADDRESS}) {
  const ethersMulticall = require("ethers-multicall")
  const {chainId} = await provider.getNetwork()
  const multicallProvider = new ethersMulticall.Provider(provider, chainId)
  const multicallPairFactory = new ethersMulticall.Contract(FACTORY_ADDRESS, pairFactoryABI) //.format(ethers.utils.FormatTypes.json)

  let tokens
  await (async () => {
    let _tokenListUri = 'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
    let tokenList = await fetch(_tokenListUri)
    let tokenListJson = await tokenList.json()
    let filteredTokens = tokenListJson.tokens.filter(function (t) {
      return t.chainId === chainId
    })
    let _tokenList = [...filteredTokens]
    tokens = Object.values(tokenListToObject(_tokenList))
  })()


  let makePairs = (arr) => arr.map( (v, i) => arr.slice(i + 1).map(w => [v,w]) ).flat();

  const getToken = async (tokenAddress) => {
    const token = new ethers.Contract(tokenAddress, ERC20.abi, provider)
    const [symbol, decimals] = await Promise.all([token.symbol(), token.decimals()])
    return new Token(chainId, tokenAddress, decimals, symbol)
  }

  const [tokenIn, tokenOut] = await Promise.all([getToken(tokenInAddress), getToken(tokenOutAddress)])

  let baseTokens = tokens.filter(function (t) {
    return ['DAI', 'USDC', 'USDT', 'FRAX', 'ETH'].includes(t.symbol)
  }).map((el) => {
    return el
  }) 

  let baseTokenByAddress = {}
  baseTokens.forEach(t => {baseTokenByAddress[t.address] = t});

  [tokenIn, tokenOut].forEach(t => {
    if (!baseTokens.map(bt => bt.address).includes(t.address)) {
      baseTokens.push(t)
    }
  })

  let listOfPairwiseTokens = makePairs(baseTokens)
  const tokensByPairAddress = {}

  const getPairs = async (list) => {
    let listOfPromises = list.map(item => {
      const pairAddress = Pair.getAddress(item[0], item[1])
      tokensByPairAddress[pairAddress] = item
      return multicallPairFactory.getPair(item[0].address, item[1].address)
    })
    return multicallProvider.all(listOfPromises);
  }

  let listOfPairs = (await getPairs(listOfPairwiseTokens)).filter(addr => addr != ethers.constants.AddressZero)
  const reserves = await multicallProvider.all(listOfPairs.map((pairAddress) => {
    const multicallPair = new ethersMulticall.Contract(pairAddress, pairABI) //.format(ethers.utils.FormatTypes.json)
    return multicallPair.getReserves() 
  }))

  const pairs = listOfPairs.map((pairAddress, i) => {
    const [token0Amount, token1Amount] = reserves[i]
    const [token0, token1] = tokensByPairAddress[pairAddress]
    const pair = new Pair(
      CurrencyAmount.fromRawAmount(token0, token0Amount.toString()),
      CurrencyAmount.fromRawAmount(token1, token1Amount.toString()),
    )
    // console.log(pair)
    return pair
  })

  console.log(pairs,
    new CurrencyAmount.fromRawAmount(tokenIn, ethers.utils.parseUnits("1"), tokenIn.decimals),
    tokenOut,
    {maxNumResults: 1})

  const bestTrade = Trade.bestTradeExactIn(
    pairs,
    new CurrencyAmount.fromRawAmount(tokenIn, ethers.utils.parseUnits("1"), tokenIn.decimals),
    tokenOut,
    {maxNumResults: 1}
  ).length > 0 ? bestTrade[0] : null

  return bestTrade.route.pairs.map(pair => pair.liquidityToken.address)
}

async function getPathsDetail({tokenIn, tokenOut, pairFactoryAddress, multicallAddress, maxHops=2}) {
  tokenIn = ethers.utils.getAddress(tokenIn)
  tokenOut = ethers.utils.getAddress(tokenOut)
  
  const ethersMulticall = require("ethers-multicall")
  const pairFactory = new ethers.Contract(pairFactoryAddress, pairFactoryABI, ethers.provider)
  
  const poolCount = await pairFactory.allPairsLength()
  const {chainId} = await ethers.provider.getNetwork()

  if (multicallAddress) {
    ethersMulticall.setMulticallAddress(chainId, multicallAddress)
  }

  const multicallProvider = new ethersMulticall.Provider(ethers.provider, chainId)
  const multicallPairFactory = new ethersMulticall.Contract(pairFactoryAddress, pairFactoryABI) //.format(ethers.utils.FormatTypes.json)

  const multicallBatchSize = 10

  // console.log(poolCount.toNumber(), "pools")
  const poolCalls = [...new Array(poolCount.toNumber())].map((_, i) => {
    return multicallPairFactory.allPairs(i)
  })

  const poolAddresses = await executeMulticallInBatches(poolCalls, multicallBatchSize, multicallProvider)

  // console.log("done", poolAddresses)

  const poolTokenMapping = {}
  const token0Calls = poolAddresses.map(poolAddress => {
    const poolContract = new ethersMulticall.Contract(poolAddress, UniswapV2Pair.abi)
    return poolContract.token0()
  })
  const token1Calls = poolAddresses.map(poolAddress => {
    const poolContract = new ethersMulticall.Contract(poolAddress, UniswapV2Pair.abi)
    return poolContract.token1()
  })

  const token0s = await executeMulticallInBatches(token0Calls, multicallBatchSize, multicallProvider)
  token0s.forEach((address, i) => poolTokenMapping[poolAddresses[i]] = [address])
  const token1s = await executeMulticallInBatches(token1Calls, multicallBatchSize, multicallProvider)
  token1s.forEach((address, i) => poolTokenMapping[poolAddresses[i]].push(address))


  // const fs = require("fs")
  // const poolTokenMapping = JSON.parse(fs.readFileSync("test.json"))
  // const poolAddresses = Object.keys(poolTokenMapping)
  // fs.writeFileSync("test-mainnet.json", JSON.stringify(poolTokenMapping))

  const involvesToken = (poolAddress, tokenAddress) => poolTokenMapping[poolAddress].includes(tokenAddress)

  const poolsUsed = (new Array(poolAddresses.length)).fill(false);
  const routes = []; // [(pool address, tokenIn, tokenOut)]

  const computeRoutes = (
    tokenIn,
    tokenOut,
    currentRoute,
    poolsUsed,
    _previousTokenOut
  ) => {
    if (currentRoute.length > maxHops) {
      return;
    }

    if (
      currentRoute.length > 0 &&
      involvesToken(currentRoute[currentRoute.length - 1].poolAddress, tokenOut)
    ) {
      routes.push([...currentRoute]);
      // console.log("route found", [...currentRoute])
      return;
    }

    for (let i = 0; i < poolAddresses.length; i++) {
      if (poolsUsed[i]) {
        continue;
      }

      const curPool = poolAddresses[i];
      const previousTokenOut = _previousTokenOut ? _previousTokenOut : tokenIn;

      if (!involvesToken(curPool, previousTokenOut)) {
        continue;
      }

      const currentTokenOut = poolTokenMapping[curPool][0] === (previousTokenOut)
        ? poolTokenMapping[curPool][1]
        : poolTokenMapping[curPool][0];

      currentRoute.push({poolAddress: curPool, tokenIn: previousTokenOut, tokenOut: currentTokenOut});
      poolsUsed[i] = true;
      // console.log(count++, currentTokenOut)
      computeRoutes(
        tokenIn,
        tokenOut,
        currentRoute,
        poolsUsed,
        currentTokenOut
      );
      poolsUsed[i] = false;
      currentRoute.pop();
    }
  };

  computeRoutes(tokenIn, tokenOut, [], poolsUsed, undefined);

  return routes
}


async function getPaths(args) {
  const pathDetails = await getPathsDetail(args) 

  const paths = pathDetails.map(path => path.map(pool => pool.poolAddress))

  return paths
}


module.exports = {
  getPaths,
  getPathsDetail,
  getBestUniswapTrade,
  getBestSushiswapTrade
}