const func = async function (hre) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deploy} = deployments;

  const OStrings = await ethers.getContractFactory('OStrings')
  const {deployer} = await getNamedAccounts();

  await deploy('OStrings', {
    contract: {
      abi: OStrings.interface.format(ethers.utils.FormatTypes.json),
      bytecode: OStrings.bytecode
    },
    skipIfAlreadyDeployed: true,
    from: deployer,
    args: [],
    log: true,
  })
};
func.tags = ['OStrings'];
module.exports = func