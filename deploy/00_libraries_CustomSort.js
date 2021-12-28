const func = async function (hre) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deploy} = deployments;

  const CustomSort = await ethers.getContractFactory('CustomSort')
  const {deployer} = await getNamedAccounts();

  await deploy('CustomSort', {
    contract: {
      abi: CustomSort.interface.format(ethers.utils.FormatTypes.json),
      bytecode: CustomSort.bytecode
    },
    skipIfAlreadyDeployed: true,
    from: deployer,
    args: [],
    log: true,
  })
};
func.tags = ['CustomSort'];
module.exports = func