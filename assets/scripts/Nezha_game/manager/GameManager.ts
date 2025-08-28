import { Vec2 } from "cc";
import Debugger from "../../Nezha_common/Debugger";
import { MathUtil } from "../../Nezha_common/utils/MathUtil";
import { v2 } from "cc";
import { GameStorage } from "../GameStorage_Nezha";
import { GameView } from "../view/view/GameView";
import { CardType, GameUtil, LineData, LineOneData, WinType } from "../GameUtil_Nezha";
import { GuideManger } from "./GuideManager";

const debug = Debugger("GameManger");
export class GameManger {
    public static _instance: GameManger = null;
    public static get instance(): GameManger {
        if (!this._instance) {
            this._instance = new GameManger();
        }
        return this._instance;
    }
    public static clearInstance() {
        this._instance = null;
    }
    private gv: GameView;
    public init(gv: GameView) {
        this.gv = gv;
        this.curLevel = GameStorage.getCurLevel();
        this.lastLevel = GameStorage.getLastLevel();
        GameStorage.setLastLevel(this.curLevel);
        console.log(`第${this.curLevel}关,上一关是:${this.lastLevel}`);

    }


    private curLevel: number = 1;
    private lastLevel: number = 1;
    private board: CardType[][] = [];


    isAni: boolean = false;
    /**必出连线次数 */
    mustLineNum: number = 1;
    /**金莲卡片必出两次 */
    mustLotus: number = 0;
    /**钱卡片必出两次 */
    mustMoney: number = 0;
    /**免费游戏次数 */
    freegam: number = 0;
    /**免费游戏盖在上面的卡片 */
    private freeGameBoard: CardType[][] = [];

    public getNewBoard() {
        // this.borad = [
        //     [1, 2, 3, 4, 11,],
        //     [3, 2, 12, 1, 5,],
        //     [11, 4, 1, 5, 7,],
        // ]
        // return this.borad;
        if (GuideManger.isGuide()) {
            this.board = [
                [1, 8, 11, 6, 1,],
                [9, 1, 12, 1, 1,],
                [4, 9, 1, 9, 7,],
            ]
            return this.board;
        }

        this.board = [];
        return this.boardControl();
        // if (this.mustLineNum > 0) {
        //     return this.mustLineBoard();

        // }
        // return this.normalBoard();
    }
    /**普通随机机台 */
    private normalBoard() {
        for (let i = 0; i < GameUtil.AllRow; i++) {
            this.board.push([]);
            for (let j = 0; j < GameUtil.AllCol; j++) {
                this.board[i][j] = GameUtil.getRandomCard();
            }
        }
        return this.board;
    }
    /**必出连线机台 */
    private mustLineBoard() {
        this.mustLineNum--;
        const list = GameUtil.lines.getRandomItem();
        this.normalBoard();
        // const lineNum = MathUtil.random(3, 5);//随机连线个数
        const lineNum = Math.random() < 0.1 ? 5 : MathUtil.random(3, 4);//随机连线个数,出5个概率较低
        const type = MathUtil.random(1, 10);//随机类型
        for (let i = 0; i < lineNum; i++) {
            this.board[list[i]][i] = type;
        }
        return this.board;
    }

