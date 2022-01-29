import {useState,useEffect } from 'react';
import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"
import {IoIosArrowBack,IoIosAddCircle} from 'react-icons/io'
import PortfolioUserTokensList from './PortfolioUserTokensList';
import PortfolioAddTokens from './PortfolioAddTokens';
import { ethers } from "ethers";

const listTokensOfOwner = require("./erc-721")
const baseToken  =  require('./../contracts.json')

const PortfolioSetup = ({cont,walletAddress,signer,tokenList}) => {
  const [addingToken,setAddingToken] = useState(false)
  const [userNFTs,setUserNFTs] = useState([{}])
  const [trackedTokens,setTrackedTokens] = useState([{}])
  const [tokenID,setTokenID] = useState([])
  const [shouldFetchUpdatedSVG, setShouldFetchUpdatedSVG] = useState(false)
  const [selectedNFTToken, setSelectedNFTToken] = useState(null)

  
  // TODO 
  // add token to nft 
  // add listener from addTokens when new tokens are added 
  // remove token from list
  // get the balance of the tokens

  useEffect( async() => {
    getUsersNFTTokens()
  }, [tokenList])

  useEffect(() => {
    if (shouldFetchUpdatedSVG) {
      setShouldFetchUpdatedSVG(false)
      getUsersNFTTokens()
    }
  }, [shouldFetchUpdatedSVG])

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
    setUserNFTs(tempNFTsvgs)
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
    console.log(tempTrackedTokens)
    setTrackedTokens(tempTrackedTokens)
  }

  const searchToken =  async (address) => {
    const tokenLength = tokenList.tokens.length
    let fetchToken = {}
    for (let i = 0;i < tokenLength; i++){
      if (tokenList.tokens[i].address.toUpperCase() === address.toUpperCase()) {
        fetchToken = {symbol:tokenList.tokens[i].symbol.toUpperCase(),logo:tokenList.tokens[i].logoURI,address:tokenList.tokens[i].address,balance:await getBalance(tokenList.tokens[i].address)}
        break 
      }
    }
    return(fetchToken)  
  }

  const getBalance = async (address) => {
    //console.log(baseToken.contracts.BaseToken.abi)
    //let contract = new ethers.Contract(baseToken.contracts.BaseToken.abi).at(address);
    //const balance = await contract.balanceOf(walletAddress)
    return 1
  }
  

  //TODO : Dont shoe setup when there isnt any nfts
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
          {selectedNFTToken ? <>
            <div className='titleBtnBar'>
              <div>
                <h3 style={{display:"flex",margin:"0px"}}>Wallet No {selectedNFTToken}</h3>
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
            <PortfolioUserTokensList trackedAssets={trackedTokens} signer={signer} walletAddress={walletAddress} cont={cont} setShouldFetchUpdatedSVG={setShouldFetchUpdatedSVG}  selectedNFTToken={selectedNFTToken} getTrackedTokens={getTrackedTokens}/>
          </> : <></>}
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
          <PortfolioAddTokens tokenList={tokenList} signer={signer} walletAddress={walletAddress} cont={cont} setShouldFetchUpdatedSVG={setShouldFetchUpdatedSVG} selectedNFTToken={selectedNFTToken}/>
        </>}
      </>}
    </div>
  )
}

export default PortfolioSetup
