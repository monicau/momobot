# Momobot

This is Monica's chatbot for Twitch. What does it do?

- Blackjack dealer
- Auto-shoutouts 
- Prints unique chatters
- Custom randomized messages

## Set up

- Install NodeJS: https://nodejs.org/en/download/
- Rename `.env.example` to `.env.example` and fill in the values
  - Generate your OAuth token with https://twitchapps.com/tmi/
- Rename `src/shoutouts.example.json` to `src/shoutouts.json`
- Rename `src/messages.example.json` to `src/ruined.json` (see the `sayMessage` example in `src/index.js`)
- Install dependencies `yarn install` in the main project directory
- Start the bot with `yarn run`
- After the stream, stop the bot with CTRL+C

## Play blackjack

- `!blackjack` to start or join a game
- `!hit` to hit
- `!hold` to hold
