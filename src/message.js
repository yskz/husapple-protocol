const messageType = {
    hello: 'HeLlO',
    requestSignIn: 'ReQsIgNiN',
    signIn: 'SiGnIn',
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
        return ('type' in message) && (typeof message.type === 'string') && (message.type === type);
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

const typeMessageMap = new Map([
    [messageType.hello, Hello],
    [messageType.requestSignIn, RequestSignIn],
    [messageType.signIn, SignIn],
]);

function parseMessage(message) {
    if (!('type' in message) || !(typeof message.type === 'string') || (message.type.length <= 0)) return null;
    const msgClass = typeMessageMap.get(message.type)
    return msgClass ? msgClass.parseMessage(message) : null;
}


module.exports = {
    Type: messageType,
    playerNameMaxLength: playerNameMaxLength,
    parseMessage: parseMessage,
    Unknown: Unknown,
    Hello: Hello,
    RequestSignIn: RequestSignIn,
    SignIn: SignIn,
};
