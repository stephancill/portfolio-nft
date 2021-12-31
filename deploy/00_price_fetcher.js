const func = async function (hre) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const CustomSort = await deployments.get("CustomSort")

  const {deployer} = await getNamedAccounts();

  await deploy('PriceFetcher', {
    from: deployer,
    args: [],
    log: true,
    libraries: {
      CustomSort: CustomSort.address
    }
  });
};
func.tags = ['PriceFetcher', 'CustomSort'];
func.dependencies = ["UniswapV2Factory"]

module.exports = func