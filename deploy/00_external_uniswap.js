

const func = async function (hre) {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;

  const WETH = await deployments.get("WETH")

  const {deployer} = await getNamedAccounts();

  const UniswapV2FactoryCompilerOutput =  require("@uniswap/v2-core/build/UniswapV2Factory.json")
  const UniswapV2FactoryBytecode = UniswapV2FactoryCompilerOutput.bytecode
  const UniswapV2FactoryABI = UniswapV2FactoryCompilerOutput.abi

  await deploy('UniswapV2Factory', {
    contract: {
      abi: UniswapV2FactoryABI,
      bytecode: UniswapV2FactoryBytecode
    },
    skipIfAlreadyDeployed: true,
    from: deployer,
    args: [WETH.address],
    log: true,
  })
};
func.tags = ['UniswapV2Factory'];
func.dependencies = ['WETH']
module.exports = func