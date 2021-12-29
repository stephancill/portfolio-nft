
import "./mintSection.css"

const WalletInfo = ({updateNetwork,walletAdd}) => {

const changeNetwork=(e)=> {
  let element = document.getElementById("network")
  updateNetwork(element.value)
}
  return (
    <div>
      <div style={{textAlign:"left"}}>
        <select id="network" className="networkInput" onChange={() => changeNetwork()}>
          <option disabled>Select a network</option>
          <option value={137}>Polygon</option>
          <option value={1}>Ethereum</option>
        </select>
      </div>
      <div className="connectedAddress">
        <div className="addText">
        {walletAdd}
        </div>
      </div>
    </div>
  )
}

export default WalletInfo
