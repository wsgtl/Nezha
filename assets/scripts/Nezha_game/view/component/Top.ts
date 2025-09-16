import { Button } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { ViewManager } from '../../manager/ViewManger';
import { Coin } from './Coin';
import { Money } from './Money';
import { CoinManger } from '../../manager/CoinManger';
import { Progress } from './Progress';
import { NumFont } from '../../../Nezha_common/ui/NumFont';
import { GameStorage } from '../../GameStorage_Nezha';
import { GameUtil, RewardType } from '../../GameUtil_Nezha';
import { tween } from 'cc';
import { GameManger } from '../../manager/GameManager';
import { AudioManager } from '../../manager/AudioManager';
import { i18n } from '../../../Nezha_common/i18n/I18nManager';
import { EventTracking } from '../../../Nezha_common/native/EventTracking';
const { ccclass, property } = _decorator;

@ccclass('Top')
export class Top extends Component {
    @property(Node)
    btnBack: Node = null;
    @property(Node)
    btnSetting: Node = null;
    @property(Node)
    btnRule: Node = null;

    @property(Coin)
    coinbg: Coin = null;
    @property(Money)
    moneybg: Money = null;

    @property(Progress)
    progress: Progress = null;
    @property(NumFont)
    lv: NumFont = null;
    @property(Node)
    lvbg: Node = null;
    @property(Node)
    lvTips: Node = null;

    protected onLoad(): void {
        this.btnRule.on(Button.EventType.CLICK, this.onRule, this);
        this.btnSetting.on(Button.EventType.CLICK, this.onSetting, this);
        this.btnBack.on(Button.EventType.CLICK, this.onBack, this);
        this.progress.node.on(Node.EventType.TOUCH_START, this.onLv, this);
        CoinManger.instance.curTop = this;
        this.showBack(false);
        this.showCurLevel();
    }

    onRule() {
        if (GameManger.instance.isAni){
            ViewManager.showTips(i18n.string("str_pstf"));
            return;
        }
        ViewManager.showRuleDialog();
    }
    onSetting() {
        if (GameManger.instance.isAni) {
            ViewManager.showTips(i18n.string("str_pstf"));
            return;
        }
        ViewManager.showSettings();
    }

    onBack() {
        this.cb?.();
        this.showBack(false);
    }
    onLv() {
        if (this.isLvAni) return;
        this.lvTipAni();
    }
    private cb: Function;

    showBack(v: boolean, cb: Function = null) {
        this.cb = cb;
        this.btnBack.active = v;
        this.btnRule.active = !v;
        this.btnSetting.active = !v;
        this.coinbg.canClick = !v;
        this.moneybg.canClick = !v;
    }

    /**显示当前关卡 */
    showCurLevel(isAni: boolean = false) {
        return new Promise<void>(res => {
            const lv = GameStorage.getCurLevel();
            const times = GameStorage.getCurLevelTimes();
            this.lv.num = "LV_" + lv;
            const all = GameUtil.getLevelTimes(lv);
            if (isAni) {
                tween(this.progress)
                    .to(0.1, { progress: times / all })
                    .call(() => { res() })
                    .start();
            } else {
                this.progress.progress = times / all;
                res();
            }
        })


    }
    /**增加一次 */
    async addTimes(upCb: Function) {
        const lv = GameStorage.getCurLevel();
        const times = GameStorage.getCurLevelTimes();
        const all = GameUtil.getLevelTimes(lv);
        GameStorage.setLevelTime(times + 1);
        await this.showCurLevel(true);
        if (times + 1 >= all) {
            GameStorage.nextLevel();
            GameStorage.setLevelTime(0);
            this.showCurLevel(true);
            //加5000金币
            this.lvUpReward();
            upCb();
            EventTracking.sendEventLevel(lv+1);
        }
    }
    private isLvAni: boolean = false;
    /**等级升级加金币 */
    private lvUpReward() {
        AudioManager.playEffect("next");
        this.isLvAni = true;
        tween(this.lvbg)
            .to(0.4, { y: -150 })
            .call(() => {
                ViewManager.showRewardParticle(RewardType.coin, this.lvbg, CoinManger.instance.getCoinNode().node.getChildByName("coin"), () => {
                    CoinManger.instance.addCoin(5000, false);
                }, 0.4)
            })
            .delay(1)
            .to(0.4, { y: 0 })
            .call(() => {
                this.isLvAni = false;
            })
            .start();
    }
    /**等级升级加金币 */
    private lvTipAni() {
        this.isLvAni = true;
        tween(this.lvTips)
            .to(0.4, { y: -150 })
            .delay(1.5)
            .to(0.4, { y: 0 })
            .call(() => {
                this.isLvAni = false;
            })
            .start();
    }
}


