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
import { CardType, GameUtil, RewardType, WinType } from '../../GameUtil_Nezha';
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
import { FormatUtil } from '../../../Nezha_common/utils/FormatUtil';
import { MoneyAni } from '../component/MoneyAni';
import { v3 } from 'cc';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { i18n } from '../../../Nezha_common/i18n/I18nManager';
import { NativeFun } from '../../../Nezha_common/native/NativeFun';
import { EnergyManger } from '../../manager/EnergyManager';
import { Lotus } from '../component/Lotus';
import { Limit } from '../component/Limit';
import { BtnSpin } from '../component/BtnSpin';
import { Layout } from 'cc';
import { Vec2 } from 'cc';
import { WinNum } from '../component/WinNum';
const { ccclass, property } = _decorator;

const debug = Debugger("GameView")
@ccclass('GameView')
export class GameView extends ViewComponent {
    @property(Node)
    content: Node = null;
    @property(Node)
    boardContent: Node = null;
    @property(Node)
    bg1: Node = null;
    @property(Node)
    bg2: Node = null;
    @property(Top)
    top: Top = null;
    @property(Node)
    jackpot: Node = null;
    @property(Node)
    dialogNode: Node = null;
    @property(Treasure)
    treasure: Treasure = null;
    @property(Limit)
    limit: Limit = null;
    @property(BtnSpin)
    btnSpin: BtnSpin = null;
    @property([SpriteFrame])
    btnSpinNum: SpriteFrame[] = [];
    @property(Board)
    board: Board = null;
    @property(Lotus)
    lotus: Lotus = null;
    // @property(NumFont)
    // winCoin: NumFont = null;
    // @property(NumFont)
    // winMoney: NumFont = null;
    @property(WinNum)
    winNode: WinNum = null;
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
        this.btnSpin.init(() => { this.onSpin() });
        // this.btnSpin.on(Button.EventType.CLICK, this.onSpin, this);
        this.btnMore.on(Button.EventType.CLICK, this.onMore, this);
        // this.btnCash.on(Button.EventType.CLICK, this.onCash, this);
        this.initGuide();
    }

    fit() {
        const h = view.getVisibleSize().y;

        const cha = h - 1920;
        const ch = cha / 2;
        const cy = (ch < 60 ? ch : ch - 60);
        this.top.node.y = 960 + cy;
        this.jackpot.y = 650 + cy * 0.6;

        const kbn = this.content.getChildByName("kbn");
        kbn.y = 520 + ch * 0.55;
        this.jackpot.getComponent(Layout).spacingY = 20 + Math.floor(ch / 8);
        if (ch > 200) {
            const sc = Math.min(1.2, 1 + ch / 1400);
            kbn.scale = v3(sc, sc);
            // this.boardContent.y=0+30;

        }
        // this.treasure.node.y = 720 + ch * 1;
        this.limit.node.y = 540 + ch * 0.5;
        this.btnMore.y = 540 + ch * 0.5;
        console.log("h", h);

        const bgSc = Math.max(1, 1 + cha / 1200);
        this.bg1.scale = v3(1, bgSc);

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

        // this.showWinCoin(false);
        this.winNode.showWinNormal();
        this.setFreeSpin();
    }
    private set isAni(v: boolean) {
        GameManger.instance.isAni = v;
        this.btnSpin.setIsAni(v);
        // UIUtils.setBtnGray(this.btnSpin, v, !v);
        // this.btnSpin.getChildByName("gray").active = v;
        // this.btnSpin.getComponent(Button).interactable = !v;
    }
    private get isAni() {
        return GameManger.instance.isAni;
    }
    @ButtonLock(0.3)
    async onSpin() {
        if (this.isAni) return;
        // const freeNum = GameStorage.getLimit().lotus;

        // if (freeNum > 0) {//免费转
        //     GameStorage.setLimitLotus(freeNum - 1);
        //     this.setFreeSpin();
        //     AudioManager.playEffect("gufen");
        // } else {
        if (!EnergyManger.subEnergy()) {
            ViewManager.showEnergyDialog();//没体力显示体力界面
            return;
        }
        // }

        this.treasure.addProgress(1);
        if (Math.random() < 0.3) {
            GameManger.instance.mustLineNum += 1;//随机给个必连线
        }
        this.isAni = true;
        this.board.setSpinNormal();

        // this.showWinCoin(false);
        this.winNode.showWinNormal();
        this.top.addTimes(() => { });
        await this.board.spin();
        await this.spinNext();
    }
    /**免费游戏转轮 */
    async freeGameSpin() {
        this.isAni = true;
        this.board.setSpinNormal();
        await this.board.spin();
        const wilds = GameManger.instance.upWild();
        this.board.createUpWild(wilds);
        await this.spinNext(true);
        GameManger.instance.freegame--;
        if (GameManger.instance.isFreeGame) {
            this.freeGameSpin();
        } else {
            this.endFreeGame();
        }
    }
    /**开始免费游戏 */
    async startFreeGame() {
        GameManger.instance.initFreeGame();
        //免费游戏开始弹窗

        //免费游戏过场动画

        this.winNode.showWinNormal();
        //开车免费游戏转轮
        this.freeGameSpin();
    }
    /**结束免费游戏 */
    async endFreeGame() {
        this.isAni = false;
        this.board.clearUpWild();
    }
    
    /**免费spin按钮 */
    public setFreeSpin() {
        // const num = GameStorage.getLimit().lotus;
        // const v = num > 0;
        // const n = this.btnSpin.getChildByName("num");
        // const str = this.btnSpin.getChildByName("str");
        // const spin = this.btnSpin.getChildByName("spin");
        // n.active = v;
        // spin.active = v;
        // str.active = !v;

        // n.getComponent(Sprite).spriteFrame = this.btnSpinNum[num];
    }



    /**转轮结束后流程  1钱广告弹窗  2自动弹钱  3宝箱  4猴子葫芦  5连线判定 */
    private async spinNext(isFreeGame: boolean = false) {
        //钱广告弹窗
        let moneyNum = 0;
        const moneyDialogCards = GameManger.instance.findCards(CardType.money);
        if (moneyDialogCards.length >= 3) {
            await this.board.showCards(moneyDialogCards);
            const num = await this.moneyDialog();
            // const last = moneyNum;
            // moneyNum += num;

            // this.winMoney.num = "+" + FormatUtil.toXXDXXxsd(moneyNum);
            this.winNode.addWinMoney(num);
            // ActionEffect.numAddAni(last, moneyNum, (n: number) => { this.winNode.addWinMoney(n) });
        }
        //自动弹钱
        // const moneyCards = GameManger.instance.findCards(CardType.c12);
        // if (moneyCards.length > 0) {
        //     const cashNum = GameStorage.getLimit().cash;
        //     let bl = cashNum > 0 ? 2 : 1;
        //     await this.board.cardsShot(moneyCards, MoneyManger.instance.getMoneyNode().moneyNode, RewardType.money, cashNum > 0);
        //     const num = MoneyManger.instance.getReward(bl);
        //     MoneyManger.instance.addMoney(num,false);
        //     // this.winMoney.num = "+" + FormatUtil.toXXDXXxsd(num);
        //     const last = moneyNum;
        //     moneyNum += num;
        //     ActionEffect.numAddAni(last,moneyNum,(n:number)=>{this.showWinMoney(n)});
        //     // this.winMoney.num = "+" + FormatUtil.toXXDXXxsd(moneyNum);
        // }

        //宝箱
        // const treasureCards = GameManger.instance.findCards(CardType.c14);
        // if (treasureCards.length > 0) {
        //     await this.board.cardsShot(treasureCards, this.treasure.node, RewardType.none);
        //     await this.treasure.addProgress(treasureCards.length);
        // }
        await this.treasure.showTreasureDialog();

        //金莲
        const lotusCards = GameManger.instance.findCards(CardType.lotus);
        if (lotusCards.length > 0) {
            await this.board.cardsShot(lotusCards, this.lotus.icon, RewardType.none);
            await this.lotus.addProgress(lotusCards.length);
        }

        //连线判定
        const linedata = GameManger.instance.getLinesData();
        if (linedata.coin > 0) {
            CoinManger.instance.addCoin(linedata.coin, false);
            this.winNode.addWinCoin(linedata.coin);
            // ActionEffect.numAddAni(0, linedata.coin, (n: number) => { this.winNode.addWinCoin(n) }, true);
            this.board.showLineLight(linedata);
            if (linedata.winType > 0) {
                await this.showWinDialog(linedata.winType, linedata.coin);
            }
            if (this.btnSpin.isAuto || isFreeGame) {
                await this.delay(2);
            }
        }
        this.guidStpe2();
        if (!isFreeGame) {
            if (this.btnSpin.isAuto) {
                await this.delay(1);
                this.isAni = false;
                this.onSpin();
            } else {
                this.isAni = false;
            }
            if (GameManger.instance.calFreeGame()) {
                this.startFreeGame();
            }
        }



    }
    private showWinDialog(type: WinType, num: number) {
        return new Promise<void>(res => {
            ViewManager.showWinDialog(type, num, () => { res() });
        })

    }
    private moneyDialog() {
        return new Promise<number>(res => {
            ViewManager.showReward((n) => {
                res(n);
            })
        })
    }

    // private showWinCoin(num: number = 0) {
    //     // this.winCoin.node.parent.active = v;
    //     this.winCoin.num = num;
    //     this.showWinNodeScale(this.winCoin.node.parent);
    // }
    // private showWinMoney(moneyNum: number) {
    //     this.winMoney.num = "+" + FormatUtil.toXXDXXxsd(moneyNum);
    //     this.showWinNodeScale(this.winMoney.node.parent);
    // }
    // private showWinNormal() {
    //     this.winCoin.node.parent.active = false;
    //     this.winMoney.node.parent.active = false;
    //     this.winNode.scale = v3(1, 1, 1);
    //     this.winCoin.num = 0;
    //     this.winMoney.num = 0;
    // }
    // private showWinNodeScale(node: Node) {
    //     this.winNode.active = true;
    //     node.active = true;
    //     let num = 0;
    //     if (this.winCoin.node.parent.active) num++;
    //     if (this.winMoney.node.parent.active) num++;
    //     const sc = num == 1 ? 1.5 : 1;//只有一个就变大显示
    //     ActionEffect.scale(this.winNode, 0.1, sc, this.winNode.scale.x);
    // }

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
        this.gm.showSpin(this.btnSpin.node);
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




    public autoNext() {
        if (this.isAni) return;
        if (this.btnSpin.isAuto) {
            this.onSpin();
        }
    }


    private onForeground() {
        console.log('应用回到前台');
        // 恢复游戏逻辑
    }
}


