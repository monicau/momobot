import React, { useState, useEffect } from 'react';
import './App.css';

const client = require('./client')

// Connect to Twitch:
client.connect();

function Chatbox() {
    const [messages, setMessages] = useState(['1'])

    function addMessage(message) {
        setMessages((messages)=>[...messages, message])
    }

    useEffect(()=> {
        console.log("useEffect run!")
        // Called every time the bot connects to Twitch chat
        function onConnectedHandler(addr, port) {
            console.log(`* Connected to ${addr}:${port}`);
        }
        // Called every time a message comes in
        function onMessageHandler(target, context, msg, self) {
            setMessages((messages)=>[...messages, msg])
        }
        // Register our event handlers (defined below)
        client.on('message', onMessageHandler)
        client.on('connected', onConnectedHandler)

        return () => {
            client.off('message', onMessageHandler)
            client.off('connected', onConnectedHandler)
        }
    }, [])

    return (
        <div className="chatbox">
            { messages.map((message) => <div key={message}>{message}</div>) }
        </div>
    )
}
export default Chatbox;
