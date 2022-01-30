import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { transitions, positions, Provider as AlertProvider } from 'react-alert'

const options = {
  // you can also just use 'bottom center'
  position: positions.BOTTOM_CENTER,
  timeout: 5000,
  offset: '30px',
  transition: transitions.SCALE
}

const error = "notifyBackground notifyError"
const  success = "notifyBackground notifySuccess"

const AlertTemplate = ({ style, options, message, close }) => (
  <div style={style} class={options.type === 'info' && success || error}>
    {message}
  </div>
)

ReactDOM.render(
   <AlertProvider template={AlertTemplate} {...options}>
   <App />
 </AlertProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
