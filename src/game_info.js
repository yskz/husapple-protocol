class Player {
    constructor(id, name, scoreCards = [], usedCards = [], bidCard = null) {
        this.id = id;
        this.name = name;
        this.scoreCards = scoreCards;
        this.usedCards = usedCards;
        this.bidCard = bidCard;
    }

    getSendProps() {
        return { id: this.id, name: this.name, scoreCards: this.scoreCards, usedCards: this.usedCards, bidCard: this.bidCard };
    }
    static checkNumberArray(a) {
        function checkNotNum(v) {
            return typeof v !== 'number';
        }
        return Array.isArray(a) && (a.findIndex(checkNotNum) < 0);
    }
    static checkProps(obj) {
        return (('id' in obj) &&
                ('name' in obj) && (typeof obj.name === 'string') && (obj.name.length > 0) &&
                ('scoreCards' in obj) && this.checkNumberArray(obj.scoreCards) &&
                ('usedCards' in obj) && this.checkNumberArray(obj.usedCards) &&
                ('bidCard' in obj) && ((obj.bidCard === null) || (typeof obj.bidCard === 'number')));
    }
    static createFromObject(obj) {
        return new this(obj.name, obj.scoreCards, obj.usedCards, obj.bidCard);
    }
}

class MyPlayer extends Player {
    constructor(id, name, myCards = [], scoreCards = [], usedCards = [], bidCard = null) {
        super(id, name, scoreCards, usedCards, bidCard);
        this.myCards = myCards;
    }

    getSendProps() {
        return Object.assign(super.getSendProps(), { myCards: this.myCards });
    }
    static checkProps(obj) {
        return super.checkProps(obj) && ('myCards' in obj) && (super.checkNumberArray(obj.myCards));
    }
    static createFromObject(obj) {
        return new this(obj.name, obj.myCards, obj.scoreCards, obj.usedCards, obj.bidCard);
    }
}

class WinnerCurrentTurn {
    constructor(drawFlag, playerName = '') {
        this._draw = drawFlag;
        this.playerName = playerName;
    }

    isDraw() {
        return this._draw;
    }
    setDraw(drawFlag) {
        this._draw = drawFlag;
    }

    getSendProps() {
        return { isDraw: this.isDraw(), playerName: this.playerName };
    }
    static checkProps(obj) {
        return ('isDraw' in obj) && (typeof obj.isDraw === 'boolean') && ('playerName' in obj) && (typeof obj.playerName === 'string');
    }
    static createFromObject(obj) {
        return new this(obj.isDraw, obj.playerName);
    }
}

class GameInfo {
    constructor(myPlayer, players = [], turnNum = 1, isBidCardOpen = false, winnerCurrentTurn = null) {
        this.turnNum = turnNum;
        this.myPlayer = myPlayer;
        this.players = players;
        this.isBidCardOpen = isBidCardOpen;
        this.winnerCurrentTurn = winnerCurrentTurn;
    }

    getSendProps() {
        return {
            turnNum: this.turnNum,
            myPlayer: this.myPlayer.getSendProps(),
            players: this.players.map(v => v.getSendProps()),
            isBidCardOpen: this.isBidCardOpen,
            winnerCurrentTurn: this.winnerCurrentTurn ? this.winnerCurrentTurn.getSendProps() : null,
        };
    }
    static checkProps(obj) {
        return (('turnNum' in obj) && (typeof obj.turnNum === 'number') &&
                ('myPlayer' in obj) && MyPlayer.checkProps(obj.myPlayer) &&
                ('players' in obj) && Array.isArray(obj.players) && (obj.players.findIndex(v => !Player.checkProps(v)) < 0) &&
                ('isBidCardOpen' in obj) && (typeof obj.isBidCardOpen === 'boolean') &&
                ('winnerCurrentTurn' in obj) && ((obj.winnerCurrentTurn === null) || WinnerCurrentTurn.checkProps(obj.winnerCurrentTurn)));
    }
    static createFromObject(obj) {
        const srcMyPlayer = obj.myPlayer;
        const myPlayer = new MyPlayer(srcMyPlayer.id, srcMyPlayer.name, srcMyPlayer.myCards, srcMyPlayer.scoreCards, srcMyPlayer.usedCards, srcMyPlayer.bidCard);
        const players = obj.players.map(v => new Player(v.id, v.name, v.scoreCards, v.usedCards, v.bidCard));
        const winnerCurrentTurn = obj.winnerCurrentTurn ? new WinnerCurrentTurn(obj.isDraw, obj.playerName) : null;
        return new this(myPlayer, players, obj.turnNum, obj.isBidCardOpen, winnerCurrentTurn);
    }
}

module.exports = {
    Player: Player,
    MyPlayer: MyPlayer,
    WinnerCurrentTurn: WinnerCurrentTurn,
    GameInfo: GameInfo,
}
