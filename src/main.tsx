import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './style.css'

console.log('🐱 Cat vs Bush Shoe Thrower - Ready to Play!')
console.log('Controls: A/D to move, K to switch camera, Space to throw shoe')

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)