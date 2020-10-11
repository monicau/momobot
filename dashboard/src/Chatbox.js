import React, { useState, useEffect } from 'react';
import './App.css';
import badgeMod from './assets/img/badge-mod.png';
import badgeSub from './assets/img/badge-sub.png';
import badgeVip from './assets/img/badge-vip.png';
import badgePrime from './assets/img/badge-prime.png';
import badgeBroadcaster from './assets/img/badge-broadcaster.png';
import badgeFounder from './assets/img/badge-founder.png';
import badgeGifter from './assets/img/badge-subgifter.png';
import badgeCheer from './assets/img/badge-cheer.png';

const client = require('./client')

// Connect to Twitch:
client.connect();

function Chatbox() {
    const [messages, setMessages] = useState([])

    useEffect(() => {
        var chatbox = document.getElementById("chatbox");
        chatbox.scrollTop = chatbox.scrollHeight;
    }, [messages])

    useEffect(()=> {
        function getBadges(context) {
            let badges = [];
            if (context.mod) {
                badges.push(badgeMod)
            } 
            if (context.badges == null) {
                return badges
            } 
            if ("subscriber" in context.badges) {
                badges.push(badgeSub)
            }
            if ("founder" in context.badges) {
                badges.push(badgeFounder)
            } 
            if ("sub-gifter" in context.badges) {
                badges.push(badgeGifter)
            } 
            if ("bits" in context.badges) {
                badges.push(badgeCheer)
            }
            if ("broadcaster" in context.badges) {
                badges.push(badgeBroadcaster)
            } 
            if ("vip" in context.badges) {
                badges.push(badgeVip)
            } 
            if ("premium" in context.badges) {
                badges.push(badgePrime)
            }
            return badges
        }

        function isSpam(msg, username) {
            const bots = [ 'streamlabs', 'nightbot', 'm0m0_b0t']
            if (msg.startsWith('!')) {
                return true
            }
            return bots.includes(username)
        }
        console.log("useEffect run!")
        // Called every time the bot connects to Twitch chat
        function onConnectedHandler(addr, port) {
            console.log(`* Connected to ${addr}:${port}`);
        }
        // Called every time a message comes in
        function onMessageHandler(target, context, msg, self) {
            if (!isSpam(msg, context.username)) {
                let badges = getBadges(context)
                setMessages((messages)=>[...messages, {username: context.username, color: context.color, message: msg, badges: badges}])
            }
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
        <div id="chatbox" className="chatbox">
            { messages.map((msgObj) => <div className="message" key={msgObj.message}>
                { msgObj.badges.map((badge)=><img src={badge} width="15px" />) }
                <span className="chatUser" style={{ color: msgObj.color != null? msgObj.color : "000000" }}>
                    {msgObj.username}
                </span>: {msgObj.message}
            </div>) }
        </div>
    )
}
export default Chatbox;
