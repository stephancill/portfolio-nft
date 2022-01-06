import {useState } from 'react';
import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"
import {IoIosArrowBack,IoIosAddCircle} from 'react-icons/io'
import PortfolioUserTokensList from './PortfolioUserTokensList';
import PortfolioAddTokens from './PortfolioAddTokens';

const PortfolioSetup = ({trackedAssets,walletConnected}) => {
  const [addingToken,setAddingToken] = useState(false)

  const back = () => {
    setAddingToken(!addingToken)
  }

  return (
    <div>
      <h2>Setup</h2>
      <h3 style={{marginTop:"10px"}}>Select a portfolio to configure.</h3>
      <button className="NFTBtn">
        <img src={demoNFT}></img>
      </button>
      {!addingToken ? <>
        <div className='titleBtnBar'>
          <div>
            <h3 style={{display:"flex",margin:"0px"}}>Wallet 202322</h3>
            <div className='priceText'>$200,320,234</div>
          </div>
          <div className='titleBtnBarRight'>
            <div>
              <button className="pageBtn" onClick={back} style={{width:"130px"}}>
                Add Token
                <IoIosAddCircle className="innerRowIcon"></IoIosAddCircle>
              </button>
            </div>
          </div>
        </div>
        <PortfolioUserTokensList trackedAssets={trackedAssets}/>
      </> : <>
        <div className="backConatiner" style={{marginBottom:"5px"}}>
          <div className='titleBtnBar'>
            <div>
              <h3 style={{display:"flex",marginTop:"5px"}}>Select A Token</h3>
            </div>
            <div className='titleBtnBarRight'>
              <div>
                <button className="pageBtn" onClick={back} style={{width:"30px"}}>
                  <IoIosArrowBack className="innerRowIcon" style={{marginLeft:"-2px",marginRight:"0px"}}></IoIosArrowBack>
                </button>
              </div>
            </div>
          </div>
        </div>
        <PortfolioAddTokens walletConnected={walletConnected}/>
      </>}
    </div>
    
  )
}

export default PortfolioSetup
