  var sq1 = {x:0,y:0,width:0,height:0,col1:"",col2:"",rotate:""}
  var sq2 = {x:0,y:0,width:0,height:0,col1:"",col2:"",rotate:""}
  var ci1 = {x:150,y:150,radius:0,height:0,col1:"",col2:"",rotate:""}
  var ci2 = {x:150,y:150,radius:0,height:0,col1:"",col2:"",rotate:""}


  const sqr1 = () => {
    const width1 = getRndInteger(200,300);
    sq1.x = (300-width1)/2
    sq1.y = sq1.x
    sq1.width = width1
    sq1.height = width1
    sq1.col1 = getRndColor()+"0.4)"
    sq1.col2 = getRndColor()+"0.1)"
    sq1.rotate = getRndRotate()
    return sq1
  }

  const sqr2 = () => {
    const width1 = getRndInteger(80,250);
    sq2.x = (300-width1)/2
    sq2.y = sq2.x
    sq2.width = width1
    sq2.height = width1
    sq2.col1 = getRndColor()+"0.4)"
    sq2.col2 = getRndColor()+"0.1)"
    sq2.rotate = getRndRotate()
    return sq2
  }

  const cir1 = () => {
    const radius = getRndInteger(100,150)
    ci1.radius = radius 
    ci1.col1 = getRndColor()+"0.4)"
    ci1.col2 = getRndColor()+"0.1)"
    ci1.rotate = getRndRotate()
    return ci1
  }

  const cir2 = () => {
    const radius = getRndInteger(50,150)
    ci2.radius = radius 
    ci2.col1 = getRndColor()+"0.4)"
    ci2.col2 = getRndColor()+"0.1)"
    ci2.rotate = getRndRotate()
    return ci2
  }

  function getRndInteger(min, max) {
    return Math.floor(Math.random() * ((max+1) - min) ) + min;
  }
  function getRndColor() {
    return "rgba("+getRndInteger(0,255).toString()+","+getRndInteger(0,255).toString()+","+getRndInteger(0,255).toString()+","
  }
  function getRndRotate() {
    const deg = getRndInteger(0,8) 
    return "rotate("+(45*deg).toString()+" 150 150 )"
  }

module.exports = {
    sqr1, sqr2, cir1, cir2, getRndInteger
}