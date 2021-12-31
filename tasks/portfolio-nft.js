const UniswapV2Pair = require("@uniswap/v2-core/build/UniswapV2Pair.json")

async function getPathsDetail({tokenIn, tokenOut, pairFactoryAddress, multicallAddress, maxHops=2}) {
  tokenIn = ethers.utils.getAddress(tokenIn)
  tokenOut = ethers.utils.getAddress(tokenOut)
  
  const ethersMulticall = require("ethers-multicall")

  const {abi:pairFactoryABI} = require("@uniswap/v2-core/build/UniswapV2Factory.json")
  const pairFactory = new ethers.Contract(pairFactoryAddress, pairFactoryABI, ethers.provider)
  
  const poolCount = await pairFactory.allPairsLength()
  const {chainId} = await ethers.provider.getNetwork()

  if (multicallAddress) {
    ethersMulticall.setMulticallAddress(chainId, multicallAddress)
  }

  const multicallProvider = new ethersMulticall.Provider(ethers.provider, chainId)
  const multicallPairFactory = new ethersMulticall.Contract(pairFactoryAddress, pairFactoryABI) //.format(ethers.utils.FormatTypes.json)

  const multicallBatchSize = 10
  const executeMulticallInBatches = async (calls, batchSize) => {
    return (await Promise.all(
      [...new Array(Math.floor(poolCount.toNumber() / batchSize)+1)].map(async (_, i) => {
        // console.log(i, multicallBatchSize*i, multicallBatchSize*(i+1))
        const results = await multicallProvider.all(calls.slice(multicallBatchSize*i, multicallBatchSize*(i+1)))
        return results
      }).flat()
    )).flat()
  }

  // console.log(poolCount.toNumber(), "pools")
  const poolCalls = [...new Array(poolCount.toNumber())].map((_, i) => {
    return multicallPairFactory.allPairs(i)
  })

  const poolAddresses = await executeMulticallInBatches(poolCalls, multicallBatchSize)

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

  const token0s = await executeMulticallInBatches(token0Calls, multicallBatchSize)
  token0s.forEach((address, i) => poolTokenMapping[poolAddresses[i]] = [address])
  const token1s = await executeMulticallInBatches(token1Calls, multicallBatchSize)
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
  getPathsDetail
}