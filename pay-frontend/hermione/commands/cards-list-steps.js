const list = require('../page-objects/cards-list');

async function yaClickOnBack() {
    await this.yaClick(list.card_list.back());
}

async function yaClickOnSelectedCard() {
    await this.yaClick(list.selected_card_number());
}

module.exports = {
    yaClickOnBack,
    yaClickOnSelectedCard,
};
