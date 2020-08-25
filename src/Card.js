module.exports = class Card {
    constructor(value, suit) {
        this.value = value;
        this.suit = suit;
    }

    getNumberValue() {
        if (this.value == 'J' || this.value == 'Q' || this.value == 'K') {
            return 10;
        } else if (this.value == 'A') {
            return 1;
        } else {
            return this.value;
        }
    }

    print() {
        return `[${this.value} ${this.suit}]`;
    }
};