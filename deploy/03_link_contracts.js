const func = async function (hre) {
  const {deployments, getNamedAccounts} = hre;
  const {execute} = deployments;

  const PortfolioMetadata = await deployments.get("PortfolioMetadata")
  const PriceFetcher = await deployments.get("PriceFetcher")

  const {deployer} = await getNamedAccounts();

  await execute("PortfolioNFT", {from: deployer}, "setPriceFetcherAddress", PriceFetcher.address)
  console.log("setPriceFetcherAddress", PriceFetcher.address)

  await execute("PortfolioNFT", {from: deployer}, "setPortfolioMetadataAddress", PortfolioMetadata.address)
  console.log("setPortfolioMetadataAddress", PortfolioMetadata.address)
};

func.tags = ['Link'];
func.dependencies = ['PortfolioNFT', 'PriceFetcher'];
module.exports = func
module.exports.runAtTheEnd = true;
