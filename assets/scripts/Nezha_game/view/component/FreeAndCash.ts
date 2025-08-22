import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameStorage } from '../../GameStorage_Nezha';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { LimitType } from '../../GameUtil_Nezha';
import { ViewManager } from '../../manager/ViewManger';
import { GameManger } from '../../manager/GameManager';
const { ccclass, property } = _decorator;

@ccclass('FreeAndCash')
export class FreeAndCash extends Component {
    @property(Node)
    btn: Node = null;
    @property(NumFont)
    timeNum: NumFont = null;
    @property([Node])
    icons: Node[] = [];
    private curLimit: LimitType = 1;
    start() {
        this.btn.on(Button.EventType.CLICK, () => {
            if(GameManger.instance.isAni)return;
            const cur = this.curLimit;
            if(cur>0){
                ViewManager.showLimitDialog(this.curLimit,()=>{
                    if(cur==this.curLimit){
                        this.showCurLimit(false);
                    }
                });
            }
        })
        this.limitLoopShow();
    }
    private showCurLimit(show: boolean) {
        // const show = this.curLimit > 0
        this.btn.active = show;
        if (show) {
            this.icons.forEach((v, i) => {
                v.active = i + 1 == this.curLimit;
            })
        }
    }
    /**限时活动循环显示 */
    private async limitLoopShow() {
        await this.limitShow(0,10);
        await this.limitShow(1);
        await this.limitShow(0,10);
        await this.limitShow(2);
        this.limitLoopShow();
    }
    private async limitShow(cur:number,time:number=30){
        this.curLimit = cur;
        let show = false;
        const data = GameStorage.getLimit();
        if ( cur== 1) {//两倍钱奖励5次
            show = data.cash <= 0;
        } else if (cur == 2) {//免费5次转轮
            show = data.free <= 0;
        } else {
            show = false;
        }
        this.showCurLimit(show);
        // const time = 30;
        if (show) {
            for (let i = time; i >= 0; i--) {
                this.timeNum.num = i;
                await delay(1, this.node);
            }
        } else {
            await delay(time, this.node);
        }
    }
}


