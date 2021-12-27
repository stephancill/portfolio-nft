import logo from "./../img/logo.svg"
const Logo = () => {
  return (
    <div style={{display:"flex",marginLeft:"0px",marginTop:"100px",marginBottom:"100px"}}>
      <img src={logo}></img>
      <h1 style={{marginLeft:"20px"}}>Lens Portfolio</h1>
    </div>
  )
}

export default Logo
