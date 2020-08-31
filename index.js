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

const playerNameMaxLength = 64;


module.exports = {
    ErrorId: errorId,
    PlayerNameMaxLength: playerNameMaxLength,
};
