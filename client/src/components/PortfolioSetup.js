import {useState,useEffect } from 'react';
import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"
import {IoIosArrowBack,IoIosAddCircle} from 'react-icons/io'
import PortfolioUserTokensList from './PortfolioUserTokensList';
import PortfolioAddTokens from './PortfolioAddTokens';
import { ethers } from "ethers";
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'

const listTokensOfOwner = require("./erc-721")
const baseToken  =  require('./../contracts.json')

const PortfolioSetup = ({cont,walletAddress,signer,tokenList,refreshUserNFT,resetRefreshUserNFT}) => {
  const [addingToken,setAddingToken] = useState(false)
  const [userNFTs,setUserNFTs] = useState([{}])
  const [trackedTokens,setTrackedTokens] = useState([{}])
  const [tokenID,setTokenID] = useState([])
  const [shouldFetchUpdatedSVG, setShouldFetchUpdatedSVG] = useState(false)
  const [selectedNFTToken, setSelectedNFTToken] = useState(null)

  useEffect(async() => {
    
    if (walletAddress)
      getUsersNFTTokens()
    if (refreshUserNFT) {
      resetRefreshUserNFT()
    }
    console.log("test")
    getUsersNFTTokens()
    if (shouldFetchUpdatedSVG) {
      setShouldFetchUpdatedSVG(false)
      getUsersNFTTokens()
    }
  }, [shouldFetchUpdatedSVG,tokenList,refreshUserNFT])

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
    const tokens = await listTokensOfOwner({token: portfolioNFT.address, account: walletAddress, provider: signer})
    const tempNFTsvgs = []
    let tokenIDs = Array.from(tokens);
    setTokenID(tokenIDs)
    for (let i=0;i<tokens.size;i++) { 
      tempNFTsvgs[i] = await getNFT(tokenIDs[i])
    }
    console.log(tempNFTsvgs)
    if (tempNFTsvgs.length > 0 ) {
      setUserNFTs(tempNFTsvgs)
    } else {
      setUserNFTs(null)
    }
    
  }
  
  const getTrackedTokens = async (clickedToken) => {
    setSelectedNFTToken(clickedToken)
    const deployment = await cont.contracts.PortfolioNFT
    const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi,signer)
    const trackedTokens = await portfolioNFT.getTokenAddresses(clickedToken)
    let tempTrackedTokens = [] 
    for (let i=0; i<trackedTokens.length; i++) {
      tempTrackedTokens[i] = await searchToken(trackedTokens[i])
    }
    setTrackedTokens(tempTrackedTokens)
  }

  const searchToken =  async (address) => {
    const tokenLength = tokenList.tokens.length
    let fetchToken = {}
    for (let i = 0;i < tokenLength; i++){
      if (tokenList.tokens[i].address.toUpperCase() === address.toUpperCase()) {
        const token = tokenList.tokens[i]
        fetchToken = {symbol:token.symbol.toUpperCase(),logo:token.logoURI,address:token.address,balance:await getBalance(token.address, token.decimals)}
        break 
      }
    }
    return(fetchToken)  
  }

  const getBalance = async (address, decimals) => {
    const contract = new ethers.Contract(address, baseToken.contracts.BaseToken.abi, signer)
    const balance = await contract.balanceOf(walletAddress)
    return ethers.utils.formatUnits(balance, decimals)
  }

  const properties = {
    autoplay: false,
    indicators: true
  };
  

  //TODO : Dont shoe setup when there isnt any nfts
  return (
    <div>
      {!userNFTs ? <></>: <>
        <div className="break"></div>
        <h2>Setup</h2>        
        <h3 style={{marginTop:"10px"}}>Select a portfolio to configure.</h3>
        <Slide {...properties} style={{marginBottom:"-20px"}}>
          {userNFTs.map((NFT, i) => ( <div key={i}>
            <div className="each-slide" key={i}>
              <button className="NFTBtn" id={"nft"+i} onClick={()=>{getTrackedTokens(tokenID[i])}}>
                <img src={NFT.svg} style={{width:"348px"}}></img>
              </button>
              </div>
            </div>
            ))}
        </Slide>
        {!addingToken ? <>
          {selectedNFTToken ? <>
            <div className='titleBtnBar'>
              <div>
                <div className='priceText'>Wallet No {selectedNFTToken}</div>
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
            <PortfolioUserTokensList trackedAssets={trackedTokens} signer={signer} walletAddress={walletAddress} cont={cont} setShouldFetchUpdatedSVG={setShouldFetchUpdatedSVG}  selectedNFTToken={selectedNFTToken} getTrackedTokens={getTrackedTokens}/>
          </> : <></>}
        </> : <>
          <div className="backConatiner" style={{marginBottom:"5px"}}>
            <div className='titleBtnBar'>
              <div>
                <h3 style={{display:"flex",marginTop:"5px"}}>Select Tokens To Add</h3>
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
          <PortfolioAddTokens tokenList={tokenList} signer={signer} walletAddress={walletAddress} cont={cont} setShouldFetchUpdatedSVG={setShouldFetchUpdatedSVG} selectedNFTToken={selectedNFTToken} getTrackedTokens={getTrackedTokens} trackedTokens={trackedTokens}/>
        </>}
      </>}
    </div>
  )
}

export default PortfolioSetup
