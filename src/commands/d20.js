module.exports = function d20(client, target) {
  const sides = 20
  const num = Math.floor(Math.random() * sides) + 1
  client.say(target, `You rolled a ${num}!`)
}
