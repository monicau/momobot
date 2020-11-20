// import { Game } from './Game';
const Game = require('./Game.js')
const client = require('./client')
const Filter = require('./Filter.js')
const UserDetector = require('./Detector.js')

const game = Game();
const filter = Filter();
const detector = UserDetector();

// command handlers
const d20 = require('./commands/d20')

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  let sendToChat = (message) => {
    client.say(target, message)
  }
  if (self) {
    return;
  } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim(); // !blackjack 10 / hit / stay
  const commandParams = commandName.split(' ');
  let userParam = 0;
  if (commandParams.length > 1) {
    userParam = commandParams[1];
  }

  const shoutout = detector.getMsg(context.username);
  if (shoutout != null) {
    client.say(target, shoutout);
  }

  // If the command is known, let's execute it
  if (commandName === '!d20') {
    d20(client, target)
  } else if (commandName.startsWith('!blackjack')) {
    // Start of black jack
    game.main(userParam, context, sendToChat)
  } else if (commandName.startsWith('!hit')) {
    game.main('hit', context, sendToChat)
  } else if (commandName.startsWith('!hold')) {
    game.main('hold', context, sendToChat)
  } else if (commandName === '!beg') {
    client.say(target, `!addpoints ${context.username} 1`);
    client.say(target, `You sad sad thing.`);
  }
}