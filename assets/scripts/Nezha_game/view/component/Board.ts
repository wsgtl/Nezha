import { Prefab } from 'cc';
import { SpriteFrame } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { Card } from './Card';
import { CardType, GameUtil, LineData, LineOneData, RewardType } from '../../GameUtil_Nezha';
import { instantiate } from 'cc';
import { MathUtil } from '../../../Nezha_common/utils/MathUtil';
import { v2 } from 'cc';
import { tween } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
import { Vec2 } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
import { MoneyAni } from './MoneyAni';
import { LineAni } from './LineAni';
import { Button } from 'cc';
import { ButtonLock } from '../../../Nezha_common/Decorator';
import { GameStorage } from '../../GameStorage_Nezha';
const { ccclass, property } = _decorator;

@ccclass('Board')
export class Board extends Component {
    @property(Prefab)
    cardPrefab: Prefab = null;
    @property([Node])
    ls: Node[] = [];
    @property(MoneyAni)
    moneyAni: MoneyAni = null;
    @property(LineAni)
    lineAni: LineAni = null;


    private cards: Card[] = [];
    private init() {
        for (let x = 0; x < GameUtil.AllCol; x++) {
            for (let y = 0; y < GameUtil.CreateRow; y++) {
                const c = instantiate(this.cardPrefab);
                this.ls[x].addChild(c);
                const card = c.getComponent(Card);
                this.cards[GameUtil.AllCol * y + x] = card;
                card.init(MathUtil.random(1, 14));
                c.y = this.getY(y);
            }
        }
    }
    protected onLoad(): void {
        this.init();
    }
    private getY(i: number) {
        return -(i - 1) * GameUtil.CardH;
    }
    /**转一列 */
    private spinOne(index: number, types: CardType[], times: number, wait: number, isLineAni: boolean = false) {
        return new Promise<void>(async res => {
            if (wait > 0)
                await delay(wait);
            const list = this.ls[index];
            const h = GameUtil.CardH;
            const row = GameUtil.CreateRow;
            const by = this.getY(row - 1);
            const ty = this.getY(-1);
            const duration = 0.07;
            times--;
            const isLast = times == 0;
            // if (isLineAni && times > 1) this.playLineAniEffect();
            for (let i = 0; i < row; i++) {
                const c = list.children[i];
                const pre = row - i - 1;
                const last = row - pre;
                const toY = this.getY(i);
                tween(c)
                    .to(pre * duration, { y: by })
                    .call(() => {
                        if (isLast) {
                            if (i < GameUtil.AllRow)
                                c.getComponent(Card).setType(types[i]);
                        }
                        else {
                            c.getComponent(Card).setType(GameUtil.getRandomCard());
                        }
                        c.y = ty;
                    })
                    .to(last * duration, { y: toY })

                    .call(async () => {
                        if (i == 0) {
                            if (times > 0)
                                await this.spinOne(index, types, times, 0, isLineAni);
                            res();
                        }
                        if (times == 0) {//回弹动效
                            tween(c)
                                .to(.1, { y: toY - 40 })
                                .to(.1, { y: toY })
                                .start();
                        }
                    })
                    .start();
            }

        })

    }

    spin() {
        return new Promise<void>(res => {
            AudioManager.vibrate(1, 155);
            AudioManager.playEffect("toubi");
            const board = GameManger.instance.getNewBoard();
            let q = 0;
            // const lineAniIndex = Math.random() < 0.4 ? MathUtil.random(2, 5) : 0;
            const lineAniIndex = GameManger.instance.findFreeGameStart();
            for (let i = 0; i < GameUtil.AllCol; i++) {
                const lineAniAdd = (lineAniIndex > 0 && lineAniIndex <= GameUtil.AllCol && i >= lineAniIndex - 1) ? 2 : 0;
                q += (i == 0) ? MathUtil.random(3, 5) : MathUtil.random(1, 2);
                q += lineAniAdd;
                const wait = 0.1 * i;

                this.spinOne(i, [board[0][i], board[1][i], board[2][i]], q, wait, lineAniIndex > 0)
                    .then(() => {
                        if(lineAniIndex-2==i){//开始咪牌
                            this.lineAni.node.x = this.ls[lineAniIndex - 1].x;
                            this.lineAni.show(true);
                        }
                        if (lineAniAdd) {
                            if (i == 4)
                                this.lineAni.show(false);
                            else
                                this.lineAni.node.x = this.ls[i + 1].x;
                        }
                        if (i == GameUtil.AllCol - 1) {
                            res();
                        }
                        AudioManager.playEffect("stop");
                    })
            }

            this.showMoneyAni();
        })

    }
    private isSpin: boolean = false;
    /**显示可连线的几个方块 */
    async showLineLight(data: LineData) {
        this.isSpin = false;
        const l = data.lines;
        for (let i = 0; i < l.length; i++) {
            if (this.isSpin) return;
            const line = l[i];
            this.showLine(line.line);
            await delay(1);
        }
        if (this.isSpin) return;
        this.showLineLight(data);
    }
    private showLine(line: number[]) {
        this.ls.forEach((list, x) => {
            const y = line[x];
            list.children.forEach((card, i) => {
                card.getComponent(Card).showBorder(i == y);
            })
        })
    }

    /**对应卡片发射粒子，其他卡片变暗 */
    public async cardsShot(pos: Vec2[], toNode: Node, type: RewardType, double: boolean = false) {
        this.setAllCardDark(true);
        const duration: number = 0.7;
        pos.forEach(v => {
            const card = this.ls[v.x].children[v.y];
            card.getComponent(Card).shotAni();
            ViewManager.showRewardParticle(type, card, toNode, () => { }, duration, double);
        })
        await delay(duration);
        this.setAllCardDark(false);
    }
    /**单纯展示卡片 */
    public async showCards(pos: Vec2[]) {
        this.setAllCardDark(true);
        const duration: number = 0.7;
        pos.forEach(v => {
            const card = this.ls[v.x].children[v.y];
            card.getComponent(Card).shotAni();
            // card.getComponent(Card).setColor(false);
        })
        await delay(duration);
        this.setAllCardDark(false);
    }
    private setAllCardDark(v: boolean) {
        this.ls.forEach((list, x) => {
            list.children.forEach((card, i) => {
                card.getComponent(Card).setColor(v);
            })
        })
    }

    /**转动后方块成普通形态 */
    public setSpinNormal() {
        this.isSpin = true;
        this.showLine([]);
    }
    /**钱动画 */
    private showMoneyAni() {
        const moneyCards = GameManger.instance.findCards(CardType.money);
        if (moneyCards.length >= 3) {
            this.moneyAni.ani();
        }
    }

    // @ButtonLock(0.15)
    // private playLineAniEffect() {
    //     AudioManager.playEffect("nenliang");
    // }
}


