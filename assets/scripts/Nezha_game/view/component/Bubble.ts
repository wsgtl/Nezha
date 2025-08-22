import { tween } from 'cc';
import { v3 } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { MoneyManger } from '../../manager/MoneyManger';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { FormatUtil } from '../../../Nezha_common/utils/FormatUtil';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { AudioManager } from '../../manager/AudioManager';
import { Tween } from 'cc';
import { LangStorage } from '../../../Nezha_common/localStorage/LangStorage';
const { ccclass, property } = _decorator;

@ccclass('Bubble')
export class Bubble extends Component {
    @property(NumFont)
    num: NumFont = null;
    private duration = 30;
    onLoad() {
        this.node.y = -100;
        const num = MoneyManger.instance.getReward(0.3);
        this.num.num = LangStorage.getData().symbol + FormatUtil.toXXDXXxsd(num);
        this.node.on(Node.EventType.TOUCH_START, () => {
            AudioManager.playEffect("click");
            this.canMove = false;
            let isFree = false;
            if (this.freeNum > 0) { this.freeNum = 0; isFree = true; }
            ViewManager.showLuckyWheelDialog(isFree, num, () => {
                this.canMove = true;
            });
            this.node.y = 0;
            Tween.stopAllByTarget(this.node);
        })
    }
    private freeNum = 1;
    private time = 0;
    private canMove: boolean = true;
    update(deltaTime: number) {
        if (!this.canMove) return;
        this.time -= deltaTime;
        if (this.time <= 0) {
            this.time = this.duration;//半分钟出气泡
            this.node.active = true;
            this.node.position = v3(700, 0);
            tween(this.node)
                .to(7, { position: v3(-450, 1200) })
                .to(7, { position: v3(700, 2400) })
                .call(() => {
                    this.node.y = -100;

                })
                .start();
        }
    }
}


