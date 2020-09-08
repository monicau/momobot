import React from 'react'
import './App.css'
import Chatbox from './Chatbox'


function App() {
  const bots = [ 'streamlabs', 'nightbot', 'm0m0_b0t']
  let isSpam = (msg, username) => {
      if (msg.startsWith('!')) {
          return true
      }
      return bots.includes(username)
  }
  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard</h1>
      </header>
      <Chatbox />
    </div>
  );
}

export default App;
