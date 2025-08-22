import { _decorator, Component, Node } from 'cc';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { delay } from '../../../Nezha_common/utils/TimeUtil';
import { AudioManager } from '../../manager/AudioManager';
import { ViewManager } from '../../manager/ViewManger';
import { v3 } from 'cc';
import { SpriteFrame } from 'cc';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bottom')
export class Bottom extends Component {
    @property(Node)
    btnHome: Node = null;
    @property(Node)
    btnShop: Node = null;
    @property(Node)
    btnTask: Node = null;
    @property(Node)
    di: Node = null;
    @property(Node)
    bg: Node = null;
    @property(Node)
    top: Node = null;
    @property([SpriteFrame])
    sf: SpriteFrame[] = [];

    private curDi: number = 0;
    private isAni: boolean = false;
    onLoad() {
        this.btnHome.on(Node.EventType.TOUCH_START, () => { this.onBtn(0); })
        this.btnShop.on(Node.EventType.TOUCH_START, () => { this.onBtn(-1); })
        this.btnTask.on(Node.EventType.TOUCH_START, () => { this.onBtn(1); })


        this.showBtns(false);
    }
    async onBtn(index: number) {
        if (this.curDi == index) return;
        if (this.isAni) return;
        this.curDi = index;
        this.showBtns(true);
        this.top.active = this.curDi!=0;
        await ViewManager.clearDialog(true);
        if (index == -1) {
            ViewManager.showShop();
        } else if (index == 1) {
            ViewManager.showTask();
        }
    }

    private async showBtns(isAni: boolean) {
        const btns = [this.btnShop, this.btnHome, this.btnTask];
        const time = 0.2;
        this.isAni = true;
        const mx = 230;
        this.bg.children.forEach((v, i) => {
            v.active = i == this.curDi + 1;
        })
        btns.forEach((v, i) => {
            const active = i == this.curDi + 1;
            const str = v.getChildByName("str");
            const icon = v.getChildByName("icon");
            icon.getComponent(Sprite).spriteFrame = this.sf[active?1:0];
            str.active = active;
            const x = this.curDi * 185;
            const y = active ? 65 : 0;
            const sc = active ? 1 : 0.8;
            const curX = Math.max(-mx, Math.min(mx, (i - this.curDi - 1) * 230 + x));
            if (isAni) {
                ActionEffect.moveTo(v, time, curX, 0);
                active ? ActionEffect.fadeIn(str, time) : ActionEffect.fadeOut(str, time);
                ActionEffect.moveTo(icon, time, icon.x, y);
                // ActionEffect.scale(icon, time, sc);
                ActionEffect.moveTo(this.di, time, x, this.di.y);
            } else {
                this.di.x = x;
                icon.y = y;
                // icon.scale = v3(sc, sc);
                v.x = curX;
            }
        })
        if (isAni) {
            AudioManager.playEffect("switch");
            await delay(time);
        }
        this.isAni = false;
    }
}


