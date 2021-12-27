require("@nomiclabs/hardhat-waffle");
const { TASK_COMPILE, TASK_NODE } = require("hardhat/builtin-tasks/task-names")
const open = require('open')

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("generate", "Outputs 10 random token SVGs", async (taskArgs, hre) => {

  await run(TASK_COMPILE)

  await Promise.race([run(TASK_NODE), new Promise(resolve => setTimeout(resolve, 2_000))]);

  const ERC20 = await ethers.getContractFactory('ERC20PresetMinterPauser')
  const baseToken = await ERC20.deploy('Base Token', 'BASE')

  const PortfolioNFT = await ethers.getContractFactory('PortfolioNFT')
  const portfolioNFT = await PortfolioNFT.deploy(baseToken.address)

  const PortfolioMetadata = await ethers.getContractFactory('PortfolioMetadata')
  const portfolioMetadata = await PortfolioMetadata.deploy(portfolioNFT.address)

  await portfolioNFT.setPortfolioMetadataAddress(portfolioMetadata.address);

  await Promise.all([... new Array(10)].map(async (_, i) => {
    const tokenURI = await portfolioNFT.tokenURI(i)
    const tokenURIDecoded = atob(tokenURI.split(",")[1])
    const imageData = JSON.parse(tokenURIDecoded).image
    const decodedSvg = atob(JSON.parse(tokenURIDecoded).image.split(",")[1])
    console.log(decodedSvg)

    const x = await open(imageData, {app: {name: "firefox"}})
  }))
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
};
