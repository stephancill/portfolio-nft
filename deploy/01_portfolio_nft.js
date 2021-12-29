const func = async function (hre) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const WETH = await deployments.get("WETH")
  const BaseToken = await deployments.get("BaseToken")

  const {deployer} = await getNamedAccounts();

  await deploy('PortfolioNFT', {
    from: deployer,
    args: ["Test Portfolio NFT", "TPNFT", BaseToken.address, WETH.address, "ETH", [WETH.address, BaseToken.address]],
    log: true,
  });
};
func.tags = ['PortfolioNFT'];
func.dependencies = ["WETH", "BaseToken"]

module.exports = func