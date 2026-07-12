import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Double check this points precisely to App.jsx with a capital A
import './index.css'        // Imports your custom dark slate global style sheet variables

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
