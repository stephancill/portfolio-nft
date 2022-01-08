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
import {  CSSTransition  } from 'react-transition-group'

function App() {
const [walletConnected,setWalletConnected] = useState(false)
const [walletAddress,setWalletAdd] = useState("")
const [network,setNetwork] = useState()
const [wrongNetwork,setWrongNetwork] = useState(false)
const [loaded,setLoaded] = useState(false)
const [signer,setSigner] = useState()
const contracts  =  require('./contracts.json')

const trackedAssets = [{symbol: "ETH", balance: 10.20},{symbol: "USDC", balance: 1000.20}]


const networks = {
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"]
  },
  eth: {
    chainId: `0x${Number(1).toString(16)}`
  }
};

window.onload = () => {
  setLoaded(!loaded)
 }

useEffect( async() => {
  const accounts = await window.ethereum.request({method: "eth_accounts"})
  if(accounts[0]){
    setWalletConnected(true)
    connectWallet()
    setWalletAdd(accounts[0])
    getNetwork()
  }
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      if (newAddress === undefined) {
        setWalletConnected(false)
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
    const tempsigner = provider.getSigner();
    setSigner(tempsigner)
    console.log(tempsigner)
    if (tempsigner !== undefined) {
      let userAddresss = await tempsigner.getAddress();
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
const updateNetwork = async (childdata) => {
  console.log(childdata)
  setNetwork(childdata);
  await changeNetwork(childdata);
};

const changeNetwork = async (networkName ) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    console.log(networkName)
    if (networkName==="1") {
      
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            ...networks["eth"]
          }
        ]
      });
    } else {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            ...networks["polygon"]
          }
        ]
      });
    }
  } catch (err) {
    
  }
  getNetwork()
};


const walletInfo = <WalletInfo updateNetwork={updateNetwork}  walletAdd={walletAddress} wrongNetwork={wrongNetwork} network={network}/>

  return (
    <div className="App">
      <div className="App-header">
        <div className="container">
          <CSSTransition
            in={loaded}
            timeout={400}
            classNames="list-transition"
            unmountOnExit
            appear
          >
            <div><Logo/>
            {walletConnected ? <>  
              {wrongNetwork ? <>
                {walletInfo}
                </>:<>
                {walletInfo}
                <MintSection amountMinted={742} cont={contracts} address={walletAddress} signer={signer}/> 
                <div className="break"></div>
                <PortfolioSetup trackedAssets={trackedAssets} walletConnected={walletConnected} cont={contracts} address={walletAddress} signer={signer}/>
              </>}
            </> : <>
            <ConnectWalletInfo amountMinted={742}/> 
            <ConnectWallet  onClick={connectWallet} />
            <div className="break"></div>
            <Demo walletConnected={walletConnected}/>
            <NFTInfo/> 
            </>}</div>
          </CSSTransition>
        </div>
      </div>
    </div>
  );
}

export default App;
