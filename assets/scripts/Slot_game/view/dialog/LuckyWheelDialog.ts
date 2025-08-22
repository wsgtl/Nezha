import { _decorator, Component, Node } from 'cc';
import { NumFont } from '../../../Slot_common/ui/NumFont';
import { Button } from 'cc';
import { DialogComponent } from '../../../Slot_common/ui/DialogComtnet';
import { adHelper } from '../../../Slot_common/native/AdHelper';
import { ViewManager } from '../../manager/ViewManger';
import { MathUtil } from '../../../Slot_common/utils/MathUtil';
import { ActionEffect } from '../../../Slot_common/effects/ActionEffect';
import { delay } from '../../../Slot_common/utils/TimeUtil';
import { AudioManager } from '../../manager/AudioManager';
import { RewardType } from '../../GameUtil_Slot';
import { CoinManger } from '../../manager/CoinManger';
import { FormatUtil } from '../../../Slot_common/utils/FormatUtil';
import { MoneyManger } from '../../manager/MoneyManger';
import { LangStorage } from '../../../Slot_common/localStorage/LangStorage';
const { ccclass, property } = _decorator;

@ccclass('LuckyWheelDialog')
export class LuckyWheelDialog extends DialogComponent {
    @property(Node)
    wheel: Node = null;
    @property(Node)
    sp: Node = null;
    @property(Node)
    btnFree: Node = null;
    @property(Node)
    btnNt: Node = null;
    @property(NumFont)
    num: NumFont = null;


    private isFree: boolean = false;
    cb: Function;
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.cb = args.cb;
        this.isFree = args.isFree;
        this.btnFree.on(Button.EventType.CLICK, () => {
            if (this.isAni) return;
            this.isAni = true;
            if (this.isFree) {
                this.startWheel();
            } else {
                adHelper.showRewardVideo("气泡转轮抽奖弹窗", () => {
                    this.startWheel();
                },
                    () => {
                        ViewManager.adNotReady();
                        this.isAni = false;
                    })
            }
        })
        this.btnNt.on(Button.EventType.CLICK, () => {
            this.closeAni();
            adHelper.timesToShowInterstitial();
        })
        this.sp.active = !this.isFree;
        // this.baseMoney = MoneyManger.instance.getReward(0.3);
        this.baseMoney = args.num;
        this.showCurMoney();

    }
    async closeAni() {
        await super.closeAni();
        this.cb();
    }
    private zzIndex: number = 0;
    private bls: number[] = [5, 2, 4, 2, 2, 3];
    private async startWheel() {
        const all = MathUtil.random(20, 25);
        const index = all % this.bls.length;
        for (let i = 0; i < all; i++) {
            AudioManager.playEffect("jump");
            await ActionEffect.angle(this.wheel, -60 * i, 0.06);
            // await delay(0.05,this.node);
            this.zzIndex = (i + 1) % this.bls.length;
            this.showCurMoney();
        }
        AudioManager.playEffect("happy2");

        await delay(0.7, this.node);
        AudioManager.playEffect("coin");
        const money = this.getCurMoney();
        ViewManager.showRewardParticle(RewardType.money, this.node, MoneyManger.instance.getMoneyNode().moneyNode, () => {
            MoneyManger.instance.addMoney(money,false);
        })
        this.isAni = false;
        this.closeAni();
    }
    private baseMoney: number = 0;
    private showCurMoney() {
        const num = this.getCurMoney();
        // const xsd = num > 1 ? 2 : (num > 0.01 ? 4 : 6);
        // this.num.num = FormatUtil.toXXDXX(num, xsd);
        this.num.num = LangStorage.getData().symbol + " " + FormatUtil.toXXDXXxsd(num);
    }
    private getCurMoney() {
        return this.baseMoney * this.bls[this.zzIndex];
    }

    /**开始动画 */
    async startAni() {
        this.isAni = true;
        this.content.active = false;
        ActionEffect.fadeIn(this.bg, 0.3);
        await delay(0.5);
        AudioManager.playEffect("stop");
        this.content.active = true;
        ActionEffect.scale(this.content, 0.3, 1, 0, "backOut");
        this.isAni = false;
    }
}


