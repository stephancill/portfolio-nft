import { useState } from 'react';
import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"
import {IoIosArrowDropleftCircle} from 'react-icons/io'

const PortfolioSetup = ({trackedAssets}) => {
  const [addingToken,setAddingToken] = useState(true)

  const back = () => {
    setAddingToken(false)
  }

  let tokenPrint =  []
  if (trackedAssets) {
    for (let i = 0;i<trackedAssets.length;i++) {
      tokenPrint.push (
      <>
        <div className="row" id={"row"+i}>
          <div className="col">
            <h3>{trackedAssets[i].symbol}</h3>
          </div>
          <div className="col">
            <h3>{trackedAssets[i].balance}</h3>
          </div>
          <div className="col" style={{margin:"1px",marginRight:"10px"}}>
            <button className="tableBtn" id={i}>Remove</button>
          </div>
        </div>
        { i !== trackedAssets.length-1 && 
         <div className="tableDiv"></div>
        }
      </>)
    }
  }

  return (
    <div>
      <h2>Setup</h2>
      <h3 style={{marginTop:"10px"}}>Select a portfolio to configure.</h3>
      <button className="NFTBtn">
        <img src={demoNFT}></img>
      </button>
      {!addingToken ? <>
        <h3 style={{marginTop:"30px"}}>Wallet 202322</h3>
        <div className="b2">
          {tokenPrint}
          <button className="addTokenBtn">Add Token</button>
        </div>
        <button style={{marginTop:"30px"}}>Remove</button>
      </> : <>
        <div className="backConatiner">
        <h3 style={{marginTop:"30px",display:"flex"}}>Select a token </h3>
        <div style={{paddingLeft:"200px",paddingTop:"20px"}}>
          <button className="backBtn" onClick={back}>
            <IoIosArrowDropleftCircle className="back"/>
          </button>
        </div>
        </div>
        <input placeholder="Search a name, address or symbol"></input>
        <div className="b2">
        </div>
      </>}
    </div>
    
  )
}

export default PortfolioSetup
