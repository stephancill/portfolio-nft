const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BalanceNFT Tests", function () {
  let deployer
  let account1
  let account2
  let account3
  let account4
  let token1
  let token2
  let balanceWatcherNFT

  beforeEach(async () => {
    [deployer, account1, account2, account3, account4] = await ethers.getSigners()

    const Token1 = await ethers.getContractFactory('ERC20PresetMinterPauser')
    token1 = await Token1.deploy('KlimaDAO', 'KLIMA')
    await token1.deployed()
    await token1.mint(account1.address, 100000)

    // TODO: Test eth balance and second token balance
    const Token2 = await ethers.getContractFactory('ERC20PresetMinterPauser')
    token2 = await Token1.deploy('Token 2', 'TOKEN2')
    await token2.deployed()
    await token2.mint(account1.address, 100000)

    const BalanceWatcherNFT = await ethers.getContractFactory('BalanceWatcherNFT')
    balanceWatcherNFT = await BalanceWatcherNFT.deploy()
    await balanceWatcherNFT.deployed()
  })

  it("Should mint tokens to address", async function () {
    expect(await token1.balanceOf(account1.address)).to.equal(100000)
  });

  it("Should produce the correct SVG data for balance", async function () {
    await balanceWatcherNFT.mint(account1.address)
    await balanceWatcherNFT.connect(account1).trackToken(1, token1.address, 0)
    const tokenURI = await balanceWatcherNFT.tokenURI(1)
    const tokenURIDecoded = atob(tokenURI.split(",")[1])
    const decodedSvg = atob(JSON.parse(tokenURIDecoded).image.split(",")[1])

    console.log(decodedSvg)
    const tokenSymbol = await token1.symbol()
    const balance = await token1.balanceOf(account1.address)

    expect(decodedSvg).to.contain(tokenSymbol)
    expect(decodedSvg).to.contain(balance)
  })
});

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });
