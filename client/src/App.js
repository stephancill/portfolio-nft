import { useState,useEffect } from 'react';
import './App.css';
import ConnectWallet from './components/ConnectWallet';
import ConnectWalletInfo from './components/ConnectWalletInfo';
import Demo from './components/demo';
import Logo from './components/Logo';
import MintSection from './components/MintSection';
import NFTInfo from './components/NFTInfo';
import PortfolioSetup from './components/PortfolioSetup';
import { ethers } from 'ethers';

function App() {

useEffect( async() => {
  const accounts = await window.ethereum.request({method: "eth_accounts"})
  if(accounts[0]){
    setWalletConnected(true)
    setWalletAdd(accounts[0])
  }
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
      } else {
        setWalletAdd(newAddress)
        console.log(newAddress)
      }
    })
    window.ethereum.on("chainChanged", ([networkId]) => {
      //change chain
    })
  }
}, [])

const [walletConnected,setWalletConnected] = useState(false)
const [walletAdd,setWalletAdd] = useState("")
const trackedAssets = [{symbol: "ETH", balance: 10.20},{symbol: "USDC", balance: 1000.20}]

const connectWallet = async () => {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    if (signer !== undefined) {
      let userAddresss = await signer.getAddress();
      setWalletAdd(userAddresss)
      setWalletConnected(true)
    }
  }
}

  return (
    <div className="App">
      <div className="App-header">
        <div className="container">
          <Logo/>
          {walletConnected ? <>
          <MintSection amountMinted={742} walletAdd={walletAdd}/> 
          <div className="break"></div>
          <PortfolioSetup trackedAssets={trackedAssets}/>
          </> : <>
          <ConnectWalletInfo amountMinted={742}/> 
          <ConnectWallet  onClick={connectWallet} />
          <div className="break"></div>
          <Demo/>
          <NFTInfo/> 
          </>}
        </div>
      </div>
    </div>
  );
}

export default App;
