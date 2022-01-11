import {useState,useEffect } from 'react';
import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"
import {IoIosArrowBack,IoIosAddCircle} from 'react-icons/io'
import PortfolioUserTokensList from './PortfolioUserTokensList';
import PortfolioAddTokens from './PortfolioAddTokens';
import { ethers } from "ethers";

const listTokensOfOwner = require("./erc-721")



const PortfolioSetup = ({trackedAssets,walletConnected,cont,address,signer}) => {
  const [addingToken,setAddingToken] = useState(false)
  const [userNFTs,setUserNFTs] = useState([{}])

  useEffect( async() => {
    getUsersNFTTokens()
  }, [])

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
    console.log(tokens)
    const tempNFTsvgs = []
    for (let i=0;i<tokens.size;i++) {  
      tempNFTsvgs[i] = await getNFT(i+1)
    }
    setUserNFTs(tempNFTsvgs)
  }

  return (
    <div>
      {!userNFTs ? <></>: <>
        <div className="break"></div>
        <h2>Setup</h2>
        <h3 style={{marginTop:"10px"}}>Select a portfolio to configure.</h3>
        <div className='NFTcontainer'>
        {userNFTs.map((NFT, i) => ( <>
            <button className="NFTBtn" id={"nft"+i}>
              <img src={NFT.svg} style={{width:"328px"}}></img>
            </button>
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
          <PortfolioAddTokens walletConnected={walletConnected} cont={cont} address={address} signer={signer}/>
        </>}
      </>}
    </div>
  )
}

export default PortfolioSetup
