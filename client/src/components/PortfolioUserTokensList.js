import { useState } from "react"
import {IoIosArrowDropleftCircle,IoIosRemoveCircle} from 'react-icons/io'
import "./portfolioSetup.css"

const PortfolioUserTokensList = ({trackedAssets}) => {
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

  return (
    <div>
      <h3 style={{marginTop:"30px"}}>Wallet 202322</h3>
      {tokens[0] ? <>
        <div className="b2">
          {tokens.map((token, i,tokens) => ( <>
            <div className="row" key={i}>
                <div className="col">
              <h3>{token.symbol}</h3>
              </div>
              <div className="col">
                <h3>{token.balance}</h3>
              </div>
              <div className="col" style={{margin:"1px",marginRight:"10px",display:"flex"}}>
                <div style={{width:"70px"}}></div>
                <IoIosRemoveCircle className='removeIcon'/>
                <button className=" removeBtn" name={token.symbol} onClick={removeToken}>
                </button>
              </div>
            </div>
            {i!==tokens.length-1 ?<div className="tableDiv"></div>: <></>}
            </>
          ))}
        </div>
        </> : <></>}
    </div>
  )
}

export default PortfolioUserTokensList
