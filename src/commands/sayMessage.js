const fs = require("fs")

// Accepts a JSON file (located in src/data) with a list of messages to choose from
// See src/data/message.example.json
module.exports = function sayMessage(filename, client, target) {
    let soFile = fs.readFileSync(`src/data/${filename}`)
    const messages = JSON.parse(soFile)
    let message = '/me ' + messages[Math.floor(Math.random() * messages.length)]
    client.say(target, message)
}
  