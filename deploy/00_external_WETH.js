const func = async function (hre) {
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deploy} = deployments;

  const ERC20 = await ethers.getContractFactory('ERC20PresetMinterPauser')
  const {deployer} = await getNamedAccounts();

  await deploy('WETH', {
    contract: {
      abi: ERC20.interface.format(ethers.utils.FormatTypes.json),
      bytecode: ERC20.bytecode
    },
    skipIfAlreadyDeployed: true,
    from: deployer,
    args: ["Wrapped Ether", "WETH"],
    log: true,
  })
};
func.tags = ['WETH'];
module.exports = func