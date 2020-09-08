const tmi = require('tmi.js');

// Define configuration options
const opts = {
  identity: {
    username: process.env.REACT_APP_BOT_USERNAME,
    password: process.env.REACT_APP_OAUTH_TOKEN
  },
  channels: [
    process.env.REACT_APP_CHANNEL_NAME
  ]
};
// Create a client with our options
module.exports = new tmi.client(opts);