import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Nezha_common/ui/DialogComtnet';
import { SpriteFrame } from 'cc';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { Sprite } from 'cc';
import { GameUtil, RewardType } from '../../GameUtil_Nezha';
import { MathUtil } from '../../../Nezha_common/utils/MathUtil';
import { Button } from 'cc';
import { adHelper } from '../../../Nezha_common/native/AdHelper';
import { GameStorage } from '../../GameStorage_Nezha';
import { CoinManger } from '../../manager/CoinManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { ViewManager } from '../../manager/ViewManger';
import { AudioManager } from '../../manager/AudioManager';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { isVaild } from '../../../Nezha_common/utils/ViewUtil';
import { Vec3 } from 'cc';
import { UIUtils } from '../../../Nezha_common/utils/UIUtils';
import { GuideManger } from '../../manager/GuideManager';
import { Money } from '../component/Money';
import { LangStorage } from '../../../Nezha_common/localStorage/LangStorage';
import { FormatUtil } from '../../../Nezha_common/utils/FormatUtil';
const { ccclass, property } = _decorator;

@ccclass('RewardDialog')
export class RewardDialog extends DialogComponent {
    @property(Node)
    btnReceive: Node = null;
    @property(Node)
    btnClaim: Node = null;
    @property(NumFont)
    num: NumFont = null;


    type: RewardType;
    cb: Function;
    private rewardNum: number = 1;//奖励数量
    private reciveNum: number = 2;//看广告领取倍率
    show(parent: Node, args?: any) {
        parent.addChild(this.node);
        this.init();
        this.cb = args.cb;
    }
    init() {
        AudioManager.playEffect("reward", 2);
        // this.type = type;


        // this.showReciveNum(2);
        const data = LangStorage.getData();
        const isGuide = GuideManger.isGuide() && GameStorage.getMoney() < 5;
        this.rewardNum = isGuide ? MoneyManger.instance.rate(GameUtil.GuideMoney)  : MoneyManger.instance.getReward();
        this.num.aligning = 1;
        this.num.num = data.symbol + " " + FormatUtil.toXXDXXxsd(this.rewardNum);
        // this.showMoneyNode();

        this.btnClaim.once(Button.EventType.CLICK, this.onBtnClaim, this);
        this.btnReceive.on(Button.EventType.CLICK, this.onBtnReceive, this);



    }

    onBtnClaim() {
        this.closeAni();
        this.addReward(this.rewardNum);
        adHelper.timesToShowInterstitial();
        // if (GameStorage.getCurLevel() > 1) {//第二局后有概率弹插屏广告
        //     adHelper.timesToShowInterstitial();
        // }
    }
    onBtnReceive() {
        adHelper.showRewardVideo("钱奖励弹窗", () => {
            this.addReward(this.rewardNum * this.reciveNum);
            this.closeAni();
        }, ViewManager.adNotReady)
    }
    private addReward(num: number) {
        // ViewManager.showRewardAni(1, num, this.cb);
        const cb = this.cb;
        ViewManager.showRewardParticle(RewardType.money, this.node, MoneyManger.instance.getMoneyNode().moneyNode, () => {
            cb(num);
            MoneyManger.instance.addMoney(num, false);
        })
    }




}


