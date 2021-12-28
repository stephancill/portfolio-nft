const func = async function (hre) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deploy} = deployments;

  const ERC20 = await ethers.getContractFactory('ERC20PresetMinterPauser')
  const {deployer} = await getNamedAccounts();

  await deploy('BaseToken', {
    contract: {
      abi: ERC20.interface.format(ethers.utils.FormatTypes.json),
      bytecode: ERC20.bytecode
    },
    skipIfAlreadyDeployed: true,
    from: deployer,
    args: ["Base Token", "BASE"],
    log: true,
  })
};
func.tags = ['BaseToken'];
module.exports = func