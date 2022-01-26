import { useState, useEffect } from "react"
import {IoIosRemoveCircle} from 'react-icons/io'
import { ethers } from "ethers";
import "./portfolioSetup.css"


const PortfolioUserTokensList = ({trackedAssets}) => {
  const [tokens,setTokens] = useState(trackedAssets)
  const [removeUserTokens,setRemoveUserTokens] = useState([])
  const [removeUserTokensAdrresses,setRemoveUserTokensAdrresses] = useState([])
  
  useEffect( async() => {
    if (trackedAssets) {
      setTokens(trackedAssets)
    }
    if (tokens) {
      console.log(tokens)
    }
  }, [trackedAssets,tokens])
  
  const removeToken = (i) => {
    let foundDuplicate = false
    if (removeUserTokensAdrresses) {
      for (let j = 0 ; j< removeUserTokensAdrresses.length;j++){
          if (tokens[i].address=== removeUserTokensAdrresses[j] ) {
            foundDuplicate = true
            break
          }
      }
    } else {
      foundDuplicate = true
    }
    if(!foundDuplicate){
      console.log("2"+tokens[i].address)
      setRemoveUserTokensAdrresses(removeUserTokensAdrresses => [...removeUserTokensAdrresses, tokens[i].address])
      setRemoveUserTokens(removeUserTokens => [...removeUserTokens, tokens[i]])
    }
  }

  const cancelRemoveToken = (i) => {
    setRemoveUserTokens(removeUserTokens.filter(item => item !== removeUserTokens[i]));
    setRemoveUserTokensAdrresses(removeUserTokensAdrresses.filter(item => item !== removeUserTokensAdrresses[i]))
  }

  const updateUserTokens = () =>{}

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
  const hideItemList = (i) => {
    let r1 = document.getElementById("item"+i)
    r1.style.display = "none"
  }
  const showItemList = (i) => {
    let r1 = document.getElementById("item"+i)
    r1.style.display = "block"
  }

  return (
    <div>
      {tokens[0].symbol ? <>
        <div className="b2">
          {tokens.map((token, i) => ( <>
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
                  <button className="innerRowBtn" name={token.symbol} onClick={()=>removeToken(i)} style={{width:"110px"}}>
                    Remove
                    <IoIosRemoveCircle className="innerRowIcon"></IoIosRemoveCircle>
                  </button>
                </div>
              </div>
            </div>
            </>
          ))}
        </div>
        </> : <>
        <h3>No tokens being tracked.</h3>
        </>}
        {removeUserTokens.length ? <>
        <h3 style={{marginBottom:"10px"}}>Your Tokens To Add</h3>
        <div className="b2">
        {removeUserTokens.map((token, i) => ( <>
            <div className="row" key={i} id={i}
            onMouseEnter={() => showItemList(i)}
            onMouseLeave={() => hideItemList(i)} >
                <img className="tokenIcon" src={token.logo}></img>
              <div style={{marginLeft:"15px",height:"30px"}}>
                <h3 style={{margin:"none",marginTop:"6px",width:"200px"}}>{token.symbol}</h3>
              </div>
              <div className="col">
                <div id={"item"+i} style={{display:"none"}} >
                  <button className="innerRowBtn" onClick={()=>cancelRemoveToken(i)} style={{width:"100px"}}>
                    Cancel
                    <IoIosRemoveCircle className="innerRowIcon"></IoIosRemoveCircle>
                  </button>
                </div>
              </div>
            </div>
            </>
          ))}
        </div>
        <button onlClick={()=>{updateUserTokens()}} style={{marginTop:"30px"}}>Remove Tokens</button>
        </>: <></>}
    </div>
  )
}

export default PortfolioUserTokensList
