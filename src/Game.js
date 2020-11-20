module.exports = () => {
    const Card = require('./Card.js')

    const enumValue = (name) => Object.freeze({ toString: () => name })

    // Define states
    const STATE = Object.freeze({
        STARTED: enumValue("STATE.STARTED"),
        PLAYERSTURN: enumValue("STATE.PLAYERSTURN"),
        DEALERSTURN: enumValue("STATE.DEALERSTURN"),
        ENDED: enumValue("STATE.ENDED")
    })

    // Define user states
    const USERSTATE = Object.freeze({
        STARTED: enumValue("USERSTATE.STARTED"),
        ACTIVE: enumValue("USERSTATE.ACTIVE"),
        BUSTED: enumValue("USERSTATE.BUSTED"),
        HOLD: enumValue("USERSTATE.HOLD"),
    })

    let users = []
    let startTime = null
    let endTime = 0
    let state = STATE.ENDED
    let dealerHand = []
    let deck = []

    let main = (userParam, { username }, sendToChat) => {
        const currentTime = Date.now() / 1000
        if (startTime == null && (currentTime-endTime) > 28800) {
            sendToChat(`Welcome to Momo Casino! ${username} started a blackjack game! You have 2 minutes to join. Join the table with: !blackjack`)
            startTime = currentTime
            state = STATE.STARTED
            users.push({ user: username, bet: userParam, hand: [], state: USERSTATE.STARTED })
            
            setTimeout(() => startGame(sendToChat), 120000)
        } else if (startTime != null && state == STATE.STARTED) {
            if (users.find(x => x.user == username) == undefined) {
                sendToChat(`Hello ${username}! You've joined the table.`)
                users.push({ user: username, bet: userParam, hand: [], state: USERSTATE.STARTED })
            }
        } else if (state == STATE.PLAYERSTURN && (userParam == 'hit')) {
            const user = users.find(x => x.user == username)
            if (user != undefined) {
                if (user.state == USERSTATE.ACTIVE) {
                    hit(username)
                    sendToChat(printHand(username, user.hand))
                    const handValue = getHandValue(username)
            
                    if (handValue > 21) {
                        user.state = USERSTATE.BUSTED
                    }
                }
            }
        } else if (state == STATE.PLAYERSTURN && userParam == 'hold') {
            const user = users.find(x => x.user == username)
            if (user != undefined && user.state == USERSTATE.ACTIVE) {
                user.state = USERSTATE.HOLD
                sendToChat(`${username} holds.`)
            }
        } else if ((currentTime-endTime) < 28800) {
            const cooldown = Math.floor((28800 - (currentTime-endTime)/60))
            sendToChat(`The Blackjack table is closed for the next ${cooldown} minutes.`)
        }
    }

    let startGame = (sendToChat) => {
        deck = resetDeck()
        dealerHand = []
        state = STATE.PLAYERSTURN
        // Shuffle deck!
        shuffle()
        // Deal initial hand
        deal()
        // Print everyone's hand
        let handMessage = `${printHand('Dealer', dealerHand, true)} \n`
        for (let i = 0; i < users.length; i++) {
            handMessage += ` ${printHand(users[i].user, users[i].hand)} `
        }
        // Set timeout for user actions
        setTimeout(() => dealerPlays(sendToChat), 30000)
        sendToChat(handMessage)
    }

    let resetDeck = () => {
        let deck = []
        let suits = [' ♠ ', ' ♣ ', ' ♥ ', ' ♦ ']
        for (let i = 0; i < 4; i++) { // alternative ES6 [...Array.from(4)].forEach(...)
            for (let j = 1; j <= 13; j++) { // alternative ES6 [...Array.from(13)].forEach(...)
                if (j == 11) {
                    deck.push(new Card('J', suits[i]))
                } else if (j == 12) {
                    deck.push(new Card('Q', suits[i]))
                } else if (j == 13) {
                    deck.push(new Card('K', suits[i]))
                } else if (j == 1) {
                    deck.push(new Card('A', suits[i]))
                } else {
                    deck.push(new Card(j, suits[i]))
                }
            }
        }
        return deck
    }

    let shuffle = () => {
        deck.sort(() => Math.random() - 0.5);
    }

    let deal = () => {
        // Deal for users
        for (let i = 0; i < users.length; i++) {
            users[i].hand.push(deck.pop())
            users[i].hand.push(deck.pop())
            users[i].state = USERSTATE.ACTIVE
        }
        // Deal for dealer
        dealerHand.push(deck.pop())
        dealerHand.push(deck.pop())
    }

    let hit = (username, dealer = false) => {
        if (dealer) {
            dealerHand.push(deck.pop())
        } else {
            const user = users.find(x => x.user == username)
            user.hand.push(deck.pop())
        }
    }
    let getHandValue = (username, dealer = false) => {
        // console.log('getting hand value of', username)
        let hand = []
        if (dealer) {
            hand = dealerHand
        } else {
            const user = users.find(x => x.user == username)
            hand = user.hand
        }
        // console.log(hand)
        const reducer = (acc, card) => acc + card.getNumberValue()
        //THIS IS AWESOME. - DDT 2020-08-03 21.30 (ish)
        let minValue = hand.reduce(reducer, 0)
        if (minValue >= 21) {
            return minValue
        } else {
            // Count the number of aces
            const aceCounter = (acc, card) => {
                if (card.getNumberValue() == 1) {
                    return acc + 1
                } else {
                    return acc + 0
                }
            }
            let aceCount = hand.reduce(aceCounter, 0)
            //IDK how to code this part in JS:
            return Math.min(aceCount, Math.floor((21 - minValue) / 10)) * 10 + minValue
        }
    }

    let dealerPlays = (sendToChat) => {
        //Display the dealer's hand before hitting
        state = STATE.DEALERSTURN
        sendToChat("Round ends for players! Dealer is now playing. Dealer's current hand:")
        sendToChat(printHand('Dealer', dealerHand, true))
        // Make all users hold
        for (let i = 0; i < users.length; i++) {
            //If busted, don't change the state
            if (users[i].state != USERSTATE.BUSTED) {
                users[i].state = USERSTATE.HOLD
            }
        }
        // Deal for dealer
        while (getHandValue('Dealer', true) < 17) {
            hit('dealer', true)
            sendToChat(printHand('Dealer', dealerHand, true))
        }
        sendToChat('Dealer ends with:' + printHand('Dealer', dealerHand, true))
        endRound(sendToChat)
    }

    let endRound = (sendToChat) => {
        state = STATE.ENDED

        const USEROUTCOME = Object.freeze({
            WIN: enumValue("STATE.WIN"),
            LOSE: enumValue("STATE.LOSE"),
            TIE: enumValue("STATE.TIE"),
        })
        for (let i = 0; i < users.length; i++) {
            //Tie for default
            let outcome = USEROUTCOME.TIE

            //Check if user's hand is greater than dealer's
            if (getHandValue("Dealer", true) <= 21) {
                // Dealer didn't bust, compare user's hand to dealer's

                if (users[i].state == USERSTATE.BUSTED || getHandValue(users[i].user) < getHandValue("Dealer", true)) {
                    outcome = USEROUTCOME.LOSE
                } else if (getHandValue(users[i].user) > getHandValue("Dealer", true)) {
                    outcome = USEROUTCOME.WIN
                }
            } else if (users[i].state == USERSTATE.BUSTED) {
                //If dealer's busted but user is also busted
                outcome = USEROUTCOME.LOSE
            } else {
                // Dealer is busted
                outcome = USEROUTCOME.WIN
            }

            // Payout
            if (outcome == USEROUTCOME.WIN) {
                sendToChat("!addpoints " + users[i].user + " 1")
            } else if (outcome == USEROUTCOME.LOSE) {
                sendToChat("!removepoints " + users[i].user + " 1")
            }
        }
        state = STATE.ENDED
        startTime = null
        endTime = Date.now() / 1000
        users = []
    }

    let printHand = (username, hand, isDealer = false) => {
        let msg = '@' + username + ': '
        let handValue = 0
        if (isDealer) {
            if (state == STATE.DEALERSTURN) {
                for (let i = 0; i < hand.length; i++) {
                    msg += ' ' + hand[i].print() + ' '
                }
            } else {
                msg += hand[0].print()
                msg += '[??]'
            }
            handValue = getHandValue('Dealer', true)
        } else {
            for (let i = 0; i < hand.length; i++) {
                msg += ' ' + hand[i].print() + ' '
            }
            handValue = getHandValue(username)
        }
        if (handValue == 21) {
            msg += ' PogChamp 21!!!!!'
        } else if (handValue > 21) {
            msg += ' BibleThump BUSTED!'
        } else {
            msg += ' FBCatch '
        }
        return msg
    }
    return Object.freeze({
        state,
        startTime,
        main,
        startGame,
        hit,
        printHand,
        resetDeck,
        shuffle,
        deal,
        endRound,
        getHandValue
    })
}