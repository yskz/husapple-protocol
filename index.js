const message = require('./src/message');
const gameInfo = require('./src/game_info');

module.exports = {
    ErrorId: message.ErrorId,
    playerNameMaxLength: message.playerNameMaxLength,
    Message: message,
    GameInfo: gameInfo,
};
