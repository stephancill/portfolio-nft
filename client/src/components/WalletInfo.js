
import "./mintSection.css"
import { useEffect } from 'react';


const WalletInfo = ({updateNetwork,walletAdd,wrongNetwork,network}) => {
let element = document.getElementById("network")

useEffect( async() => {
  element.value = network
  if (wrongNetwork==true) {
    element.value = "select"
  }
}, [wrongNetwork,network])

const changeNetwork=(e)=> {
  updateNetwork(element.value)
}
  return (
    <div>
      <div style={{textAlign:"left"}}>
        <select id="network" className="networkInput" onChange={() => changeNetwork()}>
          <option disabled value="select">Select a network</option>
          <option value={"137"}>Polygon</option>
          <option value={"1"}>Ethereum</option>
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
