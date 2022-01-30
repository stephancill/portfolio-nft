import {useEffect,useState} from 'react'
import {IoIosAddCircle,IoIosRemoveCircle} from 'react-icons/io'
import { useAlert } from 'react-alert'
import "./portfolioSetup.css"
import { ethers } from "ethers";
import { getPathsDetail } from "lens-tasks/portfolio-nft"

const PortfolioAddTokens = ({tokenList,signer,walletAddress,cont, setShouldFetchUpdatedSVG,selectedNFTToken,getTrackedTokens,trackedTokens}) => {
  const [tokens,setTokens] = useState([{}])
  const [userTokens,setUserTokens] = useState([])
  const [allPricePaths, setAllPricePaths] = useState({})
  const [selectedPricePaths, setSelectedPricePaths] = useState({})
  const [baseTokenAddress, setBaseTokenAddress] = useState(undefined)
  const alert = useAlert()

  useEffect(async()=>{
    if (tokenList) {
      searchToken("")
      console.log(tokenList)
    }
  },[])

  const searchToken = (value) => {
    const tokenLength = tokenList.tokens.length
    const valueLenth = value.length
    let showTokens = [{}]
    let a = 0
    for (let i = 0;i < tokenLength; i++){
      let onUserList = false
      for (let k=0;k<trackedTokens.length;k++) {
        if ((trackedTokens[k].symbol==tokenList.tokens[i].symbol)) {
          onUserList=true
        }
      }
      if (!onUserList) {
        if (tokenList.tokens[i].symbol.substring(0,valueLenth).toUpperCase() === value.toUpperCase()) {
          showTokens[a] = {symbol:tokenList.tokens[i].symbol.toUpperCase(),logo:tokenList.tokens[i].logoURI,address:tokenList.tokens[i].address} 
          a=a+1
        }
      }
    }
    setTokens(showTokens)
  }

  const addUserToken = (a) => {
    let foundDuplicate = false
    if (userTokens) {
      for (let j = 0 ; j< userTokens.length;j++){
          if (tokens[a].symbol.toUpperCase()=== userTokens[j].symbol.toUpperCase() ) {
            foundDuplicate = true
            break
          }
      }
    } else {
      foundDuplicate = true
    }

    if(foundDuplicate==false){
      const newToken = tokens[a]
      setUserTokens(userTokens => [...userTokens, newToken]);
      // Get price path
      const _newPricePaths = {...allPricePaths}
      _newPricePaths[newToken.address.toLowerCase()] = null
      setAllPricePaths(_newPricePaths);
      (async () => {
        let baseTokens = tokenList.tokens.filter(function (t) {
          return ['DAI', 'USDC', 'USDT', 'FRAX', 'ETH'].includes(t.symbol)
        }).map((el) => {
          return el.address
        }) 
        const portfolioNFTDeployment = cont.contracts.PortfolioNFT
        const portfolioNFT = new ethers.Contract(portfolioNFTDeployment.address, portfolioNFTDeployment.abi, signer)
        let _baseTokenAddress = baseTokenAddress 
        if (!_baseTokenAddress) {
          _baseTokenAddress = await portfolioNFT.baseTokenAddress()
          setBaseTokenAddress(_baseTokenAddress)
        }
      

        let pathsDetail = await getPathsDetail({
          tokenIn: newToken.address, 
          tokenOut: _baseTokenAddress, 
          baseTokens: baseTokens, 
          pairFactoryAddress: cont.contracts.UniswapV2Factory.address, 
          provider: signer.provider
        })
        const poolMemo = {}
        pathsDetail = pathsDetail.map(path => {
          return path.map(pool => {
            ["tokenIn", "tokenOut"].map(tokenKey => {
              if (pool[tokenKey].toLowerCase() in poolMemo) {
                pool[tokenKey] = poolMemo[pool[tokenKey]]
              } else {
                let token = tokenList.tokens.find(item => item.address.toLowerCase() == pool[tokenKey].toLowerCase())
                if (!token) {
                  const contract = new ethers.Contract(pool[tokenKey], cont.contracts.BaseToken.abi, signer)
                  const symbol = `(${pool[tokenKey]})` // TODO: Get symbol
                  token = {address: pool[tokenKey], symbol}
                }
                poolMemo[pool[tokenKey]] = token
                pool[tokenKey] = token
              }
            })
            return pool
          })
        })
        const newPricePaths = {...allPricePaths}
        newPricePaths[newToken.address.toLowerCase()] = pathsDetail
        setAllPricePaths(newPricePaths)
      })()
    }
  }

  const setSelectedPathForToken = (tokenAddress, pricePath) => {
    const newSelectedPricePaths = {...selectedPricePaths}
    newSelectedPricePaths[tokenAddress] = pricePath
    setSelectedPricePaths(newSelectedPricePaths)
  }

  const updateTokens = async () => {
    const deployment = cont.contracts.PortfolioNFT
    const portfolioNFT = new ethers.Contract(deployment.address, deployment.abi, signer)
    let tokenAddresss = userTokens.map(token => token.address)
    let tokenPricePaths = userTokens.map(token => selectedPricePaths[token.address.toLowerCase()]) 
    const tx = await portfolioNFT.connect(signer).trackTokens(selectedNFTToken,tokenAddresss,tokenPricePaths)
    const txInfo = await tx.wait()
    if (txInfo.status=1) {
      getTrackedTokens(selectedNFTToken)
      resetAddTokenList()
      alert.info('Traked tokens updated')
    } else {
      alert.else('Cancelled or failed')
    }
    setShouldFetchUpdatedSVG(true)
  }

  const resetAddTokenList = () => {
    let tempArr = []
    setUserTokens(tempArr);
  }
  
  const removeUserList = (a)=> {
    setUserTokens(userTokens.filter(item => item !== userTokens[a]));
  }

  const hideItem = (i) => {
    let r1 = document.getElementById("add"+i)
    r1.style.display = "none"
  }
  const showItem = (i) => {
    let r1 = document.getElementById("add"+i)
    r1.style.display = "block"
  }
  const hideItemList = (i) => {
    let r1 = document.getElementById("item"+i)
    r1.style.display = "none"
  }
  const showItemList = (i) => {
    let r1 = document.getElementById("item"+i)
    r1.style.display = "block"
  }

  return (
    <div>
      <input placeholder="Search a name, address or symbol" onChange={e => searchToken(e.target.value)}></input>
        <div className="b2" style={{marginTop:"-10px"}}>
        {(tokens.length > 10 ? [] : tokens).map((token, i) => ( <>
            <div className="row" key={i} id={i}
            onMouseEnter={() => showItem(i)}
            onMouseLeave={() => hideItem(i)} >
                <img className="tokenIcon" src={token.logo}></img>
              <div style={{marginLeft:"15px",height:"30px"}}>
                <h3 style={{margin:"none",marginTop:"6px",width:"200px"}}>{token.symbol}</h3>
              </div>
              <div className="col">
                <div id={"add"+i} style={{display:"none"}} >
                  <button className=" innerRowBtn" name={token.symbol} onClick={()=>addUserToken(i)} style={{width:"80px"}}>
                    Add
                    <IoIosAddCircle className="innerRowIcon"></IoIosAddCircle>
                  </button>
                </div>
              </div>
            </div>
            </>
          ))}
        </div>
        {userTokens[0] ? <>
        <h3 style={{marginBottom:"10px"}}>Your Tokens To Add</h3>
        <div className="b2">
        {userTokens.map((token, i) => ( <>
            <div className="rowAddToken" key={i} id={i} 
            onMouseEnter={() => showItemList(i)}
            onMouseLeave={() => hideItemList(i)} >
              <div className='col'>
                <div style={{display:"flex"}}>
                  <img className="tokenIcon" src={token.logo}></img>
                  <div style={{marginLeft:"15px",height:"30px"}}>
                    <h3 style={{margin:"none",marginTop:"6px",width:"190px"}}>{token.symbol}</h3>
                  </div>
                  <div className="col">
                    <div id={"item"+i} style={{display:"none"}} >
                      <button className=" innerRowBtn" onClick={()=>removeUserList(i)} style={{width:"100px"}}>
                        Cancel
                        <IoIosRemoveCircle className="innerRowIcon"></IoIosRemoveCircle>
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",marginTop:"5px"}}>
                  <select className="pathSelect">
                    <option disabled value="select" selected>{
                    allPricePaths[token.address.toLowerCase()] === null ? "Loading price paths" : "Select a price path"
                    }</option>

                    {allPricePaths[token.address.toLowerCase()] && allPricePaths[token.address.toLowerCase()].length > 0 ? 
                    allPricePaths[token.address.toLowerCase()].map((pricePath, index) => {
                      return (
                      <option onClick={() => setSelectedPathForToken(token.address, pricePath.map(pool => pool.poolAddress))} key={index}>
                        {[...pricePath.map(pool => pool.tokenIn.symbol), pricePath[pricePath.length-1].tokenOut.symbol].join(" -> ")}
                      </option>)
                    }) : allPricePaths[token.address.toLowerCase()] !== undefined ? "Loading..." : <></>}
                  </select>
                </div>
              </div>
            </div>
            </>
          ))}
        </div>
        <button style={{marginTop:"30px"}} onClick={updateTokens} >Add Tokens</button>
        </>: <></>}
    </div>
  )
}

export default PortfolioAddTokens
