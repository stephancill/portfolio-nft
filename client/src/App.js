import { useState } from 'react';
import './App.css';
import ConnectWallet from './components/ConnectWallet';
import ConnectWalletInfo from './components/ConnectWalletInfo';
import Demo from './components/demo';
import Logo from './components/Logo';
import MintSection from './components/MintSection';
import NFTInfo from './components/NFTInfo';
import PortfolioSetup from './components/PortfolioSetup';

const connectWallet = () => {

}


function App() {

const [walletConnected,setWalletConnected] = useState(true)
const [walletAdd,setWalletAdd] = useState("0xd5e60aa3298d7da74b36819b963ad01f8b180c1e")
const trackedAssets = [{symbol: "ETH", balance: 10.20},{symbol: "USDC", balance: 1000.20}]

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
          <ConnectWalletInfo amountMinted={742}/> <ConnectWallet clicked={connectWallet}/>
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
