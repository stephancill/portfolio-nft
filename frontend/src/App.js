import './App.css';
import generate from './generate.js'

function App() {
  var sqr1 = generate.sqr1()
  var sqr2 = generate.sqr2()
  var cir1 = generate.cir1()
  var cir2 = generate.cir2()
  var obj1 
  var obj2
    var a = generate.getRndInteger(0,1)
    var b = generate.getRndInteger(0,1)
    console.log(a +"-"+b)
    if (a===0 && b===0) {
      obj1 = <rect x={sqr1.x} y={sqr1.y} width={sqr1.width} height={sqr1.height} transform={sqr1.rotate} fill="url(#paint0)"/>
      obj2 = <rect x={sqr2.x} y={sqr2.y} width={sqr2.width} height={sqr2.height} transform={sqr2.rotate} fill="url(#paint1)"/>
    } else if (a===1 && b===0){
      obj1 = <circle cx={cir1.x} cy={cir1.y} r={cir1.radius} transform={cir1.rotate} fill="url(#paint0)"/>
      obj2 = <rect x={sqr2.x} y={sqr2.y} width={sqr2.width} height={sqr2.height} transform={sqr2.rotate} fill="url(#paint1)"/>
    } else if (a===0 && b===1){
      obj1 = <rect x={sqr1.x} y={sqr1.y} width={sqr1.width} height={sqr1.height} transform={sqr1.rotate} fill="url(#paint0)"/>
      obj2 = <circle cx={cir2.x} cy={cir2.y} r={cir2.radius} transform={cir2.rotate} fill="url(#paint1)"/>
    } else {
      obj1 = <circle cx={cir1.x} cy={cir1.y} r={cir1.radius} transform={cir1.rotate} fill="url(#paint0)"/>
      obj2 = <circle cx={cir2.x} cy={cir2.y} r={cir2.radius} transform={cir2.rotate} fill="url(#paint1)"/>
    }
  
  var h1 = "{ font: bold 30px sans-serif; fill:white}"
  var h2 = "{ font: normal 24px sans-serif; fill:white}"
  var h3 = "{ font: normal 16px sans-serif; fill:white}"
  var h4 = "{ font: normal 14px sans-serif; fill:white}"



  return (
    <div className="App">
      <header className="App-header">
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>
          .h1 {h1}
          .h2 {h2}
          .h3 {h3}
          .h4 {h4}
        </style>
        <rect width="300" height="300" fill="#272727"/>
        {obj1}
        {obj2}
        <defs>
        <linearGradient id="paint0" gradientUnits="userSpaceOnUse">
        <stop stop-color={sqr1.col1}/>
        <stop offset="0.5" stop-color={sqr1.col2} />
        </linearGradient>
        <linearGradient id="paint1" gradientUnits="userSpaceOnUse">
        <stop stop-color={sqr2.col1} stop-opacity="1"/> 
        <stop offset="0.5" stop-color={sqr2.col2} />
        </linearGradient>
        </defs>
        <text x="20" y="30" class="h4">Wallet 1293</text>
        <text x="20" y="58" class="h1">$6,900,000</text>
        <text x="20" y="100" class="h2">KLIMA</text><text x="150" y="100" class="h2">$2,900,000</text>
        <text x="20" y="114" class="h4">420.32</text>
        <text x="20" y="145" class="h2">OHM</text><text x="150" y="145" class="h2">$4,200</text>
        <text x="20" y="159" class="h4">20.32</text>
        <text x="20" y="190" class="h2">ETH</text><text x="150" y="190" class="h2">$4,142</text>
        <text x="20" y="204" class="h4">1.02</text>
        <text x="20" y="235" class="h2">USDC</text><text x="150" y="235" class="h2">$2,223</text>
        <text x="20" y="249" class="h4">2223.42</text>
        <text x="20" y="280" class="h2">Other</text><text x="150" y="280" class="h2">$4,200</text>




        

      </svg>
      </header>
    </div>
  );
}

export default App;
