import demoNFT from "./../img/demoNFT.png"
import "./portfolioSetup.css"

const PortfolioSetup = ({trackedAssets}) => {

  let tokenPrint =  []
  if (trackedAssets) {
    for (let i = 0;i<trackedAssets.length;i++) {
      tokenPrint.push (
      <>
        <div className="row" id={"row"+i}>
          <div className="col">
            <h3>{trackedAssets[i].symbol}</h3>
          </div>
          <div className="col">
            <h3>{trackedAssets[i].balance}</h3>
          </div>
          <div className="col" style={{margin:"1px",marginRight:"10px"}}>
            <button className="tableBtn" id={i}>Remove</button>
          </div>
        </div>
        { i != trackedAssets.length-1 && 
         <div className="tableDiv"></div>
        }
      </>)
    }
  }

  return (
    <div>
      <h2>Setup</h2>
      <h3 style={{marginTop:"10px"}}>Select a portfolio to configure.</h3>
      <button className="NFTBtn">
        <img src={demoNFT}></img>
      </button>
      <h3 style={{marginTop:"30px"}}>Wallet 202322</h3>
      <div className="b2">
        {tokenPrint}
        <button className="addTokenBtn">Add Token</button>
      </div>
      <button style={{marginTop:"30px"}}>Update</button>
    </div>
  )
}

export default PortfolioSetup
