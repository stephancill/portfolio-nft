import { useState } from "react"
import {IoIosRemoveCircle} from 'react-icons/io'
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

  const hideItem = (i) => {
    let r1 = document.getElementById("remove"+i)
    let r2 = document.getElementById("remove1"+i)
    r1.style.display = "none"
    r2.style.display = "block"


    
  }
  const showItem = (i) => {
    let r1 = document.getElementById("remove"+i)
    let r2 = document.getElementById("remove1"+i)
    r1.style.display = "block"
    r2.style.display = "none"

  }

  return (
    <div>
      {tokens[0] ? <>
        <div className="b2">
          {tokens.map((token, i,tokens) => ( <>
            <div className="row" key={i} id={i} 
              onMouseEnter={() => hideItem(i)}
              onMouseLeave={() => showItem(i)}
            >
              <div>
                <div className="tokenIcon"></div>
              </div>
              <div style={{marginLeft:"15px"}}>
                <h3 style={{margin:"0px",marginTop:"-2px"}}>{token.symbol}</h3>
                <h4 style={{margin:"0px",textAlign:"left"}} >{token.balance}</h4>
              </div>
              <div className="col">
                <div id={"remove"+i}>
                  <h3 style={{textAlign:"right", marginTop:"-0px"}}>
                    30340
                  </h3>
                </div>
                <div id={"remove1"+i} style={{display:"none"}} >
                  <button className=" innerRowBtn" name={token.symbol} onClick={removeToken} style={{width:"110px"}}>
                    Remove
                    <IoIosRemoveCircle className="innerRowIcon"></IoIosRemoveCircle>
                  </button>
                </div>
              </div>
            </div>

            </>
          ))}
        </div>
        </> : <></>}
    </div>
  )
}

export default PortfolioUserTokensList
