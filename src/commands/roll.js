
/*
Parameters:
 sides:   how many sides in a die
 message: chatbot's message output. use {OUTPUT} as placeholder of the roll value
          eg: "You rolled a {OUTCOME}!"
*/
module.exports = function roll(sides, message, client, target) {
    const num = Math.floor(Math.random() * sides) + 1
    message = message.replace("{OUTCOME}", num)
    client.say(target, `${message}`)
}
