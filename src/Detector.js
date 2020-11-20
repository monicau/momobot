const fs = require("fs")
let soFile = fs.readFileSync('src/shoutouts.json');

module.exports = () => {

    const shoutouts = JSON.parse(soFile)

    let getMsg = (username) => {
        username = username.toLowerCase()
        const now = Date.now() / 1000
        if (username in shoutouts && (shoutouts[username]['timestamp'] == null || (now - shoutouts[username]['timestamp']) > 28800)) {
            shoutouts[username]['timestamp'] = Date.now()/1000
            let so = '/me ' + shoutouts[username]['messages'][Math.floor(Math.random() * shoutouts[username]['messages'].length)]
            if (shoutouts[username]['link'] == true) {
                so += " Check them out at https://twitch.tv/" + username + " !"
            }
            return so
        } else {
            return null
        }
    }

    return Object.freeze({
        getMsg
    })
}