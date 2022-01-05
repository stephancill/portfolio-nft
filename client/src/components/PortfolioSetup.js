import {useState } from 'react';
import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"
import {IoIosArrowDropleftCircle,IoIosRemoveCircle} from 'react-icons/io'
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
        <PortfolioUserTokensList trackedAssets={trackedAssets}/>
        <button className="addTokenBtn" onClick={back}>Add New Token</button>
        <button style={{marginTop:"30px"}}>Update</button>
      </> : <>
        <div className="backConatiner">
          <h3 style={{marginTop:"30px",display:"flex"}}>Select a token </h3>
          <div style={{paddingLeft:"200px",paddingTop:"25px"}}>
            {/* Fix the button not being able to be clicked when over the icon */}
            <button className="backBtn" onClick={back}>
              <IoIosArrowDropleftCircle className="backIcon"/>
            </button>
          </div>
        </div>
        <PortfolioAddTokens walletConnected={walletConnected}/>
      </>}
    </div>
    
  )
}

export default PortfolioSetup
