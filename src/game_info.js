class Player {
    constructor(id, name, pointCards = [], usedCards = [], bidCard = null) {
        this.id = id;
        this.name = name;
        this.pointCards = pointCards;
        this.usedCards = usedCards;
        this.bidCard = bidCard;
    }

    clone() {
        return new Player(this.id, this.name, [...this.pointCards], [...this.usedCards], this.bidCard);
    }

    getSendProps() {
        return { id: this.id, name: this.name, pointCards: this.pointCards, usedCards: this.usedCards, bidCard: this.bidCard };
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
                ('pointCards' in obj) && this.checkNumberArray(obj.pointCards) &&
                ('usedCards' in obj) && this.checkNumberArray(obj.usedCards) &&
                ('bidCard' in obj) && ((obj.bidCard === null) || (typeof obj.bidCard === 'number')));
    }
    static createFromObject(obj) {
        return new this(obj.name, obj.pointCards, obj.usedCards, obj.bidCard);
    }
}

class MyPlayer extends Player {
    constructor(id, name, myCards = [], pointCards = [], usedCards = [], bidCard = null) {
        super(id, name, pointCards, usedCards, bidCard);
        this.myCards = myCards;
    }

    clone() {
        return new MyPlayer(this.id, this.name, [...this.myCards], [...this.pointCards], [...this.usedCards], this.bidCard);
    }

    getSendProps() {
        return Object.assign(super.getSendProps(), { myCards: this.myCards });
    }
    static checkProps(obj) {
        return super.checkProps(obj) && ('myCards' in obj) && (super.checkNumberArray(obj.myCards));
    }
    static createFromObject(obj) {
        return new this(obj.name, obj.myCards, obj.pointCards, obj.usedCards, obj.bidCard);
    }
}

class WinnerCurrentTurn {
    constructor(drawFlag, playerName = '') {
        this._draw = drawFlag;
        this.playerName = playerName;
    }

    clone() {
        return new WinnerCurrentTurn(this.isDraw(), this.playerName);
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

    clone() {
        return new GameInfo(this.myPlayer.clone(), this.players.map(v => v.clone()), this.turnNum, this.isBidCardOpen, this.winnerCurrentTurn ? this.winnerCurrentTurn.clone() : null);
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
        const myPlayer = new MyPlayer(srcMyPlayer.id, srcMyPlayer.name, srcMyPlayer.myCards, srcMyPlayer.pointCards, srcMyPlayer.usedCards, srcMyPlayer.bidCard);
        const players = obj.players.map(v => new Player(v.id, v.name, v.pointCards, v.usedCards, v.bidCard));
        const winnerCurrentTurn = obj.winnerCurrentTurn ? new WinnerCurrentTurn(obj.winnerCurrentTurn.isDraw, obj.winnerCurrentTurn.playerName) : null;
        return new this(myPlayer, players, obj.turnNum, obj.isBidCardOpen, winnerCurrentTurn);
    }
}

module.exports = {
    Player: Player,
    MyPlayer: MyPlayer,
    WinnerCurrentTurn: WinnerCurrentTurn,
    GameInfo: GameInfo,
}
