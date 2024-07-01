const { ethers } = require("hardhat");

async function main() {
  const EntryPoint = await ethers.getContractFactory('EntryPoint');
  const entryPoint = await EntryPoint.deploy();

  await entryPoint.waitForDeployment();
  console.log('==entrypoint addr=', entryPoint.address);

  const WalletFactory = await ethers.getContractFactory("WalletFactory");
  const walletFactory = await WalletFactory.deploy(entryPoint.address);

  await walletFactory.waitForDeployment();
  console.log("WalletFactory deployed to:", walletFactory.address);

  const Wallet = await ethers.getContractFactory('Wallet');
  const wallet = await Wallet.deploy(entryPoint.address, walletFactory.address);

  await wallet.waitForDeployment();
  console.log('== wallet=', wallet.address);

  const TestCounter = await ethers.getContractFactory('TestCounter');
  const testCounter = await TestCounter.deploy();
  
  await testCounter.waitForDeployment();
  console.log('==testCounter=', testCounter.address);
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });