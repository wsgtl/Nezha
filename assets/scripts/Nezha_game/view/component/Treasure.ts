import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameStorage } from '../../GameStorage_Nezha';
import { GameUtil } from '../../GameUtil_Nezha';
import { tween } from 'cc';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
import { ViewManager } from '../../manager/ViewManger';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
const { ccclass, property } = _decorator;

@ccclass('Treasure')
export class Treasure extends Component {
    @property(Sprite)
    progress: Sprite = null;
    @property(Node)
    treasure: Node = null;


    protected onLoad(): void {
        this.showProgress(false);
        // this.node.on(Node.EventType.TOUCH_START,()=>{
        //     ViewManager.showTreasureDialog(()=>{
               
        //     })
        // })
    }
    /**增加宝箱进度 */
    addProgress(num: number) {
        return new Promise<void>(res => {
            const t = GameStorage.getTreasure();
            let cur = t + num;
            if (cur >= GameUtil.TreasureNum) {
                this.showProgress(true, true,GameUtil.TreasureNum);
                GameStorage.setTreasure(0);
                delay(0.2).then(()=>{
                ViewManager.showTreasureDialog(()=>{
                    res();
                })
            })
            } else {
                GameStorage.setTreasure(cur);
                this.showProgress(true);
                res();
            }
            ActionEffect.scaleBigToSmall(this.treasure, 1.2, 1, 0.2);


        })

    }
    private showProgress(isAni: boolean, isAll: boolean = false, cur: number = -1) {
        if (cur < 0)
            cur = GameStorage.getTreasure();
        const jd = cur / GameUtil.TreasureNum;
        if (isAni) {
            tween(this.progress)
                .to(0.2, { fillRange: -jd })
                .call(async() => {
                    if (isAll){
                        await delay(0.2);
                        this.progress.fillRange = 0;
                    }
                       
                })
                .start();
        } else {
            this.progress.fillRange = -jd;
        }

    }
}


