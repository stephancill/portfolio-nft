import {useEffect,useState} from 'react'
import "./portfolioSetup.css"

const PortfolioAddTokens = ({walletConnected}) => {
  const [tokenList,setTokenList] = useState()
  const [tokens,setTokens] = useState([{}])


  useEffect(async()=>{
    if (walletConnected) {
      getTokenList()
    }
  },[walletConnected],[tokens])

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
    let showTokens = [{}]
    let a = 0
    for (let i = 0;i < tokenLength; i++){
      if (tokenList.tokens[i].symbol.substring(0,valueLenth).toUpperCase() === value.toUpperCase()) {
        showTokens[a] = {symbol:tokenList.tokens[i].symbol.toUpperCase(),logo:tokenList.tokens[i].logoURI}
        a=a+1
        console.log(tokenList)
      }
    }
    
    setTokens(showTokens)
  }

  return (
    <div>
      <input placeholder="Search a name, address or symbol" onChange={e => searchToken(e.target.value)}></input>
        <div className="b2">
        {tokens.map((token, i) => ( <>
            <div className="row" key={i} id={i}>
              <div>
                <img className="tokenIcon" src={token.logo}></img>
              </div>
              <div style={{marginLeft:"15px"}}>
                <h3 style={{margin:"0px",marginTop:"-2px"}}>{token.symbol}</h3>
                <h4 style={{margin:"0px",textAlign:"left"}} >test</h4>
              </div>
              <div className="col">
              </div>
            </div>
            </>
          ))}
        </div>
    </div>
  )
}

export default PortfolioAddTokens
