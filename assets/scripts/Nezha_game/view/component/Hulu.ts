import { Sprite, tween } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
import { GameStorage } from '../../GameStorage_Nezha';
import { GameUtil } from '../../GameUtil_Nezha';
import { ViewManager } from '../../manager/ViewManger';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
const { ccclass, property } = _decorator;

@ccclass('Hulu')
export class Hulu extends Component {
    @property(Sprite)
    progress: Sprite = null;
    @property(Node)
    icon: Node = null;


    protected onLoad(): void {
        this.showProgress(false);
        // this.node.on(Node.EventType.TOUCH_START, () => {
        //     ViewManager.showLuckyDialog(() => {

        //     })
        // })
    }
    /**增加葫芦进度 */
    addProgress(num: number) {
        return new Promise<void>(res => {
            const t = GameStorage.getHulu();
            let cur = t + num;
            if (cur >= GameUtil.LotusNum) {
                this.showProgress(true, true, GameUtil.LotusNum);
                GameStorage.setHulu(0);
                delay(0.2).then(()=>{
                    ViewManager.showLuckyDialog(() => {
                        res();
                    })
                })
               
            } else {
                GameStorage.setHulu(cur);
                this.showProgress(true);
                res();
            }
            ActionEffect.scaleBigToSmall(this.icon, 1.2, 1, 0.2);
        })

    }
    private showProgress(isAni: boolean, isAll: boolean = false, cur: number = -1) {
        if (cur < 0)
            cur = GameStorage.getHulu();
        const jd = cur / GameUtil.LotusNum;
        if (isAni) {
            tween(this.progress)
                .to(0.2, { fillRange: jd })
                .call(async () => {
                    if (isAll) {
                        await delay(0.2);
                        this.progress.fillRange = 0;
                    }

                })
                .start();
        } else {
            this.progress.fillRange = jd;
        }

    }
}


