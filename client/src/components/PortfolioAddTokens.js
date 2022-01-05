import {useEffect,useState} from 'react'
import "./portfolioSetup.css"

const PortfolioAddTokens = ({walletConnected}) => {
  const [tokenList,setTokenList] = useState()


  useEffect(async()=>{
    if (walletConnected) {
      getTokenList()
    }
  },[walletConnected])

  const getTokenList = async () => {
    await setTokenList( await getJSON("https://tokens.coingecko.com/uniswap/all.json"))
  }

  const getJSON = async (url) => {
    const blob = await fetch(url)
    const json = await blob.json()
    return json
  };

  const searchToken = (value) => {
    const tokenLength = tokenList.tokens.length
    const valueLenth = value.length
    for (let i = 0;i < tokenLength; i++){
      if (tokenList.tokens[i].symbol.substring(0,valueLenth) === value) {
        console.log(value+"sosiamds")
      }
    }
  }

  return (
    <div>
      <input placeholder="Search a name, address or symbol" onChange={e => searchToken(e.target.value)}></input>
        <div className="b2">
        </div>
    </div>
  )
}

export default PortfolioAddTokens
