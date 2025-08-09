import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Amplifyの設定は後で追加（amplify_outputs.jsonが生成されてから）
// import { Amplify } from "aws-amplify";
// import amplifyConfig from "../amplify_outputs.json";
// Amplify.configure(amplifyConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
