import { useEffect,useState } from 'react';
import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"
import {IoIosArrowDropleftCircle} from 'react-icons/io'
import { isElement } from 'react-dom/test-utils';

const PortfolioSetup = ({trackedAssets}) => {
  const [addingToken,setAddingToken] = useState(true)
  const [tokens,setTokens] = useState(trackedAssets)

  const addToken = () => {
    setTokens((prevTokens)=>[
      ...prevTokens,
      { symbol: "KLIMA", balance:400 } 
    ])
  }
  
  const removeToken = (e) => {
    const symbol = e.target.getAttribute("name")
    setTokens(tokens.filter(item => item.symbol !== symbol));
    console.log()

  }

  const back = () => {
    setAddingToken(false)
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
          {tokens.map((token, i,tokens) => ( <>
            <div className="row" key={i}>
                <div className="col">
              <h3>{token.symbol}</h3>
              </div>
              <div className="col">
                <h3>{token.balance}</h3>
              </div>
              <div className="col" style={{margin:"1px",marginRight:"10px"}}>
                <button className="tableBtn" name={token.symbol} onClick={removeToken}>Remove</button>
              </div>
            </div>
            {i!==tokens.length-1 ?<div className="tableDiv"></div>: <></>}
            </>
          ))}
        </div>
        <button className="addTokenBtn" onClick={addToken}>Add Token</button>
        <button style={{marginTop:"30px"}}>Update</button>
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
