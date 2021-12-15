const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BalanceNFT Tests", function () {
  let deployer
  let account1
  let account2
  let account3
  let account4
  let testPaymentToken
  let balanceWatcherNFT

  beforeEach(async () => {
    [deployer, account1, account2, account3, account4] = await ethers.getSigners()

    const TestPaymentToken = await ethers.getContractFactory('ERC20PresetMinterPauser')
    testPaymentToken = await TestPaymentToken.deploy('KlimaDAO', 'KLIMA')
    await testPaymentToken.deployed()
    await testPaymentToken.mint(account1.address, 100000)

    const BalanceWatcherNFT = await ethers.getContractFactory('BalanceWatcherNFT')
    balanceWatcherNFT = await BalanceWatcherNFT.deploy(testPaymentToken.address)
    await balanceWatcherNFT.deployed()
    
  })

  it("Should mint tokens to address", async function () {
    expect(await testPaymentToken.balanceOf(account1.address)).to.equal(100000)
  });

  it("Should deploy contract with correct address", async function () {
    expect(await balanceWatcherNFT.klimaAddress.call()).to.equal(testPaymentToken.address)
  })

  it("Should produce the correct SVG data for balance", async function () {
    await balanceWatcherNFT.mint(account1.address)
    const tokenURI = await balanceWatcherNFT.tokenURI(1)
    const tokenURIDecoded = atob(tokenURI.split(",")[1])
    const decodedSvg = atob(JSON.parse(tokenURIDecoded).image.split(",")[1])

    const tokenSymbol = await testPaymentToken.symbol()
    const balance = await testPaymentToken.balanceOf(account1.address)

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
