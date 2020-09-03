const createErrorId = (function () {
    let index = -1;
    return () => {
        const id = index;
        index -= 1;
        return id;
    };
})();

const errorId = {
    unknown: createErrorId(),
};

const message = require('./src/message');


module.exports = {
    ErrorId: errorId,
    playerNameMaxLength: message.playerNameMaxLength,
    Message: message,
};
