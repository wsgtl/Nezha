import { _decorator, Node, SpriteFrame, Sprite } from 'cc';
import ViewComponent from '../../../Nezha_common/ui/ViewComponent';

import { adHelper } from '../../../Nezha_common/native/AdHelper';
import Debugger from '../../../Nezha_common/Debugger';
import { GameStorage } from '../../GameStorage_Nezha';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
import { tween } from 'cc';
import { Tween } from 'cc';
import { view } from 'cc';
import { UIUtils } from '../../../Nezha_common/utils/UIUtils';
import { CardType, GameUtil, RewardType } from '../../GameUtil_Nezha';
import { nextFrame } from '../../../Nezha_common/utils/TimeUtil';
import { GameManger } from '../../manager/GameManager';
import { GuideManger } from '../../manager/GuideManager';
import { GuideMask } from '../guide/GuideMask';
import { Treasure } from '../component/Treasure';
import { Bet } from '../component/Bet';
import { Button } from 'cc';
import { MathUtil } from '../../../Nezha_common/utils/MathUtil';
import { Top } from '../component/Top';
import { ButtonLock } from '../../../Nezha_common/Decorator';
import { Board } from '../component/Board';
import { CoinManger } from '../../manager/CoinManger';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { MoneyManger } from '../../manager/MoneyManger';
import { Hulu } from '../component/Hulu';
import { FreeAndCash } from '../component/FreeAndCash';
import { FormatUtil } from '../../../Nezha_common/utils/FormatUtil';
import { MoneyAni } from '../component/MoneyAni';
import { v3 } from 'cc';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { i18n } from '../../../Nezha_common/i18n/I18nManager';
import { NativeFun } from '../../../Nezha_common/native/NativeFun';
const { ccclass, property } = _decorator;

const debug = Debugger("GameView")
@ccclass('GameView')
export class GameView extends ViewComponent {
    @property(Node)
    content: Node = null;
    @property(Top)
    top: Top = null;
    @property(Node)
    jackpot: Node = null;
    @property(Node)
    dialogNode: Node = null;
    @property(Treasure)
    treasure: Treasure = null;
    @property(FreeAndCash)
    limit: FreeAndCash = null;
    @property(Bet)
    bet: Bet = null;
    @property(Node)
    btnSpin: Node = null;
    @property([SpriteFrame])
    btnSpinNum: SpriteFrame[] = [];
    @property(Board)
    board: Board = null;
    @property(Hulu)
    hulu: Hulu = null;
    @property(NumFont)
    winCoin: NumFont = null;
    @property(NumFont)
    winMoney: NumFont = null;
    @property(Node)
    x2: Node = null;
    @property(Node)
    btnMore: Node = null;


    onLoad() {

        adHelper.showBanner();

        /**调试模式 */
        // PhysicsSystem2D.instance.debugDrawFlags = 1;

        this.fit();

        ViewManager.setUpDialogNode(this.dialogNode);

        this.delay(3).then(() => {
            // ViewManager.showWinDialog(MathUtil.random(1,2),MathUtil.random(100,1000))
            // ViewManager.showJackpotDialog(MathUtil.random(1,3),33.903);
        })
        this.btnSpin.on(Button.EventType.CLICK, this.onSpin, this);
        this.btnMore.on(Button.EventType.CLICK, this.onMore, this);
        // this.btnCash.on(Button.EventType.CLICK, this.onCash, this);
        this.initGuide();
    }

