import {useState,useEffect } from 'react';
import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"
import {IoIosArrowBack,IoIosAddCircle} from 'react-icons/io'
import PortfolioUserTokensList from './PortfolioUserTokensList';
import PortfolioAddTokens from './PortfolioAddTokens';
import { ethers } from "ethers";

const listTokensOfOwner = require("./erc-721")



const PortfolioSetup = ({trackedAssets,walletConnected,cont,address,signer,tokenList}) => {
  const [addingToken,setAddingToken] = useState(false)
  const [userNFTs,setUserNFTs] = useState([{}])
  const [trackedTokens,setTrackedTokens] = useState([{}])
  const [tokenID,setTokenID] = useState([])
  const [tokenAddresses,setTokenAddresses] = useState([])

  useEffect( async() => {
    getUsersNFTTokens()
  }, [tokenList])

  const back = () => {
    setAddingToken(!addingToken)
  }

  const getNFT = async (tokenURIin) => {
    const deployment = await cont.contracts.PortfolioNFT
    const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi,signer)
    const tokenURI = await portfolioNFT.tokenURI(tokenURIin)
    const svg = JSON.parse(atob(tokenURI.split(",")[1])).image
    return {svg:svg,tokenURI:tokenURI}
  }

  const getUsersNFTTokens = async() => {
    const deployment = await cont.contracts.PortfolioNFT
    const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi, signer)
    const tokens = await listTokensOfOwner({token: portfolioNFT.address, account: address, provider: signer})
    const tempNFTsvgs = []
    let tokenIDs = Array.from(tokens);
    setTokenID(tokenIDs)
    for (let i=0;i<tokens.size;i++) {  
      tempNFTsvgs[i] = await getNFT(tokenIDs[i])
    }
    setUserNFTs(tempNFTsvgs)
  }
  
  const getTrackedTokens = async (clickedToken) => {
    const deployment = await cont.contracts.PortfolioNFT
    const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi,signer)
    const trackedTokens = await portfolioNFT.getTokenAddresses(clickedToken)
    console.log(trackedTokens)
    let tempTrackedTokens = [] 
    for (let i=0; i<trackedTokens.length; i++) {
      tempTrackedTokens[i] = searchToken(trackedTokens[i])
    }
    console.log(tempTrackedTokens)
    setTrackedTokens(tempTrackedTokens)
    //setTrackedTokenAddresses(trackedTokens)
  }

  const searchToken = (address) => {
    const tokenLength = tokenList.tokens.length
    let fetchToken = {}
    for (let i = 0;i < tokenLength; i++){
      if (tokenList.tokens[i].address.toUpperCase() === address.toUpperCase()) {
        fetchToken = {symbol:tokenList.tokens[i].symbol.toUpperCase(),logo:tokenList.tokens[i].logoURI}
        break 
      }
    }
    return(fetchToken)
  }



  return (
    <div>
      {!userNFTs ? <></>: <>
        <div className="break"></div>
        <h2>Setup</h2>
        <h3 style={{marginTop:"10px"}}>Select a portfolio to configure.</h3>
        <div className='NFTcontainer'>
        {userNFTs.map((NFT, i) => ( <>
            <button className="NFTBtn" id={"nft"+i} onClick={()=>{getTrackedTokens(tokenID[i])}}>
              <img src={NFT.svg} style={{width:"328px"}}></img>
            </button>
            {(userNFTs.length!=i+1) && 
              <div  style={{height:"10px",width:"100%"}}></div>
            }
          </>
          ))}
        </div>
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
          <PortfolioUserTokensList trackedAssets={trackedTokens}/>
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
          <PortfolioAddTokens walletConnected={walletConnected} cont={cont} address={address} signer={signer} tokenList={tokenList}/>
        </>}
      </>}
    </div>
  )
}

export default PortfolioSetup
