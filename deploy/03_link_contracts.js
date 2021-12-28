const func = async function (hre) {
  const {deployments, getNamedAccounts} = hre;
  const {execute} = deployments;

  const PortfolioMetadata = await deployments.get("PortfolioMetadata")
  const PriceFetcher = await deployments.get("PriceFetcher")

  const {deployer} = await getNamedAccounts();

  console.log("fuck you")

  await execute("PortfolioNFT", {from: deployer}, "setPriceFetcherAddress", PriceFetcher.address)
  await execute("PortfolioNFT", {from: deployer}, "setPortfolioMetadataAddress", PortfolioMetadata.address)
};

func.tags = ['PortfolioMetadata'];
func.dependencies = ['PortfolioNFT', 'PriceFetcher'];
module.exports = func
module.exports.runAtTheEnd = true;
