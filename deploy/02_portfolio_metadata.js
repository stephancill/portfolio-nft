const func = async function (hre) {
    const {deployments, getNamedAccounts} = hre;
    const {deploy} = deployments;
  
    const PortfolioNFT = await deployments.get("PortfolioNFT")

    const Base64 = await deployments.get("Base64")
    const OStrings = await deployments.get("OStrings")
    const CustomSort = await deployments.get("CustomSort")
  
    const {deployer} = await getNamedAccounts();
  
    await deploy('PortfolioMetadata', {
      from: deployer,
      args: [PortfolioNFT.address],
      log: true,
      libraries: {
        Base64: Base64.address,
        OStrings: OStrings.address,
        CustomSort: CustomSort.address
      }
    });
  };
  func.tags = ['PortfolioMetadata'];
  func.dependencies = ['PortfolioNFT', 'Base64', 'OStrings', 'CustomSort'];
  
  module.exports = func