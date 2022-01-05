const {abi:pairFactoryABI} = require("@uniswap/v2-core/build/UniswapV2Factory.json")
const { ethers } = require("ethers")

async function getPathsDetail({tokenIn, tokenOut, baseTokens, pairFactoryAddress, multicallAddress, maxHops=2, provider}) {
  
  tokenIn = ethers.utils.getAddress(tokenIn)
  tokenOut = ethers.utils.getAddress(tokenOut)

  const ethersMulticall = require("ethers-multicall")
  
  const {chainId} = await provider.getNetwork()

  if (multicallAddress) {
    ethersMulticall.setMulticallAddress(chainId, multicallAddress)
  }

  const multicallProvider = new ethersMulticall.Provider(provider, chainId)
  const multicallPairFactory = new ethersMulticall.Contract(pairFactoryAddress, pairFactoryABI) //.format(ethers.utils.FormatTypes.json)

  let makePairs = (arr) => arr.map( (v, i) => arr.slice(i + 1).map(w => [v,w]) ).flat();

  await Promise.all([tokenIn, tokenOut].map(async t => {
    if (!baseTokens.map(b => b.address).includes(t)) {
      baseTokens.push(t)
    }
  }))

  const listOfPairwiseTokens = makePairs(baseTokens)

  const poolTokenMapping = {}

  const getPairs = async (list) => {
    let listOfPromises = list.map(item => {
      return multicallPairFactory.getPair(item[0], item[1])
    })
    return multicallProvider.all(listOfPromises);
  }

  const pairAddresses = await getPairs(listOfPairwiseTokens)
  let listOfPairs = pairAddresses.map((pair, i) => {return {pairAddress: pair, tokens: listOfPairwiseTokens[i]}}).filter(o => o.pairAddress != ethers.constants.AddressZero)
  listOfPairs.forEach(({pairAddress, tokens}) => {
    poolTokenMapping[pairAddress] = tokens
  })
  listOfPairs = Object.keys(poolTokenMapping)

  const involvesToken = (poolAddress, tokenAddress) => {
    return poolTokenMapping[poolAddress].includes(tokenAddress)
  }

  const poolsUsed = (new Array(listOfPairs.length)).fill(false)
  const routes = []

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
      return;
    }

    for (let i = 0; i < listOfPairs.length; i++) {
      if (poolsUsed[i]) {
        continue;
      }

      const curPool = listOfPairs[i];
      const previousTokenOut = _previousTokenOut ? _previousTokenOut : tokenIn;

      if (!involvesToken(curPool, previousTokenOut)) {
        continue;
      }

      const currentTokenOut = poolTokenMapping[curPool][0] === (previousTokenOut)
        ? poolTokenMapping[curPool][1]
        : poolTokenMapping[curPool][0];

      currentRoute.push({poolAddress: curPool, tokenIn: previousTokenOut, tokenOut: currentTokenOut});
      poolsUsed[i] = true;
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
  }

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
  getPathsDetail
}