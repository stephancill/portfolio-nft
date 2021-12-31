const func = async function (hre) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const {deployer} = await getNamedAccounts();

  await deploy('PortfolioNFT', {
    from: deployer,
    args: ["Test Portfolio NFT", "TPNFT"],
    log: true,
  });
};
func.tags = ['PortfolioNFT'];
func.dependencies = ["WETH", "BaseToken"]

module.exports = func