    fit() {
        const h = view.getVisibleSize().y;
        const cha = h - 1920;
        const ch = cha / 2;
        const cy = (ch < 130 ? ch : ch - 130)
        this.top.node.y = 960 + cy;
        this.jackpot.y = 690 + cy * 0.8;
        const kbn = this.content.getChildByName("kbn");
        kbn.y = 370 + ch * 0.55;
        if (ch > 200) {
            const sc = Math.min(1.2, 1 + ch / 1200);
            kbn.scale = v3(sc, sc);
        }
        this.treasure.node.y = 720 + ch * 1;
        this.limit.node.y = 720 + ch * 1;
        this.btnMore.y = 490 + ch * 0.9;
        console.log("h", h);

        nextFrame().then(() => {
            const p = UIUtils.transformOtherNodePos2localNode(this.node, this.dialogNode);
            this.dialogNode.position = p;
        })
    }

    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        this.init(args.isShowWin);

    }


    async init(isShowWin: boolean) {
        this.playBgm();
        GameManger.clearInstance();
        GameManger.instance.init(this);
        if (!GuideManger.isGuide()) {

        }
        this.bet.init(GameStorage.getCurLevel());
        // this.showWinCoin(false);
        this.showWinNormal();
        this.setFreeSpin();
        this.cashX2();
    }
    private set isAni(v: boolean) {
        GameManger.instance.isAni = v;
        // UIUtils.setBtnGray(this.btnSpin, v, !v);
        this.btnSpin.getChildByName("gray").active = v;
        this.btnSpin.getComponent(Button).interactable = !v;
    }
    private get isAni() {
        return GameManger.instance.isAni;
    }
    @ButtonLock(0.3)
    async onSpin() {
        if (this.isAni) return;
        const bet = this.bet.curBet;
        const freeNum = GameStorage.getLimit().free;

        if (freeNum > 0) {//免费转
            GameStorage.setLimitFree(freeNum - 1);
            this.setFreeSpin();
            AudioManager.playEffect("gufen");
        } else {
            const coin = GameStorage.getCoin();
            if (coin < bet) {
                // ViewManager.showTips("Not enough coins");
                ViewManager.showTips(i18n.string("str_nec"));
                ViewManager.showCoinDialog(() => { GameManger.instance.mustLineNum = 1 });
                return;
            }
            CoinManger.instance.addCoin(-bet);
        }

        if (Math.random() < 0.3) {
            GameManger.instance.mustLineNum += 1;//随机给个必连线
        }
        this.isAni = true;
        this.board.setSpinNormal();

        GameManger.instance.setBet(bet);
        // this.showWinCoin(false);
        this.showWinNormal();
        this.top.addTimes(() => { this.bet.showAddAndSub() });
        await this.board.spin();
        await this.spinNext();
    }
    /**免费spin按钮 */
    public setFreeSpin() {
        const num = GameStorage.getLimit().free;
        const v = num > 0;
        this.bet.setFree(v);
        const n = this.btnSpin.getChildByName("num");
        const str = this.btnSpin.getChildByName("str");
        const spin = this.btnSpin.getChildByName("spin");
        n.active = v;
        spin.active = v;
        str.active = !v;

        n.getComponent(Sprite).spriteFrame = this.btnSpinNum[num];
    }
    private isFreeSpin() {
        const num = GameStorage.getLimit().free;
        return num > 0;
    }
    /**钱x2显示 */
    public async cashX2(isAni: boolean = false) {
        const cashNum = GameStorage.getLimit().cash;
        const show = cashNum > 0;
        if (isAni && show) {
            ViewManager.showRewardParticle(RewardType.money, this.node, this.x2, () => {
                this.x2.active = show;
                ActionEffect.scaleBigToSmall(this.x2, 1.3, 1, 0.3);
                AudioManager.playEffect("light");
            })
        } else {
            this.x2.active = show;
        }

    }
    private spinCashX2() {

        const cashNum = GameStorage.getLimit().cash;
        if (cashNum > 0)
            GameStorage.setLimitCash(cashNum - 1);
        this.cashX2();
    }
    /**转轮结束后流程  1钱广告弹窗  2自动弹钱  3宝箱  4猴子葫芦  5连线判定 */
    private async spinNext() {
        //钱广告弹窗
        let moneyNum = 0;
        const moneyDialogCards = GameManger.instance.findCards(CardType.c13);
        if (moneyDialogCards.length > 0) {
            const num = await this.moneyDialog();
            const last = moneyNum;
            moneyNum += num;
            // this.winMoney.num = "+" + FormatUtil.toXXDXXxsd(moneyNum);
            ActionEffect.numAddAni(last,moneyNum,(n:number)=>{this.showWinMoney(n)});
        }
        //自动弹钱
        const moneyCards = GameManger.instance.findCards(CardType.c12);
        if (moneyCards.length > 0) {
            const cashNum = GameStorage.getLimit().cash;
            let bl = cashNum > 0 ? 2 : 1;
            await this.board.cardsShot(moneyCards, MoneyManger.instance.getMoneyNode().moneyNode, RewardType.money, cashNum > 0);
            const num = MoneyManger.instance.getReward(bl);
            MoneyManger.instance.addMoney(num,false);
            // this.winMoney.num = "+" + FormatUtil.toXXDXXxsd(num);
            const last = moneyNum;
            moneyNum += num;
            ActionEffect.numAddAni(last,moneyNum,(n:number)=>{this.showWinMoney(n)});
            // this.winMoney.num = "+" + FormatUtil.toXXDXXxsd(moneyNum);
        }

        //宝箱
        const treasureCards = GameManger.instance.findCards(CardType.c14);
        if (treasureCards.length > 0) {
            await this.board.cardsShot(treasureCards, this.treasure.node, RewardType.none);
            await this.treasure.addProgress(treasureCards.length);
        }

        //猴子葫芦
        const monkeyCards = GameManger.instance.findMonkeyCards();
        if (monkeyCards.length > 0) {
            await this.board.cardsShot(monkeyCards, this.hulu.icon, RewardType.none);
            await this.hulu.addProgress(monkeyCards.length);
        }
        const isFreeSpin = this.isFreeSpin();
        //连线判定
        const linedata = GameManger.instance.getLinesData();
        if (linedata.coin > 0) {
            CoinManger.instance.addCoin(linedata.coin,false);
            ActionEffect.numAddAni(0,linedata.coin,(n:number)=>{this.showWinCoin(n)},true);
            this.board.showLineLight(linedata);
            if (linedata.winType > 0 && !isFreeSpin) {
                ViewManager.showWinDialog(linedata.winType, linedata.coin);
            }
        }
        this.guidStpe2();
        this.isAni = false;
        if (isFreeSpin) {
            this.onSpin();
        }
        this.spinCashX2();
    }
    private moneyDialog() {
        return new Promise<number>(res => {
            ViewManager.showReward((n) => {
                res(n);
            })
        })
    }
    private showWinCoin( num: number = 0) {
        // this.winCoin.node.parent.active = v;
        this.winCoin.num = num;
    }
    private showWinMoney(moneyNum:number){
        this.winMoney.num = "+" + FormatUtil.toXXDXXxsd(moneyNum);
    }
    private showWinNormal() {
        this.winCoin.num = 0;
        this.winMoney.num = 0;
    }

    private delay(time: number, node?: Node) {
        return new Promise<void>(resolve => {
            const n = node ? node : this.node;
            tween(n)
                .delay(time)
                .call(() => {
                    resolve();
                })
                .start();
        });
    }
    onCash() {
        if (this.isAni) return;
        ViewManager.showWithdrawDialog();
    }

    onMore() {
        NativeFun.showH5Game();
    }
    onDestroy() {
        // Tween.stopAllByTarget(this.node);
        Tween.stopAllByTarget(this.node);
        this.unscheduleAllCallbacks();
        AudioManager.stopBgm();
    }


    playBgm() {
        AudioManager.playBgm("bgm", 0.4);
    }


    private gm: GuideMask;
    /**新手引导 */
    private initGuide() {
        if (!GuideManger.isGuide()) return;
        ViewManager.showGuideMask(async (n: Node) => {
            this.gm = n.getComponent(GuideMask);
            this.gm.showMask();
            this.gm.showTips(1);
            await this.delay(3);
            this.gm.hideDb();
            this.guidStpe1();
        })
    }
    private guidStpe1() {
        this.gm.showSpin(this.btnSpin);
    }


    private async guidStpe2() {
        if (!this.gm || !GuideManger.isGuide()) return;
        this.gm.node.active = true;
        this.gm.showMask();
        this.gm.showTips(2);
        await this.delay(3);
        this.gm.hideDb();
        this.gm.node.active = true;
        this.gm.showMoneyNode(MoneyManger.instance.getMoneyNode().node);
    }







    private onForeground() {
        console.log('应用回到前台');
        // 恢复游戏逻辑
    }
}


