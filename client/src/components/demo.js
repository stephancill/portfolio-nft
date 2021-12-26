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
      console.log("s")
    }, 1500);
   }

    
  
  var h1 = "{ font: bold 30px sans-serif; fill:white}"
  var h2 = "{ font: normal 24px sans-serif; fill:white}"
  var h3 = "{ font: normal 14px sans-serif; fill:white}"

  return (
    <div >
      {obj1}
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <linearGradient id="stro" gradientUnits="userSpaceOnUse">
        <stop stop-color="#BF953F"/>
        <stop offset="0.5" stop-color="#FCF6BA" />
        </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default Demo
