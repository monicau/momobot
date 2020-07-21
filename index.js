const Card = require('./Card.js')
const tmi = require('tmi.js');

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [
    process.env.CHANNEL_NAME
  ]
};

// Create a client with our option s
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim(); // !blackjack 10 / hit / stay
  const commandParams = commandName.split(' ');
  let userParam = 0;
  if (commandParams.length > 1) {
    userParam = commandParams[1]; 
  }
  
  // If the command is known, let's execute it
  if (commandName === '!d20') {
    const num = rollDice(commandName);
    client.say(target, `You rolled a ${num}!`);
    console.log(`* Executed ${commandName} command`);
  } else if (commandName.startsWith('!blackjack')) {
    // Start of black jack
    const currentTime = Date.now()/1000;
    if (game.start_time == null) {
        client.say(target, `Welcome to Momo Casino! ${context.username} started a blackjack game! Join the table with: !blackjack <amount>`);
        game.start_time = currentTime;
        game.users.push({ user: context.username, bet: userParam, hand: [], state: 'playing'});
        setTimeout(startGame.bind(null, client, target), 10000);
    } else if (game.start_time != null && !game.gameStarted) {
        if (game.users.find(x => x.user == context.username) == undefined) {
            client.say(target, `Hello ${context.username}! You've joined the table.`);
            game.users.push({ user: context.username, bet: userParam, hand: [], state: 'playing'});
        }
    } else if (game.gameStarted && userParam == 'hit') {
        const user = game.users.find(x => x.user == context.username);
        if (user != undefined) {
            if (user.state == 'playing') {
                hit(context.username);
                client.say(target, printHand(context.username, user.hand));
                if (getHandValue(context.username) > 21) {
                    user.state = 'busted';
                    client.say(target, 'BUSTED! BibleThump')
                }
            }
        }
    } else if (game.gameStarted && userParam == 'stay') {
        
    }
    // console.log(game);
  } else if (commandName === '!beg') {
    client.say(target, `!addpoints ${context.username} 1`);
    client.say(target, `You sad sad thing.`);
  }
}

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 20;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

// Set up deck of cards
function resetDeck() {
    let deck = [];
    let suits = [' ♠ ', ' ♣ ', ' ♥ ', ' ♦ '];
    for (let i=0; i<4; i++) {
        for (let j=1; j <= 13; j++) {
            if (j == 11) {
                deck.push(new Card('J', suits[i]));
            } else if (j == 12) {
                deck.push(new Card('Q', suits[i]));
            } else if (j == 13) {
                deck.push(new Card('K', suits[i]));
            } else if (j == 1) {
                deck.push(new Card('A', suits[i]));
            } else {
                deck.push(new Card(j, suits[i]));
            }
        }
    }
    return deck;
}
let game = {
    users: [],
    start_time: null,
    gameStarted: false,
    dealerHand: [],
    deck: [],
};
function startGame(client, target) {
    game.deck = resetDeck();
    game.dealerHand = [];
    game.gameStarted = true;
    // Shuffle deck!
    shuffle();
    // Deal initial hand
    deal();
    // Print everyone's hand
    let handMessage = `${printHand('Dealer', game.dealerHand, true)} \n`;
    for (let i=0; i<game.users.length; i++) {
        handMessage += ` ${printHand(game.users[i].user, game.users[i].hand)} `
    }
    client.say(target, handMessage);
    // Set timeout for user actions
    setTimeout(endRound, 10000);
}
function shuffle() {
    for (let i = game.deck.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * i);
        const temp = game.deck[i];
        game.deck[i] = game.deck[j];
        game.deck[j] = temp;
    }
}
function deal() {
    // Deal for users
    for (let i=0; i<game.users.length; i++) {
        game.users[i].hand.push(game.deck.pop());
        game.users[i].hand.push(game.deck.pop());
    }
    // Deal for bot
    game.dealerHand.push(game.deck.pop());
    game.dealerHand.push(game.deck.pop());
}

function hit(user) {
    console.log(user, 'hits!');
    for (let i=0; i<game.users.length; i++) {
        if (game.users[i].user == user) {
            game.users[i].hand.push(game.deck.pop());
        }
    }
}
function getHandValue(user) {
    for (let i=0; i<game.users.length; i++) {
        if (game.users[i].user == user) {
            const reducer = (acc, card) => {
                if (card.getNumberValue() == 11) {
                    if (acc + 11 > 21) {
                        return acc + 1;
                    } else {
                        return acc + 11;
                    }
                } else {
                    return acc + card.getNumberValue();
                }
            };
            return game.users[i].hand.reduce(reducer, 0);
        }
    }
}

function endRound() {

}
function printHand(username, hand, isDealer=false) {
    let msg = `@${username}: `;
    let handValue = 0;
    if (isDealer) {
        msg += hand[0].print();
        msg += '[??]';
    } else {
        for (let i=0; i<hand.length; i++) {
            msg += ` ${hand[i].print()} `;
            handValue += hand[i].getNumberValue;
        }
    }
    if (handValue == 21) {
        msg += ' PogChamp ';
    } else {
        msg += ' FBCatch ';
    }
    return msg;
}