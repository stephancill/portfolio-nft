const func = async function (hre) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {execute} = deployments;

  const PortfolioMetadata = await deployments.get("PortfolioMetadata")
  const PriceFetcher = await deployments.get("PriceFetcher")
  const BaseToken = await deployments.get("BaseToken")
  const WETH = await deployments.get("WETH")
  const WETHContract = new ethers.Contract(WETH.address, WETH.abi, ethers.provider)
  // const WETHSymbol = (await WETHContract.symbol()).slice(1)
  const WETHSymbol = (await WETHContract.symbol()).slice(1)

  const UniswapFactory = await deployments.get("UniswapV2Factory")
  const uniswapFactory = new ethers.Contract(UniswapFactory.address, UniswapFactory.abi, ethers.provider)
  const pairAddress = await uniswapFactory.getPair(WETH.address, BaseToken.address)
  const WETHPricePath = [pairAddress]

  const {deployer} = await getNamedAccounts();

  await execute("PortfolioNFT", {from: deployer}, "setPriceFetcherAddress", PriceFetcher.address)
  console.log("setPriceFetcherAddress", PriceFetcher.address)

  await execute("PortfolioNFT", {from: deployer}, "setBaseTokenAddress", BaseToken.address)
  console.log("setBaseTokenAddress", BaseToken.address)
  
  await execute("PortfolioNFT", {from: deployer}, "setWETH", WETH.address, WETHSymbol, WETHPricePath)
  console.log("setWETH", WETH.address, WETHSymbol, WETHPricePath)

  await execute("PortfolioNFT", {from: deployer}, "setPortfolioMetadataAddress", PortfolioMetadata.address)
  console.log("setPortfolioMetadataAddress", PortfolioMetadata.address)
};

func.tags = ['Link'];
func.dependencies = ['PortfolioNFT', 'PriceFetcher', 'UniswapV2Factory'];
module.exports = func
module.exports.runAtTheEnd = true;
