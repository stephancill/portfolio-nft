import generate from "./generate.js"
import { useState } from "react"

const Demo = () => {
  const [obj1, setObj1] = useState()
  const [obj2, setObj2] = useState()
  const [col01, setCol01] = useState("")
  const [col02, setCol02] = useState("")
  const [col11, setCol11] = useState("")
  const [col12, setCol12] = useState("")

  function populate() {
    var sqr1 = (generate.sqr1())
    var sqr2 = (generate.sqr2())
    var cir1 = (generate.cir1())
    var cir2 = (generate.cir2())
    var topSqr = (<rect x={sqr1.x} y={sqr1.y} width={sqr1.width} height={sqr1.height} transform={sqr1.rotate} fill="url(#paint0)"/>)
    var botSqr = (<rect x={sqr2.x} y={sqr2.y} width={sqr2.width} height={sqr2.height} transform={sqr2.rotate} fill="url(#paint1)"/>)
    var topCir = (<circle cx={cir1.x} cy={cir1.y} r={cir1.radius} transform={cir1.rotate} fill="url(#paint0)"/>)
    var botCir = (<circle cx={cir2.x} cy={cir2.y} r={cir2.radius} transform={cir2.rotate} fill="url(#paint1)"/>)
    setCol01(sqr1.col1)
    setCol02(sqr1.col2)
    setCol11(sqr2.col1)
    setCol12(sqr2.col2)
    
    var a = generate.getRndInteger(0,1)
    var b = generate.getRndInteger(0,1)
    if (a===0 && b===0) {
      setObj1(topSqr)
      setObj2(botSqr)
    } else if (a===1 && b===0){
      setObj1(topCir)
      setObj2(botSqr)
    } else if (a===0 && b===1){
      setObj1(topSqr)
      setObj2(botCir)
    } else {
      setObj1(topCir)
      setObj2(botCir)
    }
  }

  window.onload = () => {
    setInterval(function(){
      populate()
    }, 1000);
   }
  
  var h1 = "{ font: bold 30px sans-serif; fill:white}"
  var h2 = "{ font: normal 24px sans-serif; fill:white}"
  var h3 = "{ font: normal 14px sans-serif; fill:white}"

  return (
    <div>
      {obj1}

      <svg viewBox="0 0 300 300" fill="none" overflow="hidden" xmlns="http://www.w3.org/2000/svg">
        <style>
          .h1 {h1}
          .h2 {h2}
          .h3 {h3}
        </style>
        <rect width="300" height="300" fill="#272727"/>
        {obj1}
        {obj2}
        <defs>
        <linearGradient id="paint0" gradientUnits="userSpaceOnUse">
        <stop stop-color={col01}/>
        <stop offset="0.5" stop-color={col02} />
        </linearGradient>
        <linearGradient id="paint1" gradientUnits="userSpaceOnUse">
        <stop stop-color={col11} stop-opacity="1"/> 
        <stop offset="0.5" stop-color={col12} />
        </linearGradient>
        <linearGradient id="stroke" x1="20%" y1="60%" x2="30%" y2="0%">
        <stop offset="50%"   stop-color="#fff" />
        <stop offset="100%" stop-color="#fff" />
        </linearGradient>
        </defs>
        <text x="20" y="30" class="h3">Wallet 1293</text>
        <text x="20" y="58" class="h1">$6,923,039</text>
        <text x="20" y="100" class="h2">KLIMA</text><text x="150" y="100" class="h2">$4,930,323</text>
        <text x="20" y="114" class="h3">220.32</text>
        <text x="20" y="145" class="h2">OHM</text><text x="150" y="145" class="h2">$1,930,242</text>
        <text x="20" y="159" class="h3">20.32</text>
        <text x="20" y="190" class="h2">ETH</text><text x="150" y="190" class="h2">$50,542</text>
        <text x="20" y="204" class="h3">3.02</text>
        <text x="20" y="235" class="h2">USDC</text><text x="150" y="235" class="h2">$9,200</text>
        <text x="20" y="249" class="h3">9200.42</text>
        <text x="20" y="280" class="h2">Other</text><text x="150" y="280" class="h2">$2,732</text>
        <rect width="300" height="300" fill="none" stroke="url(#stroke)"  stroke-width="1"/>
      </svg>
    </div>
  );
}

export default Demo
