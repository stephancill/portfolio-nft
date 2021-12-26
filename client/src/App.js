import './App.css';
import ConnectWallet from './components/ConnectWallet';
import ConnectWalletInfo from './components/ConnectWalletInfo';
import Demo from './components/demo';
import Logo from './components/Logo';
import NFTInfo from './components/NFTInfo';
import tester from './components/tester';

function App() {
  return (
    <div className="App">
      <div className="App-header">
        <div className="container">
          <Logo/>
          <ConnectWalletInfo amountMinted={742}/>
          <ConnectWallet/>
          <div className="break"></div>
          <Demo/>
          <NFTInfo/>
        </div>
      </div>
    </div>
  );
}

export default App;
