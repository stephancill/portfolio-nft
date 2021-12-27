
import "./connectWalletInfo.css"

const connectWalletInfo = ({amountMinted}) => {
  const percL = (amountMinted/1000)*100
  const percentageL = { width: percL+"%"}
  const percentageR = { width: (100-percL)+"%"}
  return (
    <div>
      <h3>The first 1000 Lens Portfolio NFTs can be minited for free. There on 0.1 ETH each.</h3>
      <div className="percContainer">
        <div className="left" style={percentageL}></div>
        <div className="right" style={percentageR}></div>
      </div>
      <h4 style={{marginTop:"10px"}}>{amountMinted}/1000 Minted</h4>

    </div>
  )
}

export default connectWalletInfo
