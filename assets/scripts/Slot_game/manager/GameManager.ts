import { Vec2 } from "cc";
import Debugger from "../../Slot_common/Debugger";
import { MathUtil } from "../../Slot_common/utils/MathUtil";
import { v2 } from "cc";
import { GameStorage } from "../GameStorage_Slot";
import { GameView } from "../view/view/GameView";
import { CardType, GameUtil, LineData, LineOneData, WinType } from "../GameUtil_Slot";
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
    private borad: CardType[][] = [];


    isAni: boolean = false;
    /**必出连线次数 */
    mustLineNum: number = 1;

    public getNewBoard() {
        // this.borad = [
        //     [1, 2, 3, 4, 11,],
        //     [3, 2, 12, 1, 5,],
        //     [11, 4, 1, 5, 7,],
        // ]
        // return this.borad;
        if (GuideManger.isGuide()) {
            this.borad = [
                [1, 8, 14, 6, 1,],
                [10, 1, 12, 1, 14,],
                [10, 9, 1, 9, 7,],
            ]
            return this.borad;
        }

        this.borad = [];
        if (this.mustLineNum > 0) {
            return this.mustLineBoard();

        }
        return this.normalBoard();
    }
    /**普通随机机台 */
    private normalBoard() {
        for (let i = 0; i < GameUtil.AllRow; i++) {
            this.borad.push([]);
            for (let j = 0; j < GameUtil.AllCol; j++) {
                this.borad[i][j] = GameUtil.getRandomCard();
            }
        }
        return this.borad;
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
            this.borad[list[i]][i] = type;
        }
        return this.borad;
    }
    private bet: number = GameUtil.BaseBet;
    public setBet(b: number) {
        this.bet = b;
    }
    /**获取连线数据 */
    public getLinesData(): LineData {
        const list = GameUtil.lines;
        const lines: LineOneData[] = [];
        list.forEach(v => {
            let type: CardType = 0;
            const arr: number[] = [];
            for (let x = 0; x < GameUtil.AllCol; x++) {
                const y = v[x];
                const t = this.borad[y][x];

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
        if (lines.length) {
            // let bl = 0.5;
            // if (this.bet > 1500) bl = 1;
            // coinnum = Math.ceil(coinnum + this.bet * bl);
            let bl = this.bet / GameUtil.BaseBet;
            coinnum = Math.ceil(coinnum * bl);//修改金额为直接乘倍率
        }
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
        this.borad.forEach((b, y) => {
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
        this.borad.forEach((b, y) => {
            b.forEach((c, x) => {
                if (c >= CardType.c6 && c <= CardType.c10) {
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
}
