const func = async function (hre) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const UniswapV2Factory = await deployments.get("UniswapV2Factory")
  const CustomSort = await deployments.get("CustomSort")

  const {deployer} = await getNamedAccounts();

  await deploy('PriceFetcher', {
    from: deployer,
    args: [UniswapV2Factory.address],
    log: true,
    libraries: {
      CustomSort: CustomSort.address
    }
  });
};
func.tags = ['PriceFetcher', 'CustomSort'];
func.dependencies = ["UniswapV2Factory"]

module.exports = func