const messageType = {
    hello: 'HeLlO',
    requestSignIn: 'ReQsIgNiN',
};

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
}


module.exports = {
    Type: messageType,
    Unknown: Unknown,
    Hello: Hello,
    RequestSignIn: RequestSignIn,
};
