const Card = require('./Card.js')
const tmi = require('tmi.js');
require('dotenv').config();

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

const enumValue = (name) => Object.freeze({ toString: () => name });

// Define game states
const STATE = Object.freeze({
  STARTED: enumValue("STATE.STARTED"),
  PLAYERSTURN: enumValue("STATE.PLAYERSTURN"),
  DEALERSTURN: enumValue("STATE.DEALERSTURN"),
  ENDED: enumValue("STATE.ENDED")
});

// Define user states
const USERSTATE = Object.freeze({
  STARTED: enumValue("USERSTATE.STARTED"),
  ACTIVE: enumValue("USERSTATE.ACTIVE"),
  BUSTED: enumValue("USERSTATE.BUSTED"),
  HOLD: enumValue("USERSTATE.HOLD"),
});

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  if (self) {
    console.log('COMING FROM BOT')
    return;
  } // Ignore messages from the bot

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

  } else if (commandName.startsWith('!blackjack')) {
    // Start of black jack
    const currentTime = Date.now() / 1000;
    if (game.start_time == null) {
      client.say(target, `Welcome to Momo Casino! ${context.username} started a blackjack game! Join the table with: !blackjack <amount>`);
      game.start_time = currentTime;
      game.state = STATE.STARTED;
      game.users.push({ user: context.username, bet: userParam, hand: [], state: USERSTATE.STARTED });
      setTimeout(startGame.bind(null, target), 20000);
    } else if (game.start_time != null && game.state == STATE.STARTED) {
      if (game.users.find(x => x.user == context.username) == undefined) {
        client.say(target, `Hello ${context.username}! You've joined the table.`);
        game.users.push({ user: context.username, bet: userParam, hand: [], state: USERSTATE.STARTED });
      }
    } else if (game.state == STATE.PLAYERSTURN && (userParam == 'hit')) {
      const user = game.users.find(x => x.user == context.username);
      if (user != undefined) {
        if (user.state == USERSTATE.ACTIVE) {
          hit(context.username);
          client.say(target, printHand(context.username, user.hand));
          const handValue = getHandValue(context.username);

          if (handValue > 21) {
            user.state = USERSTATE.BUSTED;
          }
        }
      }
    } else if (game.state == STATE.PLAYERSTURN && userParam == 'hold') {
      const user = game.users.find(x => x.user == context.username);
      if (user != undefined && user.state == USERSTATE.ACTIVE) {
        user.state = USERSTATE.HOLD;
        client.say(target, `${context.username} holds.`);
      }
    }
  } else if (commandName.startsWith('!hit') && game.state == STATE.PLAYERSTURN) {
    const user = game.users.find(x => x.user == context.username);
    if (user != undefined) {
      if (user.state == USERSTATE.ACTIVE) {
        hit(context.username);
        client.say(target, printHand(context.username, user.hand));
        const handValue = getHandValue(context.username);

        if (handValue > 21) {
          user.state = USERSTATE.BUSTED;
        }
      }
    }
  } else if (commandName.startsWith('!hold') && game.state == STATE.PLAYERSTURN) {
    const user = game.users.find(x => x.user == context.username);
    if (user != undefined && user.state == USERSTATE.ACTIVE) {
      user.state = USERSTATE.HOLD;
      client.say(target, `${context.username} holds.`);
    }
  } else if (commandName === '!beg') {
    client.say(target, `!addpoints ${context.username} 1`);
    client.say(target, `You sad sad thing.`);
  }
}

