import PercentageSold from "./PercentageSold"
import "./mintSection.css"

const MintSection = ({amountMinted}) => {
  return (
    <div>
      <h2>Mint</h2>
      <h3 style={{marginTop:"10px"}}>The first 1000 Lens Portfolio NFTs can be minited for free. There on 0.1 ETH each.</h3>
      <PercentageSold amountMinted={amountMinted}/>
      <h4 style={{marginTop:"10px"}}>{amountMinted}/1000 Minted</h4>
      <div style={{marginTop:"30px"}}>
      <button>
        Mint
      </button>
    </div>
  </div>
  )
}

export default MintSection
