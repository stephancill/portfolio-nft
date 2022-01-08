import PercentageSold from "./PercentageSold"
import "./mintSection.css"
import { ethers } from "ethers";

const MintSection = ({amountMinted,cont,address,signer}) => {
  const mintNFT = async ()=> {
    const deployment = cont.contracts.PortfolioNFT
    const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi, signer)
    const tx = await portfolioNFT.connect(signer).mint(address)
    const txInfo = await tx.wait()
    const tokenId = txInfo.events[0].args.tokenId.toString()
    console.log("Minted", {tokenId})
  }
  return (
    <div>
      <h2>Mint</h2>
      <h3 style={{marginTop:"10px"}}>The first 1000 Lens Portfolio NFTs can be minited for free. There on 0.1 ETH each.</h3>
      <PercentageSold amountMinted={amountMinted}/>
      <h4 style={{marginTop:"10px"}}>{amountMinted}/1000 Minted</h4>
      <div style={{marginTop:"30px"}}>
      <button onClick={mintNFT}>
        Mint
      </button>
    </div>
  </div>
  )
}

export default MintSection
