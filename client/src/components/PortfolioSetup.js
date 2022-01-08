import {useState,useEffect } from 'react';
import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"
import {IoIosArrowBack,IoIosAddCircle} from 'react-icons/io'
import PortfolioUserTokensList from './PortfolioUserTokensList';
import PortfolioAddTokens from './PortfolioAddTokens';
import { ethers } from "ethers";


const PortfolioSetup = ({trackedAssets,walletConnected,cont,address,signer}) => {
  const [addingToken,setAddingToken] = useState(false)
  const [NFTsvg,setNFTsvg] = useState([])

  useEffect( async() => {
    getNFT()
  }, [])

  const back = () => {
    setAddingToken(!addingToken)
  }

  const getNFT = async () => {
    const deployment = await cont.contracts.PortfolioNFT
    const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi,signer)
    const tokenURI = await portfolioNFT.tokenURI(1)
    const svg = JSON.parse(atob(tokenURI.split(",")[1])).image
    console.log(svg)
    setNFTsvg(svg)
  }

  return (
    <div>
      <h2>Setup</h2>
      <h3 style={{marginTop:"10px"}}>Select a portfolio to configure.</h3>
      <button className="NFTBtn">
        <img src={NFTsvg} style={{width:"348px"}}></img>
      </button>
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
        <PortfolioAddTokens walletConnected={walletConnected}/>
      </>}
    </div>
    
  )
}

export default PortfolioSetup
