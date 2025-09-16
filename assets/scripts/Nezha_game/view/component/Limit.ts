import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { GameStorage } from '../../GameStorage_Nezha';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { LimitType } from '../../GameUtil_Nezha';
import { ViewManager } from '../../manager/ViewManger';
import { GameManger } from '../../manager/GameManager';
import { i18n } from '../../../Nezha_common/i18n/I18nManager';
const { ccclass, property } = _decorator;

@ccclass('Limit')
export class Limit extends Component {
    @property(Node)
    btn: Node = null;
    @property(NumFont)
    timeNum: NumFont = null;
    @property([Node])
    icons: Node[] = [];
    private curLimit: LimitType = 1;
    start() {
        this.btn.on(Button.EventType.CLICK, () => {
            if (GameManger.instance.isAni){ 
                ViewManager.showTips(i18n.string("str_pstf"));
                return;
            }
            const cur = this.curLimit;
            if (cur > 0) {
                ViewManager.showLimitDialog(this.curLimit, () => {
                    if (cur == this.curLimit) {
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
        await this.limitShow(0, 5);
        await this.limitShow(1);
        await this.limitShow(0, 5);
        await this.limitShow(2);
        this.limitLoopShow();
    }
    private async limitShow(cur: number, time: number = 30) {
        this.curLimit = cur;
        let show = false;
        const data = GameStorage.getLimit();
        if (cur == 1) {//钱标两个
            // show = data.cash <= 0;
            show = GameManger.instance.mustMoney <= 0;
        } else if (cur == 2) {//金莲两个
            // show = data.lotus <= 0;
            show = GameManger.instance.mustLotus <= 0;
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
            if (cur > 0) time = 5;//如果非空，等待短些
            await delay(time, this.node);
        }
    }
}