    /**机台卡片控制 */
    private boardControl() {
        for (let i = 0; i < GameUtil.AllRow; i++) {//先清空卡片数据
            this.board.push([]);
            for (let j = 0; j < GameUtil.AllCol; j++) {
                this.board[i][j] = CardType.none;
            }
        }


        //连线控制
        if (this.mustLineNum > 0) {
            this.mustLineNum--;
            const list = GameUtil.lines.getRandomItem();
            // const lineNum = MathUtil.random(3, 5);//随机连线个数
            const lineNum = Math.random() < 0.1 ? 5 : MathUtil.random(3, 4);//随机连线个数,出5个概率较低
            const type = MathUtil.random(1, 9);//随机类型
            for (let i = 0; i < lineNum; i++) {
                this.board[list[i]][i] = type;
            }

        }
        const type = MathUtil.random(0, 3);
        //金莲控制
        if (type == 1 || this.mustLotus > 0) {
            let num1 = MathUtil.random(1, 2);
            if (this.mustLotus > 0) {
                this.mustLotus--;
                num1 = MathUtil.random(2, 4);
            }
            this.insertCard(CardType.lotus, num1);
        }
        //钱卡片控制
        if (type == 2 || this.mustMoney > 0) {
            let num2 = MathUtil.random(1, 4);
            if (this.mustMoney > 0) {
                this.mustMoney--;
                num2 = MathUtil.random(2, 4);
            }
            this.insertCard(CardType.money, num2);
        }
        //免费转控制
        if (type == 3) {
            let num3 = MathUtil.random(3, 5);
            this.insertCard(CardType.freeGame, num3);
        }

        //随机插入普通卡片
        for (let i = 0; i < GameUtil.AllRow; i++) {
            for (let j = 0; j < GameUtil.AllCol; j++) {
                if (this.board[i][j] == CardType.none) {
                    this.board[i][j] = GameUtil.getRandomNormalCard();//插入普通卡片
                }
            }
        }

        return this.board;
    }
    private insertCard(type: CardType, num: number) {
        const list: Vec2[] = [];
        for (let i = 0; i < GameUtil.AllRow; i++) {
            for (let j = 0; j < GameUtil.AllCol; j++) {
                if (this.board[i][j] == CardType.none) {
                    list.push(v2(j, i));//找到空位置
                }
            }
        }
        list.shuffle();//打乱
        for (let i = 0; i < num; i++) {
            const p = list[i];
            if (p)
                this.board[p.y][p.x] = type;//插入
            else
                break;
        }
    }
    private bet: number = GameUtil.BaseBet;
    // public setBet(b: number) {
    //     this.bet = b;
    // }
    /**获取连线数据 */
    public getLinesData(): LineData {
        const list = GameUtil.lines;
        const lines: LineOneData[] = [];
        list.forEach(v => {
            let type: CardType = 0;
            const arr: number[] = [];
            for (let x = 0; x < GameUtil.AllCol; x++) {
                const y = v[x];
                const t = this.board[y][x];

                if (x == 0) {
                    if (t >= CardType.wild) break;//限定可连线类型
                    type = t;
                    arr.push(y);
                } else {
                    if (type == t || t == CardType.wild) {//wild
                        arr.push(y);
                    }
                    if ((type != t && t != CardType.wild) || x == GameUtil.AllCol - 1) {
                        if (arr.length >= 3) {
                            lines.push({ type, line: arr })
                        }
                        break;
                    }
                }
            }
        })
        let coinnum = 0;
        const lineCoin = GameUtil.lineCoin;
        lines.forEach(v => {
            const n = lineCoin[v.type][v.line.length - 3];
            coinnum += n;
        });
        // if (lines.length) {
        //     // let bl = 0.5;
        //     // if (this.bet > 1500) bl = 1;
        //     // coinnum = Math.ceil(coinnum + this.bet * bl);
        //     let bl = this.bet / GameUtil.BaseBet;
        //     coinnum = Math.ceil(coinnum * bl);//修改金额为直接乘倍率
        // }
        let winType: WinType = 0;
        if (coinnum >= this.bet * 15) {
            winType = WinType.mega;//狂赢
        } else if (coinnum >= this.bet * 6) {
            winType = WinType.big;//大赢
        }
        return { lines: lines, winType, coin: coinnum };
    }
    /**找该类型的卡 */
    public findCards(type: CardType): Vec2[] {
        const cardPos: Vec2[] = [];
        this.board.forEach((b, y) => {
            b.forEach((c, x) => {
                if (c == type) {
                    cardPos.push(v2(x, y));
                }
            })
        })
        return cardPos;
    }
    /**找猴子卡 */
    public findMonkeyCards(): Vec2[] {
        const cardPos: Vec2[] = [];
        this.board.forEach((b, y) => {
            b.forEach((c, x) => {
                if (c >= CardType.c6 && c <= CardType.c9) {
                    cardPos.push(v2(x, y));
                }
            })
        })
        return cardPos;
    }
    public setFreeSpin() {
        this.gv.setFreeSpin();
        this.gv.onSpin();
    }
    public cashX2() {
        this.gv.cashX2(true);
    }
    public cash2() {
        this.mustMoney = 5;
    }
    public lotus2() {
        this.mustLotus = 2;
    }
    /**找到咪牌起始位置 */
    public findFreeGameStart() {
        let num = 0;
        for (let x = 0; x < GameUtil.AllCol; x++) {
            for (let y = 0; y < GameUtil.AllRow; y++) {
                if (this.board[y][x] == CardType.freeGame) {
                    num++;
                    if (num >= 2) {
                        return x + 2;
                    }
                }
            }
        }
        return 10;
    }
    public autoNext() {
        this.gv.autoNext();
    }
    /**计算有几个freegame标，是否开启免费游戏 */
    public calFreeGame() {
        const cards = this.findCards(CardType.freeGame);
        if (cards.length >= 3) {
            this.freegam = GameUtil.FreeGameTimes[Math.min(2, cards.length - 3)];
            return true;
        }
        return false;
    }
    /**是否在免费游戏期间 */
    public get isFreeGame() {
        return this.freegam > 0;
    }
}
