const messageType = {
    hello: 'HeLlO',
    requestSignIn: 'ReQsIgNiN',
    signIn: 'SiGnIn',
    matching: {
        requestJoin: 'MaTcH_ReQjOiN',
        allowJoin: 'MaTcH_AlLoWjOiN',
        denyJoin: 'MaTcH_DeNyJoIn',
        updatePlayers: 'MaTcH_UpDaTePlaYeRs',
        readyGame: 'MaTcH_ReAdY',
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
        if (!Unknown.checkMessage(message)) return null;
        return new Unknown(type);
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
        return Unknown.checkMessage(message, messageType.hello) &&
            ('identify' in message) && (typeof message.identify === 'string') && (message.identify === Hello.identify);
    }
    static parseMessage(message) {
        if (!Hello.checkMessage(message)) return null;
        return new Hello();
    }
}

class RequestSignIn extends Unknown {
    constructor(playerName) {
        super(messageType.requestSignIn);
        this._playerName = playerName;
    }
    get playerName() {
        return this._playerName;
    }
    sendProps() {
        return super.sendProps({ playerName: this.playerName });
    }

    static checkMessage(message) {
        return Unknown.checkMessage(message, messageType.requestSignIn) &&
            ('playerName' in message) && (typeof message.playerName === 'string') && (0 < message.playerName.length) && (message.playerName.length <= playerNameMaxLength);
    }
    static parseMessage(message) {
        if (!RequestSignIn.checkMessage(message)) return null;
        return new RequestSignIn(message.playerName);
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
        return Unknown.checkMessage(message, messageType.signIn);
    }
    static parseMessage(message) {
        if (!SignIn.checkMessage(message)) return null;
        return new SignIn();
    }
}

const Matching = {};

Matching.RequestJoin = class extends Unknown {
    constructor() {
        super(messageType.matching.requestJoin);
    }
    sendProps() {
        return super.sendProps({});
    }

    static checkMessage(message) {
        return Unknown.checkMessage(message, messageType.matching.requestJoin);
    }
    static parseMessage(message) {
        if (!Matching.RequestJoin.checkMessage(message)) return null;
        return new Matching.RequestJoin();
    }
}

Matching.AllowJoin = class extends Unknown {
    constructor(players = []) {
        super(messageType.matching.allowJoin);
        this._players = players;
    }

    getPlayers() {
        return this._players;
    }
    setPlayers(players = []) {
        this._players = players;
    }

    sendProps() {
        return super.sendProps({ players: this.getPlayers() });
    }

    static checkMessage(message) {
        return Unknown.checkMessage(message, messageType.matching.allowJoin) &&
            ('players' in message) && (Array.isArray(message.players));
    }
    static parseMessage(message) {
        if (!Matching.AllowJoin.checkMessage(message)) return null;
        return new Matching.AllowJoin(message.players);
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
        return Unknown.checkMessage(message, messageType.matching.denyJoin);
    }
    static parseMessage(message) {
        if (!Matching.DenyJoin.checkMessage(message)) return null;
        return new Matching.DenyJoin();
    }
}

Matching.UpdatePlayers = class extends Unknown {
    constructor(players = []) {
        super(messageType.matching.updatePlayers);
        this._players = players;
    }

    getPlayers() {
        return this._players;
    }
    setPlayers(players = []) {
        this._players = players;
    }

    sendProps() {
        return super.sendProps({ players: this.getPlayers() });
    }

    static checkMessage(message) {
        return Unknown.checkMessage(message, messageType.matching.updatePlayers) &&
            ('players' in message) && (Array.isArray(message.players));
    }
    static parseMessage(message) {
        if (!Matching.UpdatePlayers.checkMessage(message)) return null;
        return new Matching.UpdatePlayers(message.players);
    }
}

Matching.ReadyGame = class extends Unknown {
    constructor() {
        super(messageType.matching.readyGame);
    }
    sendProps() {
        return super.sendProps({});
    }

    static checkMessage(message) {
        return Unknown.checkMessage(message, messageType.matching.readyGame);
    }
    static parseMessage(message) {
        if (!Matching.ReadyGame.checkMessage(message)) return null;
        return new Matching.ReadyGame();
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
    [messageType.matching.readyGame, Matching.ReadyGame],
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
    parseMessage: parseMessage,
    Unknown: Unknown,
    Hello: Hello,
    RequestSignIn: RequestSignIn,
    SignIn: SignIn,
    Matching: Matching,
};
