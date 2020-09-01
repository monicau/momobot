module.exports = () => {
    const bots = [ 'streamlabs', 'nightbot', 'm0m0_b0t']
    let isSpam = (msg, username) => {
        if (msg.startsWith('!')) {
            return true
        }
        return bots.includes(username)
    }
    return Object.freeze({
        bots,
        isSpam
    })
}