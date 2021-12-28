import PercentageSold from "./PercentageSold"

const connectWalletInfo = ({amountMinted}) => {
  return (
    <div>
      <h3>The first 1000 Lens Portfolio NFTs can be minited for free. There on 0.1 ETH each.</h3>
      <PercentageSold amountMinted={amountMinted}/>
      <h4 style={{marginTop:"10px"}}>{amountMinted}/1000 Minted</h4>
    </div>
  )
}

export default connectWalletInfo
