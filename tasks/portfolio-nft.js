const UniswapV2Pair = require("@uniswap/v2-core/build/UniswapV2Pair.json")

async function getPathsDetail({tokenIn, tokenOut, pairFactoryAddress, multicallAddress, maxHops=5}) {
  const ethersMulticall = require("ethers-multicall")
  console.log(tokenIn, tokenOut, pairFactoryAddress, multicallAddress)
  const {abi:pairFactoryABI} = require("@uniswap/v2-core/build/UniswapV2Factory.json")
  const pairFactory = new ethers.Contract(pairFactoryAddress, pairFactoryABI, ethers.provider)
  
  const poolCount = await pairFactory.allPairsLength()
  const {chainId} = await ethers.provider.getNetwork()
  const network = await ethers.provider.getNetwork()
  console.log(network.chainId, chainId)

  if (multicallAddress) {
    ethersMulticall.setMulticallAddress(chainId, multicallAddress)
  }

  const multicallProvider = new ethersMulticall.Provider(ethers.provider, chainId)
  const multicallPairFactory = new ethersMulticall.Contract(pairFactoryAddress, pairFactoryABI) //.format(ethers.utils.FormatTypes.json)

  const poolCalls = [...new Array(poolCount.toNumber())].map((_, i) => {
    return multicallPairFactory.allPairs(i)
  })

  const poolAddresses = await multicallProvider.all(poolCalls)
  const poolTokenMapping = {}
  const token0Calls = poolAddresses.map(poolAddress => {
    const poolContract = new ethersMulticall.Contract(poolAddress, UniswapV2Pair.abi)
    return poolContract.token0()
  })
  const token1Calls = poolAddresses.map(poolAddress => {
    const poolContract = new ethersMulticall.Contract(poolAddress, UniswapV2Pair.abi)
    return poolContract.token1()
  })

  const token0s = await multicallProvider.all(token0Calls)
  token0s.forEach((address, i) => poolTokenMapping[poolAddresses[i]] = [address])
  const token1s = await multicallProvider.all(token1Calls)
  token1s.forEach((address, i) => poolTokenMapping[poolAddresses[i]].push(address))

  console.log(poolTokenMapping[poolAddresses[12]])

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
      console.log("route found")
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
      console.log({poolAddress: curPool, tokenIn: previousTokenOut, tokenOut: currentTokenOut})
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
  };

  computeRoutes(tokenIn, tokenOut, [], poolsUsed, undefined);

  return routes
}


async function getPaths(args) {
  const pathDetails = await getPathsDetail(args) 

  const paths = []

  pathDetails.map(r => {
    const path = []
    r.forEach(({tokenIn, tokenOut}) => {
      if (!path.includes(tokenIn)) {
        path.push(tokenIn)
      }
      if (!path.includes(tokenOut)) {
        path.push(tokenOut)
      }
    })
    paths.push(path)
  })

  return paths
}


module.exports = {
  getPaths,
  getPathsDetail
}