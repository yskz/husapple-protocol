const GameInfo = require('./game_info').GameInfo;

const messageType = {
    error: 'ErRoR',
    hello: 'HeLlO',
    requestSignIn: 'ReQsIgNiN',
    responseSignIn: 'ReSsIgNiN',
    matching: {
        requestJoin: 'MaTcH_ReQjOiN',
        responseJoin: 'MaTcH_ReSjOiN',
        updatePlayers: 'MaTcH_UpDaTePlaYeRs',
        requestReadyGame: 'MaTcH_ReQrEaDy',
        responseReadyGame: 'MaTcH_ReSrEaDy',
        gameStart: 'MaTcH_GaMeStArT',
    },
    game: {
        requestBid: 'GaMe_ReQbId',
        responseBid: 'GaMe_ReSbId',
        updatePlayerBidStatus: 'GaMe_UpDaTePlAyErBiD',
        finishTurn: 'GaMe_FiNiShTuRn',
        startTurn: 'GaMe_StArTtUrN',
        finishGame: 'GaMe_FiNiShGaMe',
    },
};

const playerNameMaxLength = 64;

class Unknown {
    constructor(type) {
        this._type = type;
    }

    get type() {
        return this._type;
    }
    sendProps(mergeProps = {}) {
        return Object.assign(mergeProps, { type: this._type });
    }
    toMessageString() {
        return JSON.stringify(this.sendProps());
    }

    static checkMessage(message, type = undefined) {
        return message && ('type' in message) && (typeof message.type === 'string') && (message.type === type);
    }
    static parseMessage(message, type = undefined) {
        if (!this.checkMessage(message)) return null;
        return new this(type);
    }
}

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
    serverBug: createErrorId(),
    invalidMessage: createErrorId(),
};
const errorIdSet = new Set(Object.keys(errorId).map(k => errorId[k]));

class Error extends Unknown {
    constructor(errorId) {
        super(messageType.error);
        this._errorId = errorId;
    }
    get errorId() {
        return this._errorId;
    }
    sendProps() {
        return super.sendProps({ errorId: this.errorId });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.hello) &&
            ('errorId' in message) && (typeof message.errorId === 'number') && errorIdSet.has(message.errorId);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.errorId);
    }
}

class Hello extends Unknown {
    static get identify() {
        return 'WeLcOmE NuMaUcTiOn SeRvEr';
    }

    constructor() {
        super(messageType.hello);
    }
    sendProps() {
        return super.sendProps({ identify: Hello.identify });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.hello) &&
            ('identify' in message) && (typeof message.identify === 'string') && (message.identify === Hello.identify);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this();
    }
}

class HaveRequestId extends Unknown {
    constructor(type, requestId) {
        super(type);
        this._reqId = requestId;
    }

    get requestId() {
        return this._reqId;
    }
    sendProps(mergeProps = {}) {
        return super.sendProps(Object.assign(mergeProps, { requestId: this.requestId }));
    }

    static checkMessage(message, type = undefined) {
        return super.checkMessage(message, type) && ('requestId' in message) && (typeof message.requestId === 'number');
    }
    static parseMessage(message, type = undefined) {
        if (!this.checkMessage(message)) return null;
        return new this(type, message.requestId);
    }
}

class RequestBase extends HaveRequestId {}
class ResponseBase extends HaveRequestId {}

class RequestSignIn extends RequestBase {
    constructor(requestId, playerName) {
        super(messageType.requestSignIn, requestId);
        this._playerName = playerName;
    }
    get playerName() {
        return this._playerName;
    }
    sendProps() {
        return super.sendProps({ playerName: this.playerName });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.requestSignIn) &&
            ('playerName' in message) && (typeof message.playerName === 'string') && (0 < message.playerName.length) && (message.playerName.length <= playerNameMaxLength);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.requestId, message.playerName);
    }
}

class ResponseSignIn extends ResponseBase {
    constructor(requestId) {
        super(messageType.responseSignIn, requestId);
    }
    sendProps() {
        return super.sendProps({});
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.responseSignIn);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.requestId);
    }
}

const Matching = {};

Matching.PlayerInfo = class {
    constructor(id, name, selfFlag) {
        this._id = id;
        this._name = name;
        this._self = selfFlag;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get isSelf() {
        return this._self;
    }

    getSendProps() {
        return { id: this.id, name: this.name, isSelf: this.isSelf };
    }
    static checkProps(obj) {
        return ('id' in obj) && ('name' in obj) && (typeof obj.name === 'string') && (obj.name.length > 0) && ('isSelf' in obj) && (typeof obj.isSelf === 'boolean');
    }
    static createFromObject(obj) {
        return new this(obj.id, obj.name, obj.isSelf);
    }
}

Matching.RequestJoin = class extends RequestBase {
    constructor(requestId) {
        super(messageType.matching.requestJoin, requestId);
    }
    sendProps() {
        return super.sendProps({});
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.matching.requestJoin);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.requestId);
    }
}

