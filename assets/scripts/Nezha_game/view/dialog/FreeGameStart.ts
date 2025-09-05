import { _decorator, Component, Node } from 'cc';
import { DialogComponent } from '../../../Nezha_common/ui/DialogComtnet';
import { Button } from 'cc';
import { delay, tweenPromise } from '../../../Nezha_common/utils/TimeUtil';
import { isVaild } from '../../../Nezha_common/utils/ViewUtil';
import { tween } from 'cc';
import { ActionEffect } from '../../../Nezha_common/effects/ActionEffect';
import { Sprite } from 'cc';
import { AudioManager } from '../../manager/AudioManager';
import { v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FreeGameStart')
export class FreeGameStart extends DialogComponent {
    @property(Node)
    numNode: Node = null;
    @property(Node)
    btnStart: Node = null;
    @property(Sprite)
    btnMask: Sprite = null;
    @property([Node])
    aniNodes: Node[] = [];

    private num: number = 7;
    private cb: Function;
    show(parent: Node, args?: any): void {
        super.show(parent);

        this.num = args.num;
        this.cb = args.cb;
        this.numNode.children.forEach(v => v.active = false);
        const nn = this.numNode.getChildByName("d" + this.num);
        if (nn) nn.active = true;
        this.btnStart.on(Button.EventType.CLICK, this.onStart, this);



    }
    async onStart() {
        if (this.isAni) return;
        this.isAni = true;
        this.btnStart.getComponent(Button).interactable=false;
        await this.closeAni();
        this.cb?.();
        
    }

    /**开始动画 */
    async startAni() {
        this.isAni = true;
        if (this.bg) ActionEffect.fadeIn(this.bg, 0.3);
        const waitTimes = [0, 0.2, 0.25, 0.3, 0.4, 0.4];//各个动画节点等待出现时机
        const bigs = [1.3,1.2,1.2,1.2,1.2,1.1,1.1];//各个动画节点最大
        this.aniNodes.forEach(async (v, i) => {
            v.scale = v3();
            await delay(waitTimes[i]);
            // ActionEffect.scale(v, 0.4, 1, 0, "backOut");
            // ActionEffect.scaleBigToSmall(v,1.2,1,0.6);
            ActionEffect.scaleBigToSmall(v,bigs[i],1,0.6);
        })
        await delay(1, this.node);
        this.isAni = false; 
        this.waitBtn();
    }
    /**关闭动画 */
    async closeAni() {
        // if (this.isAni) return;
        // this.isAni = true;
        ActionEffect.fadeOut(this.bg, 1);
        const waitTimes = [0.4, 0.3, 0.25, 0.2, 0, 0];//各个动画节点等待出现时机
        this.aniNodes.forEach(async (v, i) => {
            await delay(waitTimes[i]);
            ActionEffect.scale(v, 0.4, 0, 1, "backIn");
        })
        await delay(1, this.node);
        
        this.node.destroy();
        this.closeCb?.();
    }
    async waitBtn(){
        const duration = 3;
        tweenPromise(this.btnMask, t => t.to(duration, { fillRange: 1 })).then(async () => {
            if (isVaild(this.node)) {
                this.onStart();
            }
        })
    }
}


