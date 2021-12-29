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
import WalletInfo from './components/WalletInfo';

function App() {
const [walletConnected,setWalletConnected] = useState(false)
const [walletAddress,setWalletAdd] = useState("")
const [network,setNetwork] = useState()
const [wrongNetwork,setWrongNetwork] = useState(false)
const trackedAssets = [{symbol: "ETH", balance: 10.20},{symbol: "USDC", balance: 1000.20}]

useEffect( async() => {
  const accounts = await window.ethereum.request({method: "eth_accounts"})
  if(accounts[0]){
    setWalletConnected(true)
    setWalletAdd(accounts[0])
    getNetwork()
  }
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
      } else {
        setWalletAdd(newAddress)
        console.log(newAddress)
        getNetwork()
      }
    })
    window.ethereum.on("chainChanged", ([networkId]) => {
      getNetwork()
    })
  }
}, [])

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

const getNetwork = async() => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const chainId = await provider.getNetwork()
  const id = chainId.chainId
  if (id!==1&&id!==137) {
    alert("Please switch to Eth or Polygon network. ")
    setWrongNetwork(true)
    console.log(id)
  } else {
    setWrongNetwork(false)
    setNetwork(id)
  }
}

const updateNetwork = (childdata) => {
  setNetwork(childdata);
  console.log(childdata)
}
const walletInfo = <WalletInfo updateNetwork={updateNetwork}  walletAdd={walletAddress} wrongNetwork={wrongNetwork} network={network}/>

  return (
    <div className="App">
      <div className="App-header">
        <div className="container">
          <Logo/>
          {walletConnected ? <>  
            {wrongNetwork ? <>
              {walletInfo}
              </>:<>
              {walletInfo}
              <MintSection amountMinted={742} /> 
              <div className="break"></div>
              <PortfolioSetup trackedAssets={trackedAssets}/>
            </>}
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