Matching.ResponseJoin = class extends ResponseBase {
    constructor(requestId, allow, playerInfos = []) {
        super(messageType.matching.responseJoin, requestId);
        this._allow = allow;
        this._playerInfos = playerInfos;
    }

    isAllow() {
        return this._allow;
    }
    setAllow(allow) {
        this._allow = allow;
    }
    getPlayerInfos() {
        return this._playerInfos;
    }
    setPlayerInfos(playerInfos = []) {
        this._playerInfos = playerInfos;
    }

    sendProps() {
        const allow = this.isAllow();
        const playerInfos = allow ? this.getPlayerInfos() : [];
        return super.sendProps({ allow: allow, players: playerInfos.map(info => info.getSendProps()) });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.matching.responseJoin) &&
            ('allow' in message) && (typeof message.allow === 'boolean') &&
            ('players' in message) && (Array.isArray(message.players)) &&
            (message.players.findIndex(v => !Matching.PlayerInfo.checkProps(v)) < 0);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.requestId, message.allow, message.players.map(v => Matching.PlayerInfo.createFromObject(v)));
    }
}

Matching.UpdatePlayers = class extends Unknown {
    constructor(playerInfos = []) {
        super(messageType.matching.updatePlayers);
        this._playerInfos = playerInfos;
    }

    getPlayerInfos() {
        return this._playerInfos;
    }
    setPlayerInfos(playerInfos = []) {
        this._playerInfos = playerInfos;
    }

    sendProps() {
        return super.sendProps({ players: this.getPlayerInfos().map(info => info.getSendProps()) });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.matching.updatePlayers) &&
            ('players' in message) && (Array.isArray(message.players)) &&
            (message.players.findIndex(v => !Matching.PlayerInfo.checkProps(v)) < 0);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.players.map(v => Matching.PlayerInfo.createFromObject(v)));
    }
}

Matching.RequestReadyGame = class extends RequestBase {
    constructor(requestId) {
        super(messageType.matching.requestReadyGame, requestId);
    }
    sendProps() {
        return super.sendProps({});
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.matching.requestReadyGame);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.requestId);
    }
}

Matching.ResponseReadyGame = class extends ResponseBase {
    constructor(requestId) {
        super(messageType.matching.responseReadyGame, requestId);
    }
    sendProps() {
        return super.sendProps({});
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.matching.responseReadyGame);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.requestId);
    }
}

Matching.GameStart = class extends Unknown {
    constructor(gameInfo) {
        super(messageType.matching.gameStart);
        this._gameInfo = gameInfo;
    }

    getGameInfo() {
        return this._gameInfo;
    }
    setGameInfo(gameInfo) {
        this._gameInfo = gameInfo;
    }

    sendProps() {
        return super.sendProps({ gameInfo: this.getGameInfo() });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.matching.gameStart) &&
            ('gameInfo' in message) && GameInfo.checkProps(message.gameInfo);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(GameInfo.createFromObject(message.gameInfo));
    }
}

const Game = {};

Game.RequestBid = class extends RequestBase {
    constructor(requestId, turnNum, bidCard) {
        super(messageType.game.requestBid, requestId);
        this._turnNum = turnNum;
        this._bidCard = bidCard;
    }
    sendProps() {
        return super.sendProps({ turnNum: this.getTurnNum(), bidCard: this.getBidCard() });
    }

    getTurnNum() {
        return this._turnNum;
    }
    setTurnNum(num) {
        this._turnNum = num;
    }
    getBidCard() {
        return this._bidCard;
    }
    setBidCard(bidCard) {
        this._bidCard = bidCard;
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.game.requestBid) &&
            ('turnNum' in message) && (typeof message.turnNum === 'number') &&
            ('bidCard' in message) && (typeof message.bidCard === 'number');
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.requestId, message.turnNum, message.bidCard);
    }
}

Game.ResponseBid = class extends ResponseBase {
    constructor(requestId, resultCode) {
        super(messageType.game.responseBid, requestId);
        this._resultCode = resultCode;
    }
    sendProps() {
        return super.sendProps({ resultCode: this.getResultCode() });
    }

    getResultCode() {
        return this._resultCode;
    }
    setResultCode(resultCode) {
        this._resultCode = resultCode;
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.game.responseBid) &&
            ('resultCode' in message) && (typeof message.resultCode === 'number');
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.requestId, message.resultCode);
    }
}

