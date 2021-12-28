import "./percentageSold.css"
const PercentageSold = ({amountMinted}) => {
  const percL = (amountMinted/1000)*100
  const percentageL = { width: percL+"%"}
  const percentageR = { width: (100-percL)+"%"}
  return (
    <div className="percContainer">
      <div className="left" style={percentageL}></div>
      <div className="right" style={percentageR}></div>
    </div>
  )
}

export default PercentageSold