// Function called when the "dice" command is issued
function rollDice() {
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
  for (let i = 0; i < 4; i++) {
    for (let j = 1; j <= 13; j++) {
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
  state: STATE.ENDED,
  dealerHand: [],
  deck: [],
};
function startGame(target) {
  game.deck = resetDeck();
  game.dealerHand = [];
  game.state = STATE.PLAYERSTURN;
  // Shuffle deck!
  shuffle();
  // Deal initial hand
  deal();
  // Print everyone's hand
  let handMessage = `${printHand('Dealer', game.dealerHand, true)} \n`;
  for (let i = 0; i < game.users.length; i++) {
    handMessage += ` ${printHand(game.users[i].user, game.users[i].hand)} `
  }
  client.say(target, handMessage);
  // Set timeout for user actions
  setTimeout(dealerPlays.bind(null, target), 30000);
}
function shuffle() {
  for (let i = game.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i);
    const temp = game.deck[i];
    game.deck[i] = game.deck[j];
    game.deck[j] = temp;
  }
}
function deal() {
  // Deal for users
  for (let i = 0; i < game.users.length; i++) {
    game.users[i].hand.push(game.deck.pop());
    game.users[i].hand.push(game.deck.pop());
    game.users[i].state = USERSTATE.ACTIVE;
  }
  // Deal for dealer
  game.dealerHand.push(game.deck.pop());
  game.dealerHand.push(game.deck.pop());
}

function hit(username, dealer = false) {
  if (dealer) {
    game.dealerHand.push(game.deck.pop());


  } else {
    const user = game.users.find(x => x.user == username);
    user.hand.push(game.deck.pop());


  }
}
function getHandValue(username, dealer = false) {
  // console.log('getting hand value of', username);
  let hand = [];
  if (dealer) {
    hand = game.dealerHand;
  } else {
    const user = game.users.find(x => x.user == username);
    hand = user.hand;
  }
  // console.log(hand);
  const reducer = (acc, card) => acc + card.getNumberValue();
  //THIS IS AWESOME. - DDT 2020-08-03 21.30 (ish)
  let minValue = hand.reduce(reducer, 0);
  if (minValue >= 21) {
    return minValue;
  } else {
    // Count the number of aces
    const aceCounter = (acc, card) => {
      if (card.getNumberValue() == 1) {
        return acc + 1;
      } else {
        return acc + 0;
      }
    }
    let aceCount = hand.reduce(aceCounter, 0);
    //IDK how to code this part in JS:
    return Math.min(aceCount, Math.floor((21 - minValue) / 10)) * 10 + minValue;
  }
}

function dealerPlays(target) {
  //Display the dealer's hand before hitting
  game.state = STATE.DEALERSTURN;
  client.say(target, "Round ends for players! Dealer is now playing. Dealer's current hand:");
  client.say(target, printHand('Dealer', game.dealerHand, true));
  // Make all users hold
  for (let i = 0; i < game.users.length; i++) {
    //If busted, don't change the state
    if (game.users[i].state != USERSTATE.BUSTED) {
      game.users[i].state = USERSTATE.HOLD;
    }
  }
  // Deal for dealer
  while (getHandValue('Dealer', true) < 17) {
    hit('dealer', true);
    client.say(target, printHand('Dealer', game.dealerHand, true));
  }
  client.say(target, 'Dealer ends with:' + printHand('Dealer', game.dealerHand, true));


  endRound(target);
}

function endRound(target) {
  game.state = STATE.ENDED;

  const USEROUTCOME = Object.freeze({
    WIN: enumValue("STATE.WIN"),
    LOSE: enumValue("STATE.LOSE"),
    TIE: enumValue("STATE.TIE"),
  });
  for (let i = 0; i < game.users.length; i++) {
    let outcome = USEROUTCOME.TIE; //Tie for default

    //Check if user's hand is greater than dealer's
    if (getHandValue("Dealer", true) <= 21) {
      // Dealer didn't bust, compare user's hand to dealer's

      if (game.users[i].state == USERSTATE.BUSTED || getHandValue(game.users[i].user) < getHandValue("Dealer", true)) {
        outcome = USEROUTCOME.LOSE;
      } else if (getHandValue(game.users[i].user) > getHandValue("Dealer", true)) {
        outcome = USEROUTCOME.WIN;
      }
    } else if (game.users[i].state == USERSTATE.BUSTED) {
      //If dealer's busted but user is also busted
      outcome = USEROUTCOME.LOSE;
    } else {
      // Dealer is busted
      outcome = USEROUTCOME.WIN;
    }

    // Payout
    if (outcome == USEROUTCOME.WIN) {
      client.say(target, "!addpoints " + game.users[i].user + " 1");
    } else if (outcome == USEROUTCOME.LOSE) {
      client.say(target, "!removepoints " + game.users[i].user + " 1");
    }
  }
  game.state = STATE.ENDED;
  game.start_time = null;
  game.users = [];
}

function printHand(username, hand, isDealer = false) {
  let msg = '@' + username + ': ';
  let handValue = 0;
  if (isDealer) {
    if (game.state == STATE.DEALERSTURN) {
      for (let i = 0; i < hand.length; i++) {
        msg += ' ' + hand[i].print() + ' ';
      }
    } else {
      msg += hand[0].print();
      msg += '[??]';
    }
    handValue = getHandValue('Dealer', true);
  } else {
    for (let i = 0; i < hand.length; i++) {
      msg += ' ' + hand[i].print() + ' ';
    }
    handValue = getHandValue(username);
  }
  if (handValue == 21) {
    msg += ' PogChamp 21!!!!!';
  } else if (handValue > 21) {
    msg += ' BibleThump BUSTED!';
  } else {
    msg += ' FBCatch ';
  }
  return msg;
}