Game.ResponseBid.ResultCode = {
    success: 0,
    alreadyBid: -1,
};

Game.UpdatePlayerBidStatus = class extends Unknown {
    constructor(turnNum, playerId) {
        super(messageType.game.updatePlayerBidStatus);
        this._turnNum = turnNum;
        this._playerId = playerId;
    }

    getTurnNum() {
        return this._turnNum;
    }
    setTurnNum(num) {
        this._turnNum = num;
    }
    getPlayerId() {
        return this._playerId;
    }
    setPlayerId(id) {
        this._playerId = id;
    }

    sendProps() {
        return super.sendProps({ turnNum: this.getTurnNum(), playerId: this.getPlayerId() });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.game.updatePlayerBidStatus) &&
            ('turnNum' in message) && (typeof message.turnNum === 'number') &&
            ('playerId' in message) && (message.playerId !== null);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.turnNum, message.playerId);
    }
}

Game.FinishTurn = class extends Unknown {
    constructor(gameInfo) {
        super(messageType.game.finishTurn);
        this._gameInfo = gameInfo;
    }

    getGameInfo() {
        return this._gameInfo;
    }
    setGameInfo(gameInfo) {
        this._gameInfo = gameInfo;
    }

    sendProps() {
        return super.sendProps({ gameInfo: this.getGameInfo().getSendProps() });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.game.finishTurn) &&
            ('gameInfo' in message) && GameInfo.checkProps(message.gameInfo);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(GameInfo.createFromObject(message.gameInfo));
    }
}

Game.StartTurn = class extends Unknown {
    constructor(gameInfo) {
        super(messageType.game.startTurn);
        this._gameInfo = gameInfo;
    }

    getGameInfo() {
        return this._gameInfo;
    }
    setGameInfo(gameInfo) {
        this._gameInfo = gameInfo;
    }

    sendProps() {
        return super.sendProps({ gameInfo: this.getGameInfo().getSendProps() });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.game.startTurn) &&
            ('gameInfo' in message) && GameInfo.checkProps(message.gameInfo);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(GameInfo.createFromObject(message.gameInfo));
    }
}

Game.FinishGame = class extends Unknown {
    constructor(gameInfo) {
        super(messageType.game.finishGame);
        this._gameInfo = gameInfo;
    }

    getGameInfo() {
        return this._gameInfo;
    }
    setGameInfo(gameInfo) {
        this._gameInfo = gameInfo;
    }

    sendProps() {
        return super.sendProps({ gameInfo: this.getGameInfo().getSendProps() });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.game.finishGame) &&
            ('gameInfo' in message) && GameInfo.checkProps(message.gameInfo);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(GameInfo.createFromObject(message.gameInfo));
    }
}


const typeMessageMap = new Map([
    [messageType.hello, Hello],
    [messageType.requestSignIn, RequestSignIn],
    [messageType.responseSignIn, ResponseSignIn],
    [messageType.matching.requestJoin, Matching.RequestJoin],
    [messageType.matching.responseJoin, Matching.ResponseJoin],
    [messageType.matching.updatePlayers, Matching.UpdatePlayers],
    [messageType.matching.requestReadyGame, Matching.RequestReadyGame],
    [messageType.matching.responseReadyGame, Matching.ResponseReadyGame],
    [messageType.matching.gameStart, Matching.GameStart],
    [messageType.game.requestBid, Game.RequestBid],
    [messageType.game.responseBid, Game.ResponseBid],
    [messageType.game.updatePlayerBidStatus, Game.UpdatePlayerBidStatus],
    [messageType.game.finishTurn, Game.FinishTurn],
    [messageType.game.startTurn, Game.StartTurn],
    [messageType.game.finishGame, Game.FinishGame],
]);

function parseMessage(message) {
    function getData(message) {
        let data;
        try {
            if (!("data" in message) || (typeof message.data !== 'string')) return null; // メッセージにオブジェクト以外が渡された時を考えてtry内に入れます
            data = JSON.parse(message.data);
        } catch (e) {
            data = null;
        }
        return data;
    }
    const msg = getData(message);
    if (!msg || !('type' in msg) || !(typeof msg.type === 'string') || (msg.type.length <= 0)) return null;
    const msgClass = typeMessageMap.get(msg.type)
    return msgClass ? msgClass.parseMessage(msg) : null;
}


module.exports = {
    Type: messageType,
    playerNameMaxLength: playerNameMaxLength,
    ErrorId: errorId,
    parseMessage: parseMessage,
    Unknown: Unknown,
    Error: Error,
    Hello: Hello,
    RequestSignIn: RequestSignIn,
    ResponseSignIn: ResponseSignIn,
    Matching: Matching,
    Game: Game,
};
