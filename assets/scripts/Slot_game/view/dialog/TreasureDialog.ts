import { _decorator, Component, Node } from 'cc';
import ViewComponent from '../../../Slot_common/ui/ViewComponent';
import { Button } from 'cc';
import { instantiate } from 'cc';
import { Yb } from '../component/Yb';
import { v3 } from 'cc';
import { adHelper } from '../../../Slot_common/native/AdHelper';
import { JakcpotType, RewardType } from '../../GameUtil_Slot';
import { ViewManager } from '../../manager/ViewManger';
import { delay } from '../../../Slot_common/utils/TimeUtil';
import { MoneyManger } from '../../manager/MoneyManger';
import { AudioManager } from '../../manager/AudioManager';
import { ButtonLock } from '../../../Slot_common/Decorator';
const { ccclass, property } = _decorator;

@ccclass('TreasureDialog')
export class TreasureDialog extends ViewComponent {
    @property([Node])
    jackpots: Node[] = [];
    @property(Node)
    btnAdd: Node = null;
    @property(Node)
    btnClaim: Node = null;
    @property(Node)
    yb: Node = null;
    @property(Node)
    ybs: Node = null;
    @property(Node)
    hand: Node = null;

    cb: Function;
    private ybArr: Yb[] = [];
    /**固定奖池出现 */
    private randomJackpot: JakcpotType[] = [1, 1, 2, 2, 3, 3, 3];
    // private randomJackpot: JakcpotType[] = [1, 1, 1,2,2,2,3,3,3];
    /**奖池出现数 */
    private jackpotShowNum: number[] = [0, 0, 0, 0];
    private isInit: boolean = true;
    /**第一次弹窗后可以点击的次数 */
    private canClickNum: number = 0;
    show(parent: Node, args?: any): void {
        super.show(parent);
        this.cb = args.cb;
        this.randomJackpot.shuffle();
        this.init();
    }
    init() {
        this.showJackpotShowNum();
        this.showBtn(false);
        this.btnAdd.on(Button.EventType.CLICK, this.onBtnAdd, this);
        this.btnClaim.on(Button.EventType.CLICK, this.onBtnCliam, this);
        const w = 240;
        const h = 170;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                const yb = instantiate(this.yb);
                this.ybs.addChild(yb);
                const ybcom = yb.getComponent(Yb)
                this.ybArr[i * 4 + j] = ybcom;
                yb.position = v3((j - 1.5) * w, -(i - 1) * h);
                ybcom.hide();
                yb.on(Node.EventType.TOUCH_START, () => {
                    if (ybcom.isClick) return;
                    if (ybcom.isAd) {
                        this.onBtnAdd();
                    } else {
                        this.clickYb(ybcom);
                    }
                })
            }
        }
        this.yb.active = false;
    }

    showBtn(v: boolean) {
        this.btnAdd.active = v;
        this.btnClaim.active = v;
    }
    onBtnAdd() {
        adHelper.showRewardVideo("宝箱弹窗多开两个按钮",() => {
            this.canClickNum += 2;
            this.showAllAd(false);
        }, ViewManager.adNotReady);
    }
    onBtnCliam() {
        this.node.destroy();
        this.cb();
    }
    public showAllAd(isAd: boolean) {
        this.ybArr.forEach(v => {
            if (v.isClick) return;
            v.showAd(isAd);
        })
    }
    @ButtonLock(0.5)
    clickYb(ybcom: Yb) {
        this.hand.active = false;
        AudioManager.playEffect("yb");
        if (!this.isInit) {
            this.canClickNum--;
            if (this.canClickNum <= 0) {
                this.showAllAd(true);//显示要点击广告
            }
        }
        let type: JakcpotType = JakcpotType.mini;
        if (this.randomJackpot.length) {
            type = this.randomJackpot.pop();
        } else {
            const m = Math.random()
            type = m < 0.03 ? JakcpotType.grand : (m < 0.2 ? JakcpotType.major : JakcpotType.mini);//有概率出中奖池和大奖池
        }
        ybcom.show(type);
        this.jackpotShowNum[type]++;
        // this.showJackpotShowNum();
        this.flyAni(ybcom.node,type);
        if (this.jackpotShowNum[type] >= 3) {
            if (this.isInit) {
                this.showAllAd(true);//显示要点击广告
                this.isInit = false;
                this.showBtn(true);
            }
            this.jackpotShowNum[type] = 0;
            delay(0.5).then(() => {
                this.showJackpotShowNum();
            });
            ViewManager.showJackpotDialog(type, MoneyManger.instance.getReward());
        }
    }
    private showJackpotShowNum() {
        this.jackpots.forEach((v, i) => {
            const num = this.jackpotShowNum[i + 1];
            const dots = v.getChildByName("dots");
            for (let j = 0; j < 3; j++) {
                const d = dots.children[j].getChildByName("dot");
                d.active = j < num;
            }
        })
    }
    /**动画 */
    private flyAni(from:Node,type:JakcpotType){
        const num = this.jackpotShowNum[type];
        const p = this.jackpots[type-1];
        const dot = p.getChildByName("dots").getChildByName("d"+num);
        ViewManager.showRewardParticle(RewardType.none,from,dot,()=>{this.showJackpotShowNum();},0.3);
    }
}


