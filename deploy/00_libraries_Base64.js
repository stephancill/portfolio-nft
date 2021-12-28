const func = async function (hre) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deploy} = deployments;

  const Base64 = await ethers.getContractFactory('Base64')
  const {deployer} = await getNamedAccounts();

  await deploy('Base64', {
    contract: {
      abi: Base64.interface.format(ethers.utils.FormatTypes.json),
      bytecode: Base64.bytecode
    },
    skipIfAlreadyDeployed: true,
    from: deployer,
    args: [],
    log: true,
  })
};
func.tags = ['Base64'];
module.exports = func