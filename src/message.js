const messageType = {
    error: 'ErRoR',
    hello: 'HeLlO',
    requestSignIn: 'ReQsIgNiN',
    signIn: 'SiGnIn',
    matching: {
        requestJoin: 'MaTcH_ReQjOiN',
        allowJoin: 'MaTcH_AlLoWjOiN',
        denyJoin: 'MaTcH_DeNyJoIn',
        updatePlayers: 'MaTcH_UpDaTePlaYeRs',
        requestReadyGame: 'MaTcH_ReQrEaDy',
        responseReadyGame: 'MaTcH_ReSrEaDy',
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
        return new this(message.playerName);
    }
}

class SignIn extends Unknown {
    constructor() {
        super(messageType.signIn);
    }
    sendProps() {
        return super.sendProps({});
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.signIn);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this();
    }
}

const Matching = {};

Matching.PlayerInfo = class {
    constructor(id, name) {
        this._id = id;
        this._name = name;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
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
        return new this();
    }
}

Matching.AllowJoin = class extends Unknown {
    constructor(playerInfos = []) {
        super(messageType.matching.allowJoin);
        this._playerInfos = playerInfos;
    }

    getPlayerInfos() {
        return this._playerInfos;
    }
    setPlayerInfos(playerInfos = []) {
        this._playerInfos = playerInfos;
    }

    sendProps() {
        return super.sendProps({ players: this.getPlayerInfos().map(info => { return { id: info.id, name: info.name }; }) });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.matching.allowJoin) &&
            ('players' in message) && (Array.isArray(message.players)) &&
            (message.players.findIndex(v => {
                return !('id' in v) || !('name' in v) || (typeof v.name !== 'string') || (v.name.length <= 0);
            }) < 0);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.players.map(v => new Matching.PlayerInfo(v.id, v.name)));
    }
}

Matching.DenyJoin = class extends Unknown {
    constructor() {
        super(messageType.matching.denyJoin);
    }
    sendProps() {
        return super.sendProps({});
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.matching.denyJoin);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this();
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
        return super.sendProps({ players: this.getPlayerInfos().map(info => { return { id: info.id, name: info.name }; }) });
    }

    static checkMessage(message) {
        return super.checkMessage(message, messageType.matching.updatePlayers) &&
            ('players' in message) && (Array.isArray(message.players)) &&
            (message.players.findIndex(v => {
                return !('id' in v) || !('name' in v) || (typeof v.name !== 'string') || (v.name.length <= 0);
            }) < 0);
    }
    static parseMessage(message) {
        if (!this.checkMessage(message)) return null;
        return new this(message.players.map(v => new Matching.PlayerInfo(v.id, v.name)));
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
        return new this();
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


const typeMessageMap = new Map([
    [messageType.hello, Hello],
    [messageType.requestSignIn, RequestSignIn],
    [messageType.signIn, SignIn],
    [messageType.matching.requestJoin, Matching.RequestJoin],
    [messageType.matching.allowJoin, Matching.AllowJoin],
    [messageType.matching.denyJoin, Matching.DenyJoin],
    [messageType.matching.updatePlayers, Matching.UpdatePlayers],
    [messageType.matching.requestReadyGame, Matching.RequestReadyGame],
    [messageType.matching.responseReadyGame, Matching.ResponseReadyGame],
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
    SignIn: SignIn,
    Matching: Matching,
};
