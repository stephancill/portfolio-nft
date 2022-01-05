import {useEffect} from 'react'
import "./portfolioSetup.css"

const PortfolioAddTokens = ({walletConnected}) => {

  useEffect(async()=>{
    if (walletConnected) {
      getTokenList()
    }
  },[walletConnected])

  const getTokenList = async () => {
    console.log( await getJSON("https://tokens.coingecko.com/uniswap/all.json"))
  }

  const getJSON = async (url) => {
    const blob = await fetch(url)
    const json = await blob.json()
    return json
  };

  return (
    <div>
      <input placeholder="Search a name, address or symbol"></input>
        <div className="b2">
        </div>
    </div>
  )
}

export default PortfolioAddTokens
